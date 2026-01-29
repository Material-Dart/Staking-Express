use anchor_lang::prelude::*;

/// Custom error codes for Staking Express protocol
/// Error codes start at 6000 as per Anchor convention
#[error_code]
pub enum StakingError {
    // ==================== Math Errors (6000-6009) ====================
    #[msg("Arithmetic overflow occurred")]
    MathOverflow,

    #[msg("Arithmetic underflow occurred")]
    MathUnderflow,

    #[msg("Division by zero")]
    DivisionByZero,

    #[msg("Invalid calculation result")]
    InvalidCalculation,

    // ==================== Validation Errors (6010-6029) ====================
    #[msg("Stake amount is below minimum (0.01 SOL)")]
    StakeTooSmall,

    #[msg("Unstake amount is below minimum (0.01 SOL)")]
    UnstakeTooSmall,

    #[msg("Insufficient staked balance")]
    InsufficientStake,

    #[msg("No rewards available to claim")]
    NoRewardsAvailable,

    #[msg("Invalid fee breakdown - components do not sum to 1000 BPS")]
    InvalidFeeBreakdown,

    #[msg("Invalid amount - must be greater than zero")]
    InvalidAmount,

    #[msg("Invalid timestamp")]
    InvalidTimestamp,

    // ==================== State Errors (6030-6049) ====================
    #[msg("Staking pool is paused")]
    PoolPaused,

    #[msg("Bonus pool countdown has not expired")]
    BonusNotExpired,

    #[msg("Bonus pool is empty")]
    BonusPoolEmpty,

    #[msg("Referral pool distribution period has not ended")]
    ReferralPeriodNotEnded,

    #[msg("User has no staked position")]
    NoStakePosition,

    #[msg("Total staked invariant violated")]
    TotalStakedInvariantViolation,

    #[msg("Reward per share invariant violated")]
    RewardPerShareInvariantViolation,

    #[msg("Circular buffer is full")]
    CircularBufferFull,

    // ==================== Authorization Errors (6050-6059) ====================
    #[msg("Unauthorized: caller is not the authority")]
    Unauthorized,

    #[msg("Invalid authority account")]
    InvalidAuthority,

    #[msg("Invalid treasury account")]
    InvalidTreasury,

    #[msg("Invalid Material Dart wallet")]
    InvalidMaterialDartWallet,

    // ==================== Account Errors (6060-6069) ====================
    #[msg("Invalid PDA derivation")]
    InvalidPDA,

    #[msg("Account already initialized")]
    AlreadyInitialized,

    #[msg("Account not initialized")]
    NotInitialized,

    #[msg("Invalid account owner")]
    InvalidAccountOwner,
}
