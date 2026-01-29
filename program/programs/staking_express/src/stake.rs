use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::*;
use crate::errors::StakingError;
use crate::events::*;
use crate::fees::*;
use crate::helpers::*;
use crate::math::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// Global configuration
    #[account(
        seeds = [seeds::GLOBAL_CONFIG],
        bump = global_config.bump,
        constraint = !global_config.paused @ StakingError::PoolPaused
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Staking pool
    #[account(
        mut,
        seeds = [seeds::STAKING_POOL],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    /// User's stake state
    #[account(
        init_if_needed,
        payer = user,
        space = UserStakeState::LEN,
        seeds = [seeds::USER_STAKE, user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStakeState>,

    /// Bonus pool
    #[account(
        mut,
        seeds = [seeds::BONUS_POOL],
        bump = bonus_pool.bump
    )]
    pub bonus_pool: Account<'info, BonusPool>,

    /// Referral pool
    #[account(
        mut,
        seeds = [seeds::REFERRAL_POOL],
        bump = referral_pool.bump
    )]
    pub referral_pool: Account<'info, ReferralPool>,

    /// Treasury wallet (receives 100 BPS)
    /// CHECK: Validated against global_config
    #[account(
        mut,
        constraint = treasury.key() == global_config.treasury @ StakingError::InvalidTreasury
    )]
    pub treasury: UncheckedAccount<'info>,

    /// Material Dart wallet (receives 50 BPS)
    /// CHECK: Validated against global_config
    #[account(
        mut,
        constraint = material_dart_wallet.key() == global_config.material_dart_wallet @ StakingError::InvalidMaterialDartWallet
    )]
    pub material_dart_wallet: UncheckedAccount<'info>,

    /// Optional referrer (if user was referred)
    /// CHECK: Validated against user input or stored logic
    #[account(mut)]
    pub referrer: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,
}

