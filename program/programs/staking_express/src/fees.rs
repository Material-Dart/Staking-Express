use crate::constants::*;
use crate::errors::StakingError;
use crate::math::{safe_div, safe_mul};
use anchor_lang::prelude::*;

/// Fee breakdown for stake/unstake operations
#[derive(Debug, Clone, Copy)]
pub struct FeeBreakdown {
    /// Amount to stakers (700 BPS = 7%)
    pub stakers: u64,

    /// Amount to platform commission (100 BPS = 1%)
    pub platform: u64,

    /// Amount to bonus pool (100 BPS = 1%)
    pub bonus_pool: u64,

    /// Amount to referral (50 BPS = 0.5%)
    pub referral: u64,

    /// Amount to Material Dart team (50 BPS = 0.5%)
    pub material_dart: u64,

    /// Total fee (sum of all components)
    pub total_fee: u64,

    /// Net amount after fees (gross_amount - total_fee)
    pub net_amount: u64,
}

/// Calculate fee breakdown for staking
///
/// Applies 10% total fee with the following distribution:
/// - 700 BPS (7%) → Stakers (distributed via reward_per_share)
/// - 100 BPS (1%) → Platform commission
/// - 100 BPS (1%) → Bonus pool
/// - 50 BPS (0.5%) → Referral
/// - 50 BPS (0.5%) → Material Dart team
///
/// All calculations use floor rounding (no ceiling)
pub fn calculate_stake_fee(gross_amount: u64) -> Result<FeeBreakdown> {
    // Calculate each component using BPS
    // Formula: fee = (amount * bps) / BPS_DENOMINATOR

    let stakers = calculate_bps_amount(gross_amount, FEE_STAKERS_BPS)?;
    let platform = calculate_bps_amount(gross_amount, FEE_PLATFORM_BPS)?;
    let bonus_pool = calculate_bps_amount(gross_amount, FEE_BONUS_POOL_BPS)?;
    let referral = calculate_bps_amount(gross_amount, FEE_REFERRAL_BPS)?;
    let material_dart = calculate_bps_amount(gross_amount, FEE_MATERIAL_DART_BPS)?;

    // Sum all fees
    let total_fee = stakers
        .checked_add(platform)
        .and_then(|sum| sum.checked_add(bonus_pool))
        .and_then(|sum| sum.checked_add(referral))
        .and_then(|sum| sum.checked_add(material_dart))
        .ok_or(StakingError::MathOverflow)?;

    // Verify total fee is exactly 10%
    let expected_total = calculate_bps_amount(gross_amount, TOTAL_FEE_BPS)?;
    if total_fee != expected_total {
        // This should never happen with correct constants, but check anyway
        return Err(StakingError::InvalidFeeBreakdown.into());
    }

    // Calculate net amount
    let net_amount = gross_amount
        .checked_sub(total_fee)
        .ok_or(StakingError::MathUnderflow)?;

    Ok(FeeBreakdown {
        stakers,
        platform,
        bonus_pool,
        referral,
        material_dart,
        total_fee,
        net_amount,
    })
}

/// Calculate fee breakdown for unstaking
///
/// Uses identical fee structure as staking
pub fn calculate_unstake_fee(gross_amount: u64) -> Result<FeeBreakdown> {
    // Unstake uses same fee structure as stake
    calculate_stake_fee(gross_amount)
}

/// Calculate amount for a given basis points
///
/// Formula: amount = (gross_amount * bps) / 10000
/// Uses floor rounding (default integer division)
fn calculate_bps_amount(gross_amount: u64, bps: u64) -> Result<u64> {
    let numerator = safe_mul(gross_amount, bps)?;
    safe_div(numerator, BPS_DENOMINATOR)
}

/// Verify fee breakdown integrity
///
/// Ensures all components sum to exactly the total fee
pub fn verify_fee_breakdown(breakdown: &FeeBreakdown) -> Result<()> {
    let calculated_total = breakdown
        .stakers
        .checked_add(breakdown.platform)
        .and_then(|sum| sum.checked_add(breakdown.bonus_pool))
        .and_then(|sum| sum.checked_add(breakdown.referral))
        .and_then(|sum| sum.checked_add(breakdown.material_dart))
        .ok_or(StakingError::MathOverflow)?;

    if calculated_total != breakdown.total_fee {
        return Err(StakingError::InvalidFeeBreakdown.into());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stake_fee_1_sol() {
        // 1 SOL = 1_000_000_000 lamports
        let amount = 1_000_000_000;
        let fees = calculate_stake_fee(amount).unwrap();

        // Expected breakdown:
        // 700 BPS = 70_000_000 (0.07 SOL)
        // 100 BPS = 10_000_000 (0.01 SOL)
        // 100 BPS = 10_000_000 (0.01 SOL)
        // 50 BPS = 5_000_000 (0.005 SOL)
        // 50 BPS = 5_000_000 (0.005 SOL)
        // Total = 100_000_000 (0.1 SOL = 10%)

        assert_eq!(fees.stakers, 70_000_000);
        assert_eq!(fees.platform, 10_000_000);
        assert_eq!(fees.bonus_pool, 10_000_000);
        assert_eq!(fees.referral, 5_000_000);
        assert_eq!(fees.material_dart, 5_000_000);
        assert_eq!(fees.total_fee, 100_000_000);
        assert_eq!(fees.net_amount, 900_000_000);
    }

    #[test]
    fn test_fee_sum_equals_total() {
        let amount = 1_000_000_000;
        let fees = calculate_stake_fee(amount).unwrap();

        let sum =
            fees.stakers + fees.platform + fees.bonus_pool + fees.referral + fees.material_dart;
        assert_eq!(sum, fees.total_fee);
        assert_eq!(fees.total_fee, 100_000_000); // 10%
    }

    #[test]
    fn test_unstake_fee_matches_stake() {
        let amount = 1_000_000_000;
        let stake_fees = calculate_stake_fee(amount).unwrap();
        let unstake_fees = calculate_unstake_fee(amount).unwrap();

        assert_eq!(stake_fees.stakers, unstake_fees.stakers);
        assert_eq!(stake_fees.platform, unstake_fees.platform);
        assert_eq!(stake_fees.bonus_pool, unstake_fees.bonus_pool);
        assert_eq!(stake_fees.referral, unstake_fees.referral);
        assert_eq!(stake_fees.material_dart, unstake_fees.material_dart);
    }

    #[test]
    fn test_small_amount_floor_rounding() {
        // Test with 1 lamport - should round down to 0 for all fees
        let amount = 1;
        let fees = calculate_stake_fee(amount).unwrap();

        // All fees should be 0 due to floor rounding
        assert_eq!(fees.stakers, 0);
        assert_eq!(fees.platform, 0);
        assert_eq!(fees.bonus_pool, 0);
        assert_eq!(fees.referral, 0);
        assert_eq!(fees.material_dart, 0);
        assert_eq!(fees.total_fee, 0);
        assert_eq!(fees.net_amount, 1);
    }

    #[test]
    fn test_verify_fee_breakdown() {
        let amount = 1_000_000_000;
        let fees = calculate_stake_fee(amount).unwrap();

        // Should pass verification
        assert!(verify_fee_breakdown(&fees).is_ok());
    }
}
