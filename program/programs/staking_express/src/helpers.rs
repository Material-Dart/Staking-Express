use crate::constants::*;
use crate::errors::StakingError;
use crate::math::*;
use crate::state::*;
use anchor_lang::prelude::*;

/// Update reward per share in staking pool
///
/// Formula: reward_per_share += (fee_amount * REWARD_PRECISION) / total_staked
pub fn update_reward_per_share(pool: &mut StakingPool, fee_amount: u64) -> Result<()> {
    if pool.total_staked == 0 {
        // No stakers yet, fee goes to bonus/treasury but not tracked in reward_per_share
        return Ok(());
    }

    let increase = calculate_reward_per_share_increase(fee_amount, pool.total_staked)?;
    pool.reward_per_share = safe_add_u128(pool.reward_per_share, increase)?;

    Ok(())
}

/// Calculate pending rewards for a user
///
/// Formula: pending = (staked_amount * reward_per_share / PRECISION) - reward_debt
pub fn get_pending_rewards(user: &UserStakeState, pool: &StakingPool) -> Result<u64> {
    calculate_pending_rewards(user.staked_amount, pool.reward_per_share, user.reward_debt)
}

/// Extend bonus pool countdown
///
/// Adds BONUS_EXTENSION_SECONDS (15 minutes) to the expiry timestamp
pub fn extend_bonus_countdown(bonus_pool: &mut BonusPool) -> Result<()> {
    let new_expiry = bonus_pool
        .expiry_timestamp
        .checked_add(BONUS_EXTENSION_SECONDS)
        .ok_or(StakingError::MathOverflow)?;

    bonus_pool.expiry_timestamp = new_expiry;
    Ok(())
}

/// Add investor to last-10 circular buffer
///
/// Only called when stake amount >= 1 SOL
pub fn add_to_last_ten(bonus_pool: &mut BonusPool, investor: Pubkey, amount: u64) -> Result<u8> {
    // Add to circular buffer
    let position = bonus_pool.current_position as usize;
    bonus_pool.last_ten_investors[position] = LastTenInvestor { investor, amount };

    // Update position (0-9 circular)
    let new_position = (bonus_pool.current_position + 1) % (MAX_LAST_TEN_INVESTORS as u8);
    bonus_pool.current_position = new_position;

    // Increment count if not yet filled
    if (bonus_pool.investor_count as usize) < MAX_LAST_TEN_INVESTORS {
        bonus_pool.investor_count += 1;
    }

    Ok(position as u8)
}

/// Check if bonus pool countdown has expired
pub fn check_bonus_expiry(bonus_pool: &BonusPool, current_timestamp: i64) -> bool {
    current_timestamp >= bonus_pool.expiry_timestamp
}

/// Check if 6-hour inactivity trigger is met
pub fn check_inactivity_trigger(bonus_pool: &BonusPool, current_timestamp: i64) -> bool {
    let time_since_last_investment = current_timestamp - bonus_pool.last_investment_timestamp;
    time_since_last_investment >= BONUS_INACTIVITY_THRESHOLD
}

/// Calculate bonus pool distribution amounts
///
/// Returns: (to_last_ten, to_all_stakers, carry_forward)
pub fn calculate_bonus_distribution(total_bonus: u64) -> Result<(u64, u64, u64)> {
    // 40% to last 10 investors
    let to_last_ten = calculate_bps_percentage(total_bonus, 4000)?; // 40%

    // 40% to all stakers
    let to_all_stakers = calculate_bps_percentage(total_bonus, 4000)?; // 40%

    // 20% carry forward
    let carry_forward = calculate_bps_percentage(total_bonus, 2000)?; // 20%

    // Verify sum (accounting for rounding)
    let total_distributed = to_last_ten
        .checked_add(to_all_stakers)
        .and_then(|sum| sum.checked_add(carry_forward))
        .ok_or(StakingError::MathOverflow)?;

    // Due to floor rounding, total_distributed might be slightly less than total_bonus
    // Add any remainder to carry_forward
    let remainder = total_bonus.saturating_sub(total_distributed);
    let carry_forward_final = carry_forward
        .checked_add(remainder)
        .ok_or(StakingError::MathOverflow)?;

    Ok((to_last_ten, to_all_stakers, carry_forward_final))
}

/// Calculate referral pool distribution amounts
///
/// Returns: (to_stakers, carry_forward)
pub fn calculate_referral_distribution(total_pool: u64) -> Result<(u64, u64)> {
    // 50% to stakers
    let to_stakers = calculate_bps_percentage(total_pool, 5000)?; // 50%

    // 50% carry forward
    let carry_forward = total_pool.saturating_sub(to_stakers);

    Ok((to_stakers, carry_forward))
}

/// Check if referral pool distribution period has ended
pub fn check_referral_distribution_due(
    referral_pool: &ReferralPool,
    current_timestamp: i64,
) -> bool {
    current_timestamp >= referral_pool.next_distribution_timestamp
}

/// Helper to calculate percentage using basis points
fn calculate_bps_percentage(amount: u64, bps: u64) -> Result<u64> {
    let numerator = safe_mul(amount, bps)?;
    safe_div(numerator, BPS_DENOMINATOR)
}

/// Get current timestamp from Clock sysvar
pub fn get_current_timestamp() -> Result<i64> {
    let clock = Clock::get()?;
    Ok(clock.unix_timestamp)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bonus_distribution_40_40_20() {
        let total = 1_000_000_000; // 1 SOL

        let (last_ten, stakers, carry) = calculate_bonus_distribution(total).unwrap();

        // 40% = 400_000_000
        // 40% = 400_000_000
        // 20% = 200_000_000
        assert_eq!(last_ten, 400_000_000);
        assert_eq!(stakers, 400_000_000);
        assert_eq!(carry, 200_000_000);

        // Sum should equal total
        assert_eq!(last_ten + stakers + carry, total);
    }

    #[test]
    fn test_referral_distribution_50_50() {
        let total = 1_000_000_000; // 1 SOL

        let (stakers, carry) = calculate_referral_distribution(total).unwrap();

        // 50% each = 500_000_000
        assert_eq!(stakers, 500_000_000);
        assert_eq!(carry, 500_000_000);

        assert_eq!(stakers + carry, total);
    }
}
