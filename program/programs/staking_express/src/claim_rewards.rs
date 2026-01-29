use crate::errors::StakingError;
use crate::events::*;
use crate::helpers::*;
use crate::math::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
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
        mut,
        seeds = [seeds::USER_STAKE, user.key().as_ref(), staking_pool.key().as_ref()],
        bump = user_stake.bump,
        constraint = user_stake.user == user.key() @ StakingError::Unauthorized
    )]
    pub user_stake: Account<'info, UserStakeState>,

    pub system_program: Program<'info, System>,
}

pub fn claim_rewards_handler(ctx: Context<ClaimRewards>) -> Result<()> {
    let user_key = ctx.accounts.user.key();
    let staking_pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let current_timestamp = get_current_timestamp()?;

    // Calculate pending rewards
    let pending_rewards = get_pending_rewards(user_stake, staking_pool)?;

    // Validate rewards available
    require!(pending_rewards > 0, StakingError::NoRewardsAvailable);

    // Transfer rewards to user (NO FEE)
    **staking_pool.to_account_info().try_borrow_mut_lamports()? -= pending_rewards;
    **ctx
        .accounts
        .user
        .to_account_info()
        .try_borrow_mut_lamports()? += pending_rewards;

    // Update reward debt to prevent double claims
    user_stake.reward_debt =
        calculate_reward_debt(user_stake.staked_amount, staking_pool.reward_per_share)?;

    // Update last claim timestamp
    user_stake.last_claim_timestamp = current_timestamp;

    // Emit event
    emit!(RewardsClaimed {
        user: user_key,
        amount: pending_rewards,
        reward_debt_after: user_stake.reward_debt,
        timestamp: current_timestamp,
    });

    msg!("✅ Rewards claimed successfully!");
    msg!("User: {}", user_key);
    msg!("Rewards: {} lamports", pending_rewards);

    Ok(())
}