pub fn stake_handler(ctx: Context<Stake>, gross_amount: u64) -> Result<()> {
    // Validate minimum stake
    require!(gross_amount >= MIN_STAKE, StakingError::StakeTooSmall);

    let user_key = ctx.accounts.user.key();
    let staking_pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let bonus_pool = &mut ctx.accounts.bonus_pool;
    let referral_pool = &mut ctx.accounts.referral_pool;
    let current_timestamp = get_current_timestamp()?;

    // Calculate fee breakdown (10% total)
    let fees = calculate_stake_fee(gross_amount)?;
    verify_fee_breakdown(&fees)?;

    // ========== FEE DISTRIBUTION ==========

    // 1. Transfer 100 BPS to treasury (platform commission)
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        ),
        fees.platform,
    )?;

    // 2. Transfer 50 BPS to Material Dart team
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.material_dart_wallet.to_account_info(),
            },
        ),
        fees.material_dart,
    )?;

    //  3. Add 100 BPS to bonus pool
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: bonus_pool.to_account_info(),
            },
        ),
        fees.bonus_pool,
    )?;
    bonus_pool.balance = safe_add(bonus_pool.balance, fees.bonus_pool)?;

    // 4. Handle referral (50 BPS)
    let referrer_pubkey = if let Some(ref referrer) = ctx.accounts.referrer {
        // Referrer exists - pay directly
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: referrer.to_account_info(),
                },
            ),
            fees.referral,
        )?;

        Some(referrer.key())
    } else {
        // No referrer - add to referral pool
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: referral_pool.to_account_info(),
                },
            ),
            fees.referral,
        )?;
        referral_pool.balance = safe_add(referral_pool.balance, fees.referral)?;

        None
    };

    // 5. Transfer remaining funds (Net Stake + Stakers Fee) to Staking Pool Vault
    // This is 9700 BPS (9000 Net + 700 Stakers Reward)
    // We calculate this as gross_amount - distributed_external_fees
    let distributed_external_fees = fees
        .platform
        .checked_add(fees.material_dart)
        .ok_or(StakingError::MathOverflow)?
        .checked_add(fees.bonus_pool)
        .ok_or(StakingError::MathOverflow)?
        .checked_add(fees.referral)
        .ok_or(StakingError::MathOverflow)?;

    let vault_amount = gross_amount
        .checked_sub(distributed_external_fees)
        .ok_or(StakingError::MathUnderflow)?;

    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: staking_pool.to_account_info(),
            },
        ),
        vault_amount,
    )?;

    // 5. Update reward_per_share with 700 BPS for all stakers
    if staking_pool.total_staked > 0 {
        update_reward_per_share(staking_pool, fees.stakers)?;
    }
    // Note: User doesn't transfer the stakers fee - it stays with them as part of net_amount
    // The 700 BPS increases reward_per_share for existing stakers

    // ========== BONUS POOL MECHANICS ==========

    // Update last investment timestamp
    bonus_pool.last_investment_timestamp = current_timestamp;

    // If stake >= 1 SOL: extend countdown and update last-10
    if gross_amount >= BONUS_EXTENSION_THRESHOLD {
        // Extend countdown by 15 minutes
        extend_bonus_countdown(bonus_pool)?;

        // Add to last-10 circular buffer
        let position = add_to_last_ten(bonus_pool, user_key, gross_amount)?;

        emit!(InvestorAddedToLastTen {
            investor: user_key,
            amount: gross_amount,
            position,
            timestamp: current_timestamp,
        });

        emit!(BonusCountdownExtended {
            extended_by: BONUS_EXTENSION_SECONDS,
            new_expiry: bonus_pool.expiry_timestamp,
            staker: user_key,
            stake_amount: gross_amount,
            timestamp: current_timestamp,
        });
    }

    // ========== UPDATE USER STAKE ==========

    // Calculate pending rewards if user already has a stake
    let pending_rewards = if user_stake.staked_amount > 0 {
        get_pending_rewards(user_stake, staking_pool)?
    } else {
        0
    };

    // Initialize user stake if first time
    if user_stake.user == Pubkey::default() {
        user_stake.user = user_key;
        user_stake.pool = staking_pool.key();
        user_stake.staked_amount = 0;
        user_stake.reward_debt = 0;
        user_stake.stake_timestamp = current_timestamp;
        user_stake.last_claim_timestamp = current_timestamp;
        user_stake.referrer = referrer_pubkey;
        user_stake.bump = ctx.bumps.user_stake;
    }

    // Add net amount (90%) to user's stake
    user_stake.staked_amount = safe_add(user_stake.staked_amount, fees.net_amount)?;

    // Update reward debt to prevent double claims
    user_stake.reward_debt =
        calculate_reward_debt(user_stake.staked_amount, staking_pool.reward_per_share)?;

    // Update total staked in pool (net amount only)
    staking_pool.total_staked = safe_add(staking_pool.total_staked, fees.net_amount)?;
    staking_pool.last_update_timestamp = current_timestamp;

    // ========== EMIT EVENT ==========

    emit!(Staked {
        user: user_key,
        gross_amount,
        net_amount: fees.net_amount,
        fee_to_stakers: fees.stakers,
        fee_to_platform: fees.platform,
        fee_to_bonus: fees.bonus_pool,
        fee_to_referral: fees.referral,
        fee_to_material_dart: fees.material_dart,
        referrer: referrer_pubkey,
        total_staked_after: staking_pool.total_staked,
        reward_per_share_after: staking_pool.reward_per_share,
        timestamp: current_timestamp,
    });

    msg!(" ✅ Stake successful!");
    msg!("User: {}", user_key);
    msg!("Gross: {} lamports", gross_amount);
    msg!("Net staked: {} lamports", fees.net_amount);
    msg!("Total fee: {} lamports (10%)", fees.total_fee);
    msg!(
        "Pending rewards auto-compounded: {} lamports",
        pending_rewards
    );

    Ok(())
}
