use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::errors::StakingError;
use crate::events::*;
use crate::helpers::*;
use crate::math::*;
use crate::state::*;

#[derive(Accounts)]
pub struct DistributeReferralPool<'info> {
    /// Authority only (admin-controlled)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Global configuration
    #[account(
        seeds = [seeds::GLOBAL_CONFIG],
        bump = global_config.bump,
        constraint = authority.key() == global_config.authority @ StakingError::Unauthorized
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Staking pool
    #[account(
        mut,
        seeds = [seeds::STAKING_POOL],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    /// Referral pool
    #[account(
        mut,
        seeds = [seeds::REFERRAL_POOL],
        bump = referral_pool.bump
    )]
    pub referral_pool: Account<'info, ReferralPool>,

    pub system_program: Program<'info, System>,
}

pub fn distribute_referral_pool_handler(
    ctx: Context<DistributeReferralPool>,
    force: bool,
) -> Result<()> {
    let staking_pool = &mut ctx.accounts.staking_pool;
    let referral_pool = &mut ctx.accounts.referral_pool;
    let current_timestamp = get_current_timestamp()?;

    // Check if 30-day period has ended (or force distribution)
    let distribution_due = check_referral_distribution_due(referral_pool, current_timestamp);

    require!(
        distribution_due || force,
        StakingError::ReferralPeriodNotEnded
    );

    // Validate referral pool has balance
    require!(
        referral_pool.balance > 0,
        StakingError::BonusPoolEmpty // Reusing error
    );

    let total_to_distribute = referral_pool.balance;

    // Calculate distribution: 50% / 50%
    let (to_stakers, carry_forward) = calculate_referral_distribution(total_to_distribute)?;

    // ========== DISTRIBUTE TO ALL STAKERS ==========

    if to_stakers > 0 && staking_pool.total_staked > 0 {
        // Update reward_per_share for all stakers
        update_reward_per_share(staking_pool, to_stakers)?;

        // Transfer from referral pool to staking pool
        let pool_pda_seeds = &[seeds::REFERRAL_POOL, &[referral_pool.bump]];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: referral_pool.to_account_info(),
                    to: staking_pool.to_account_info(),
                },
                &[pool_pda_seeds],
            ),
            to_stakers,
        )?;

        // Update referral pool balance
        referral_pool.balance = carry_forward;
        referral_pool.total_distributed = safe_add(referral_pool.total_distributed, to_stakers)?;
    }

    // ========== RESET 30-DAY TIMER ==========

    referral_pool.last_distribution_timestamp = current_timestamp;
    referral_pool.next_distribution_timestamp =
        current_timestamp + crate::constants::REFERRAL_DISTRIBUTION_PERIOD;

    // ========== EMIT EVENT ==========

    emit!(ReferralPoolDistributed {
        total_distributed: safe_add(to_stakers, carry_forward)?,
        to_stakers,
        carried_forward: carry_forward,
        next_distribution: referral_pool.next_distribution_timestamp,
        timestamp: current_timestamp,
    });

    msg!("✅ Referral pool distributed!");
    msg!("To stakers: {} lamports (50%)", to_stakers);
    msg!("Carried forward: {} lamports (50%)", carry_forward);
    msg!(
        "Next distribution: {} (30 days)",
        referral_pool.next_distribution_timestamp
    );

    Ok(())
}
