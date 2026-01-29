// Program constants for Staking Express protocol
// All values are production-grade and must not be modified without audit

/// Lamports per SOL (1 SOL = 1_000_000_000 lamports)
pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

/// Minimum stake amount in lamports (0.01 SOL)
pub const MIN_STAKE: u64 = 10_000_000; // 0.01 SOL

/// Minimum unstake amount in lamports (0.01 SOL)
pub const MIN_UNSTAKE: u64 = 10_000_000; // 0.01 SOL

/// Threshold for bonus pool countdown extension (1 SOL)
pub const BONUS_EXTENSION_THRESHOLD: u64 = LAMPORTS_PER_SOL; // 1 SOL

/// Threshold for adding investor to last-10 list (1 SOL)
pub const BONUS_LAST_TEN_THRESHOLD: u64 = LAMPORTS_PER_SOL; // 1 SOL

/// Fee structure in basis points (total = 1000 BPS = 10%)
/// Stakers receive 700 BPS (7%) distributed via reward_per_share
pub const FEE_STAKERS_BPS: u64 = 700;

/// Platform commission 100 BPS (1%)
pub const FEE_PLATFORM_BPS: u64 = 100;

/// Bonus pool receives 100 BPS (1%)
pub const FEE_BONUS_POOL_BPS: u64 = 100;

/// Referral commission 50 BPS (0.5%)
pub const FEE_REFERRAL_BPS: u64 = 50;

/// Material Dart team allocation 50 BPS (0.5%)
pub const FEE_MATERIAL_DART_BPS: u64 = 50;

/// Total fee in basis points (must equal sum of all fee components)
pub const TOTAL_FEE_BPS: u64 = 1000; // 10%

/// Basis points denominator (100% = 10000 BPS)
pub const BPS_DENOMINATOR: u64 = 10000;

/// Bonus pool initial countdown duration in seconds (12 hours)
pub const BONUS_INITIAL_COUNTDOWN: i64 = 43200; // 12 hours

/// Bonus pool countdown extension per 1 SOL stake (15 minutes)
pub const BONUS_EXTENSION_SECONDS: i64 = 900; // 15 minutes

/// Inactivity trigger threshold (6 hours with no investment)
pub const BONUS_INACTIVITY_THRESHOLD: i64 = 21600; // 6 hours

/// Maximum investors tracked in last-10 circular buffer
pub const MAX_LAST_TEN_INVESTORS: usize = 10;

/// Referral pool distribution period (30 days)
pub const REFERRAL_DISTRIBUTION_PERIOD: i64 = 2592000; // 30 days

/// Precision for reward calculations (1e12 to avoid rounding errors)
pub const REWARD_PRECISION: u128 = 1_000_000_000_000;

/// Lamports per SOL (1e9)
pub const PRECISION: u64 = LAMPORTS_PER_SOL;

// Compile-time assertion to ensure fee components sum correctly
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fee_sum() {
        assert_eq!(
            FEE_STAKERS_BPS
                + FEE_PLATFORM_BPS
                + FEE_BONUS_POOL_BPS
                + FEE_REFERRAL_BPS
                + FEE_MATERIAL_DART_BPS,
            TOTAL_FEE_BPS,
            "Fee components must sum to exactly 1000 BPS"
        );
    }

    #[test]
    fn test_total_fee_valid() {
        assert_eq!(TOTAL_FEE_BPS, 1000, "Total fee must be exactly 10%");
    }
}
