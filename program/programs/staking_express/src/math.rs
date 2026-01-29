use crate::errors::StakingError;
use anchor_lang::prelude::*;

/// Safe addition with overflow check
///
/// Returns error if a + b would overflow u64
pub fn safe_add(a: u64, b: u64) -> Result<u64> {
    a.checked_add(b).ok_or(StakingError::MathOverflow.into())
}

/// Safe subtraction with underflow check
///
/// Returns error if a < b
pub fn safe_sub(a: u64, b: u64) -> Result<u64> {
    a.checked_sub(b).ok_or(StakingError::MathUnderflow.into())
}

/// Safe multiplication with overflow check
///
/// Returns error if a * b would overflow u64
pub fn safe_mul(a: u64, b: u64) -> Result<u64> {
    a.checked_mul(b).ok_or(StakingError::MathOverflow.into())
}

/// Safe division with division-by-zero check
///
/// Returns error if divisor is zero
pub fn safe_div(a: u64, b: u64) -> Result<u64> {
    if b == 0 {
        return Err(StakingError::DivisionByZero.into());
    }
    Ok(a / b)
}

/// Safe addition for u128 with overflow check
pub fn safe_add_u128(a: u128, b: u128) -> Result<u128> {
    a.checked_add(b).ok_or(StakingError::MathOverflow.into())
}

/// Safe multiplication for u128 with overflow check
pub fn safe_mul_u128(a: u128, b: u128) -> Result<u128> {
    a.checked_mul(b).ok_or(StakingError::MathOverflow.into())
}

/// Safe division for u128 with division-by-zero check
pub fn safe_div_u128(a: u128, b: u128) -> Result<u128> {
    if b == 0 {
        return Err(StakingError::DivisionByZero.into());
    }
    Ok(a / b)
}

/// Calculate reward per share increase from a fee amount
///
/// Formula: delta_rps = (fee_amount * REWARD_PRECISION) / total_staked
///
/// Uses u128 to prevent overflow in intermediate calculation
pub fn calculate_reward_per_share_increase(fee_amount: u64, total_staked: u64) -> Result<u128> {
    if total_staked == 0 {
        return Err(StakingError::DivisionByZero.into());
    }

    // Convert to u128 for intermediate calculation
    let fee_amount_u128 = fee_amount as u128;
    let total_staked_u128 = total_staked as u128;
    let precision = crate::constants::REWARD_PRECISION;

    // Calculate: (fee_amount * 1e12) / total_staked
    let numerator = safe_mul_u128(fee_amount_u128, precision)?;
    let increase = safe_div_u128(numerator, total_staked_u128)?;

    Ok(increase)
}

/// Calculate pending rewards for a user
///
/// Formula: pending = (staked_amount * reward_per_share / PRECISION) - reward_debt
pub fn calculate_pending_rewards(
    staked_amount: u64,
    reward_per_share: u128,
    reward_debt: u128,
) -> Result<u64> {
    let staked_u128 = staked_amount as u128;
    let precision = crate::constants::REWARD_PRECISION;

    // Calculate: staked_amount * reward_per_share
    let earned = safe_mul_u128(staked_u128, reward_per_share)?;

    // Divide by precision
    let earned_scaled = safe_div_u128(earned, precision)?;

    // Subtract reward debt
    if earned_scaled < reward_debt {
        return Ok(0); // No rewards if debt exceeds earnings
    }

    let pending = earned_scaled - reward_debt;

    // Convert back to u64 (should always fit if staked_amount was u64)
    if pending > u64::MAX as u128 {
        return Err(StakingError::MathOverflow.into());
    }

    Ok(pending as u64)
}

/// Calculate new reward debt after staking/unstaking
///
/// Formula: reward_debt = staked_amount * reward_per_share / PRECISION
pub fn calculate_reward_debt(staked_amount: u64, reward_per_share: u128) -> Result<u128> {
    let staked_u128 = staked_amount as u128;
    let precision = crate::constants::REWARD_PRECISION;

    // Calculate: staked_amount * reward_per_share
    let earned = safe_mul_u128(staked_u128, reward_per_share)?;

    // Divide by precision to get reward debt
    safe_div_u128(earned, precision)
}

/// Calculate pro-rata share for bonus pool distribution
///
/// Formula: share = (investor_amount * total_to_distribute) / total_invested
pub fn calculate_pro_rata_share(
    investor_amount: u64,
    total_invested: u64,
    total_to_distribute: u64,
) -> Result<u64> {
    if total_invested == 0 {
        return Ok(0);
    }

    // Use u128 for intermediate calculation
    let investor_u128 = investor_amount as u128;
    let total_to_distribute_u128 = total_to_distribute as u128;
    let total_invested_u128 = total_invested as u128;

    let numerator = safe_mul_u128(investor_u128, total_to_distribute_u128)?;
    let share = safe_div_u128(numerator, total_invested_u128)?;

    if share > u64::MAX as u128 {
        return Err(StakingError::MathOverflow.into());
    }

    Ok(share as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_safe_add_overflow() {
        let result = safe_add(u64::MAX, 1);
        assert!(result.is_err());
    }

    #[test]
    fn test_safe_sub_underflow() {
        let result = safe_sub(0, 1);
        assert!(result.is_err());
    }

    #[test]
    fn test_safe_div_zero() {
        let result = safe_div(100, 0);
        assert!(result.is_err());
    }

    #[test]
    fn test_reward_per_share_increase() {
        // 7 SOL fee into 100 SOL staked
        // Expected: (7e9 * 1e12) / 100e9 = 7e10
        let fee = 7_000_000_000; // 7 SOL
        let staked = 100_000_000_000; // 100 SOL

        let increase = calculate_reward_per_share_increase(fee, staked).unwrap();
        assert_eq!(increase, 70_000_000_000); // 7e10
    }

    #[test]
    fn test_pending_rewards() {
        let staked = 10_000_000_000; // 10 SOL
        let rps = 70_000_000_000; // 7e10
        let debt = 0;

        let pending = calculate_pending_rewards(staked, rps, debt).unwrap();
        // (10e9 * 7e10) / 1e12 = 700_000_000 (0.7 SOL)
        assert_eq!(pending, 700_000_000);
    }
}
