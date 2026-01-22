
use anchor_lang::prelude::*;
use crate::state::*;
use crate::math::*;

/// Helper functions used across multiple instructions

/// Calculate pending rewards for a stake account
/// 
/// Uses the reward-per-token model to calculate accurate rewards
/// even when total stake changes over time.
/// 
/// Formula: pending = (staked_amount * (current_reward_per_token - reward_debt)) / SCALE
pub fn calculate_pending_rewards(
    stake_account: &StakeAccount,
    current_reward_per_token: u128,
) -> Result<u64> {
    if stake_account.amount == 0 {
        return Ok(0);
    }
    
    let reward_diff = safe_sub_u128(current_reward_per_token, stake_account.reward_debt)?;
    let pending_scaled = safe_mul_u128(u64_to_u128(stake_account.amount), reward_diff)?;
    
    // Scale down by 1e18 (precision factor)
    unscale_value(pending_scaled, 1_000_000_000_000_000_000)
}

/// Update reward per token stored value
/// 
/// Called before any stake/unstake to ensure accurate reward tracking
pub fn update_reward_per_token(
    pool: &mut StakingPool,
    current_time: i64,
) -> Result<()> {
    if pool.total_staked == 0 {
        pool.last_update_time = current_time;
        return Ok(());
    }
    
    let time_elapsed = safe_sub_u64(
        current_time as u64,
        pool.last_update_time as u64,
    )?;
    
    if time_elapsed == 0 {
        return Ok(());
    }
    
    // Calculate rewards generated in this period
    let rewards_generated = safe_mul_u64(time_elapsed, pool.reward_rate)?;
    
    // Scale up for precision (1e18)
    let rewards_scaled = scale_value(rewards_generated, 1_000_000_000_000_000_000)?;
    
    // Divide by total staked to get per-token reward
    let reward_per_token_increase = safe_div_u128(
        rewards_scaled,
        u64_to_u128(pool.total_staked),
    )?;
    
    pool.reward_per_token_stored = safe_add_u128(
        pool.reward_per_token_stored,
        reward_per_token_increase,
    )?;
    
    pool.last_update_time = current_time;
    
    Ok(())
}

/// Validate amount is within acceptable range
pub fn validate_amount(amount: u64, min_amount: u64) -> Result<()> {
    require!(
        amount > 0 && amount >= min_amount,
        crate::errors::StakingError::InvalidAmount
    );
    Ok(())
}

/// Check if tokens are still locked
pub fn is_locked(stake_time: i64, lock_duration: i64, current_time: i64) -> bool {
    if lock_duration == 0 {
        return false;
    }
    
    let unlock_time = stake_time + lock_duration;
    current_time < unlock_time
}

/// Get current timestamp from Clock sysvar
pub fn get_current_timestamp() -> Result<i64> {
    Ok(Clock::get()?.unix_timestamp)
}
