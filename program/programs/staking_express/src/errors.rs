use anchor_lang::prelude::*;

/// Custom error codes for the Staking Express protocol
/// 
/// These errors provide specific feedback for debugging and user experience.
/// Each error is assigned a unique code starting from 6000 (Anchor convention).
#[error_code]
pub enum StakingError {
    /// Attempted operation with invalid amount (zero or exceeds limit)
    #[msg("Invalid amount provided")]
    InvalidAmount,

    /// Tried to unstake more than currently staked
    #[msg("Insufficient staked balance")]
    InsufficientStake,

    /// Attempted to withdraw before lock period expires
    #[msg("Tokens are still locked")]
    StillLocked,

    /// Pool has insufficient funds to pay rewards
    #[msg("Insufficient rewards in pool")]
    InsufficientRewards,

    /// Arithmetic operation would overflow
    #[msg("Calculation overflow")]
    Overflow,

    /// Arithmetic operation would underflow
    #[msg("Calculation underflow")]
    Underflow,

    /// Pool is paused by admin
    #[msg("Staking pool is paused")]
    PoolPaused,

    /// Unauthorized access attempt
    #[msg("Unauthorized")]
    Unauthorized,

    /// Invalid configuration parameter
    #[msg("Invalid configuration")]
    InvalidConfig,

    /// Referral relationship already exists
    #[msg("Referral already set")]
    ReferralAlreadySet,

    /// Cannot refer yourself
    #[msg("Cannot refer yourself")]
    SelfReferral,

    /// Bonus pool has ended
    #[msg("Bonus pool distribution has ended")]
    BonusPoolEnded,

    /// Invalid timestamp (future or past limit exceeded)
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
}
