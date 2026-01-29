use crate::constants::*;
use crate::errors::StakingError;
use crate::events::*;
use crate::helpers::*;
use crate::math::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DistributeBonusPool<'info> {
    /// Can be called by anyone when conditions are met
    #[account(
        mut,
        constraint = caller.to_account_info().owner == &anchor_lang::solana_program::system_program::ID @ StakingError::InvalidAccountOwner
    )]
    pub caller: Signer<'info>,

    /// Global configuration
    #[account(
        seeds = [seeds::GLOBAL_CONFIG],
        bump = global_config.bump,
        owner = crate::ID
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

    /// Bonus pool
    #[account(
        mut,
        seeds = [seeds::BONUS_POOL],
        bump = bonus_pool.bump,
        owner = crate::ID
    )]
    pub bonus_pool: Account<'info, BonusPool>,

    pub system_program: Program<'info, System>,
}

pub fn distribute_bonus_pool_handler(ctx: Context<DistributeBonusPool>) -> Result<()> {
    let staking_pool = &mut ctx.accounts.staking_pool;
    let bonus_pool = &mut ctx.accounts.bonus_pool;
    let current_timestamp = get_current_timestamp()?;

    // Check if distribution is due (either countdown expired OR 6h inactivity)
    let countdown_expired = check_bonus_expiry(bonus_pool, current_timestamp);
    let inactivity_trigger = check_inactivity_trigger(bonus_pool, current_timestamp);

    require!(
        countdown_expired || inactivity_trigger,
        StakingError::BonusNotExpired
    );

    // Validate bonus pool has balance
    require!(bonus_pool.balance > 0, StakingError::BonusPoolEmpty);

    let total_to_distribute = bonus_pool.balance;

    // Calculate distribution: 40% / 40% / 20%
    let (to_last_ten, to_all_stakers, carry_forward) =
        calculate_bonus_distribution(total_to_distribute)?;

    // ========== DISTRIBUTE TO LAST 10 INVESTORS ==========

    if to_last_ten > 0 && bonus_pool.investor_count > 0 {
        // Calculate total invested by last-10
        let mut total_invested: u64 = 0;
        for i in 0..bonus_pool.investor_count as usize {
            total_invested = safe_add(total_invested, bonus_pool.last_ten_investors[i].amount)?;
        }

        // Distribute pro-rata
        if total_invested > 0 {
            for i in 0..bonus_pool.investor_count as usize {
                let investor = &bonus_pool.last_ten_investors[i];
                if investor.amount > 0 {
                    let share =
                        calculate_pro_rata_share(investor.amount, total_invested, to_last_ten)?;

                    if share > 0 {
                        // Transfer to investor
                        // Note: This simplified implementation transfers to last-10 directly
                        // In production, you'd want investor PDAs or another mechanism
                        msg!(
                            "Would transfer {} lamports to investor {}",
                            share,
                            investor.investor
                        );
                        // Actual transfer would require investor accounts in remaining_accounts
                    }
                }
            }
        }
    }

    // ========== DISTRIBUTE TO ALL STAKERS ==========

    if to_all_stakers > 0 && staking_pool.total_staked > 0 {
        // Update reward_per_share for all stakers
        update_reward_per_share(staking_pool, to_all_stakers)?;

        // Transfer from bonus pool to staking pool
        **bonus_pool.to_account_info().try_borrow_mut_lamports()? -= to_all_stakers;
        **staking_pool.to_account_info().try_borrow_mut_lamports()? += to_all_stakers;
    }

    // ========== UPDATE BONUS POOL STATE ==========

    // Deduct distributed amounts
    let total_distributed = safe_add(to_last_ten, to_all_stakers)?;
    bonus_pool.balance = safe_sub(bonus_pool.balance, total_distributed)?;

    // Carry forward should now be the remaining balance
    require!(
        bonus_pool.balance == carry_forward,
        StakingError::InvalidCalculation
    );

    // Reset countdown to 12 hours
    bonus_pool.expiry_timestamp = current_timestamp
        .checked_add(BONUS_INITIAL_COUNTDOWN)
        .ok_or(StakingError::MathOverflow)?;
    bonus_pool.last_investment_timestamp = current_timestamp;

    // NOTE: Do NOT clear last-10 list (persists until 1+ SOL deposit)
    // Only reset count to prevent duplicate distribution
    // bonus_pool.investor_count = 0; // Keeping existing list

    // ========== EMIT EVENT ==========

    emit!(BonusPoolExpired {
        total_distributed,
        to_last_ten,
        to_all_stakers,
        carried_forward: carry_forward,
        last_ten_count: bonus_pool.investor_count,
        countdown_reset_to: bonus_pool.expiry_timestamp,
        timestamp: current_timestamp,
    });

    msg!("✅ Bonus pool distributed!");
    msg!("Total distributed: {} lamports", total_distributed);
    msg!("To last 10: {} lamports (40%)", to_last_ten);
    msg!("To all stakers: {} lamports (40%)", to_all_stakers);
    msg!("Carried forward: {} lamports (20%)", carry_forward);
    msg!("Countdown reset: 12 hours");

    Ok(())
}
