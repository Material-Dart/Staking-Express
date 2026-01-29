use crate::constants::*;
use crate::errors::StakingError;
use crate::events::*;
use crate::fees::*;
use crate::helpers::*;
use crate::math::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(
        mut,
        constraint = user.to_account_info().owner == &anchor_lang::solana_program::system_program::ID @ StakingError::InvalidAccountOwner
    )]
    pub user: Signer<'info>,

    /// Global configuration
    #[account(
        seeds = [seeds::GLOBAL_CONFIG],
        bump = global_config.bump,
        owner = crate::ID,
        constraint = !global_config.paused @ StakingError::PoolPaused
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Staking pool
    #[account(
        mut,
        seeds = [seeds::STAKING_POOL],
        bump = staking_pool.bump,
        owner = crate::ID
    )]
    pub staking_pool: Account<'info, StakingPool>,

    /// User's stake state
    #[account(
        mut,
        seeds = [seeds::USER_STAKE, user.key().as_ref(), staking_pool.key().as_ref()],
        bump = user_stake.bump,
        owner = crate::ID,
        constraint = user_stake.user == user.key() @ StakingError::Unauthorized
    )]
    pub user_stake: Account<'info, UserStakeState>,

    /// Bonus pool (receives 100 BPS)
    #[account(
        mut,
        seeds = [seeds::BONUS_POOL],
        bump = bonus_pool.bump,
        owner = crate::ID
    )]
    pub bonus_pool: Account<'info, BonusPool>,

    /// Referral pool (receives 50 BPS if no referrer)
    #[account(
        mut,
        seeds = [seeds::REFERRAL_POOL],
        bump = referral_pool.bump,
        owner = crate::ID
    )]
    pub referral_pool: Account<'info, ReferralPool>,

    /// Staking pool account (PDA, holds staker funds)
    #[account(
        mut,
        seeds = [seeds::STAKING_POOL],
        bump = staking_pool.bump
    )]
    pub pool_vault: Account<'info, StakingPool>,

    /// CHECK: Validated against global_config and owner checked
    #[account(
        mut,
        owner = anchor_lang::solana_program::system_program::ID,
        constraint = treasury.key() == global_config.treasury @ StakingError::InvalidTreasury
    )]
    pub treasury: UncheckedAccount<'info>,

    /// CHECK: Validated against global_config and owner checked
    #[account(
        mut,
        owner = anchor_lang::solana_program::system_program::ID,
        constraint = material_dart_wallet.key() == global_config.material_dart_wallet @ StakingError::InvalidMaterialDartWallet
    )]
    pub material_dart_wallet: UncheckedAccount<'info>,

    /// Optional referrer (if user was referred)
    /// CHECK: Taken from user_stake.referrer
    #[account(
        mut,
        owner = anchor_lang::solana_program::system_program::ID
    )]
    pub referrer: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,
}

pub fn unstake_handler(ctx: Context<Unstake>, gross_unstake_amount: u64) -> Result<()> {
    // Validate minimum unstake
    require!(
        gross_unstake_amount >= MIN_UNSTAKE,
        StakingError::UnstakeTooSmall
    );

    let user_key = ctx.accounts.user.key();
    let staking_pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let bonus_pool = &mut ctx.accounts.bonus_pool;
    let referral_pool = &mut ctx.accounts.referral_pool;
    let current_timestamp = get_current_timestamp()?;

    // Validate user has sufficient staked balance
    require!(
        user_stake.staked_amount >= gross_unstake_amount,
        StakingError::InsufficientStake
    );

    // ========== CALCULATE PENDING REWARDS (NO FEE) ==========
    let pending_rewards = get_pending_rewards(user_stake, staking_pool)?;

    // ========== CALCULATE UNSTAKE FEE (10%) ==========
    let fees = calculate_unstake_fee(gross_unstake_amount)?;
    verify_fee_breakdown(&fees)?;

    // ========== FEE DISTRIBUTION (FROM UNSTAKE AMOUNT) ==========

    // Fees are deducted from the unstaked amount
    // User receives: pending_rewards (no fee) + net_unstake_amount (90%)

    // 1. Transfer 100 BPS to treasury
    **staking_pool.to_account_info().try_borrow_mut_lamports()? -= fees.platform;
    **ctx
        .accounts
        .treasury
        .to_account_info()
        .try_borrow_mut_lamports()? += fees.platform;

    // 2. Transfer 50 BPS to Material Dart
    **staking_pool.to_account_info().try_borrow_mut_lamports()? -= fees.material_dart;
    **ctx
        .accounts
        .material_dart_wallet
        .to_account_info()
        .try_borrow_mut_lamports()? += fees.material_dart;

    // 3. Transfer 100 BPS to bonus pool
    // Note: Bonus Pool is also a PDA owned by this program.
    // We can just move lamports directly.
    **staking_pool.to_account_info().try_borrow_mut_lamports()? -= fees.bonus_pool;
    **bonus_pool.to_account_info().try_borrow_mut_lamports()? += fees.bonus_pool;

    bonus_pool.balance = safe_add(bonus_pool.balance, fees.bonus_pool)?;

    // 4. Handle referral (50 BPS)
    if let Some(referrer_pubkey) = user_stake.referrer {
        if let Some(ref referrer_account) = ctx.accounts.referrer {
            require!(
                referrer_account.key() == referrer_pubkey,
                StakingError::InvalidAccountOwner
            );

            // Pay referrer directly
            **staking_pool.to_account_info().try_borrow_mut_lamports()? -= fees.referral;
            **referrer_account
                .to_account_info()
                .try_borrow_mut_lamports()? += fees.referral;
        } else {
            return Err(StakingError::InvalidAmount.into());
        }
    } else {
        // No referrer - add to referral pool
        // Referral Pool is likely a PDA owned by this program too.
        **staking_pool.to_account_info().try_borrow_mut_lamports()? -= fees.referral;
        **referral_pool.to_account_info().try_borrow_mut_lamports()? += fees.referral;

        referral_pool.balance = safe_add(referral_pool.balance, fees.referral)?;
    }

    // 5. Update reward_per_share with 700 BPS for remaining stakers
    if staking_pool.total_staked > gross_unstake_amount {
        update_reward_per_share(staking_pool, fees.stakers)?;
    }

    // ========== TRANSFER TO USER ==========

    // Transfer pending rewards (NO FEE)
    if pending_rewards > 0 {
        **staking_pool.to_account_info().try_borrow_mut_lamports()? -= pending_rewards;
        **ctx
            .accounts
            .user
            .to_account_info()
            .try_borrow_mut_lamports()? += pending_rewards;
    }

    // Transfer net unstake amount (90%)
    **staking_pool.to_account_info().try_borrow_mut_lamports()? -= fees.net_amount;
    **ctx
        .accounts
        .user
        .to_account_info()
        .try_borrow_mut_lamports()? += fees.net_amount;

    // ========== UPDATE STATE ==========

    // Update user's staked amount
    user_stake.staked_amount = safe_sub(user_stake.staked_amount, gross_unstake_amount)?;

    // Update reward debt
    user_stake.reward_debt =
        calculate_reward_debt(user_stake.staked_amount, staking_pool.reward_per_share)?;

    // Update pool's total staked
    staking_pool.total_staked = safe_sub(staking_pool.total_staked, gross_unstake_amount)?;
    staking_pool.last_update_timestamp = current_timestamp;

    // ========== EMIT EVENT ==========

    emit!(Unstaked {
        user: user_key,
        gross_amount: gross_unstake_amount,
        net_amount: fees.net_amount,
        rewards_claimed: pending_rewards,
        fee_to_stakers: fees.stakers,
        fee_to_platform: fees.platform,
        fee_to_bonus: fees.bonus_pool,
        fee_to_referral: fees.referral,
        fee_to_material_dart: fees.material_dart,
        total_staked_after: staking_pool.total_staked,
        timestamp: current_timestamp,
    });

    msg!("✅ Unstake successful!");
    msg!("User: {}", user_key);
    msg!("Unstaked: {} lamports", gross_unstake_amount);
    msg!("Rewards claimed: {} lamports (NO FEE)", pending_rewards);
    msg!("Net received: {} lamports (90%)", fees.net_amount);
    msg!("Unstake fee: {} lamports (10%)", fees.total_fee);

    Ok(())
}
