use anchor_lang::prelude::*;

/// Events emitted by the Staking Express protocol
/// 
/// These events are indexed by off-chain services for:
/// - User dashboards
/// - Analytics
/// - Notifications
/// - Historical data

/// Emitted when the staking pool is initialized
#[event]
pub struct PoolInitialized {
    /// Address of the staking pool
    pub pool: Pubkey,
    /// Authority that can manage the pool
    pub authority: Pubkey,
    /// Reward rate per second (scaled by 1e9)
    pub reward_rate: u64,
    /// Timestamp of initialization
    pub timestamp: i64,
}

/// Emitted when a user stakes tokens
#[event]
pub struct Staked {
    /// User's wallet address
    pub user: Pubkey,
    /// Staking pool address
    pub pool: Pubkey,
    /// Amount of tokens staked
    pub amount: u64,
    /// Total amount now staked by this user
    pub total_staked: u64,
    /// Timestamp of stake
    pub timestamp: i64,
}

/// Emitted when a user unstakes tokens
#[event]
pub struct Unstaked {
    /// User's wallet address
    pub user: Pubkey,
    /// Staking pool address
    pub pool: Pubkey,
    /// Amount of tokens unstaked
    pub amount: u64,
    /// Remaining staked balance
    pub remaining_staked: u64,
    /// Timestamp of unstake
    pub timestamp: i64,
}

/// Emitted when rewards are claimed
#[event]
pub struct RewardsClaimed {
    /// User's wallet address
    pub user: Pubkey,
    /// Staking pool address
    pub pool: Pubkey,
    /// Amount of rewards claimed
    pub amount: u64,
    /// Timestamp of claim
    pub timestamp: i64,
}

/// Emitted when a bonus pool is created or funded
#[event]
pub struct BonusPoolUpdated {
    /// Bonus pool address
    pub pool: Pubkey,
    /// Amount added to the pool
    pub amount: u64,
    /// Distribution duration in seconds
    pub duration: i64,
    /// Start timestamp
    pub start_time: i64,
    /// End timestamp
    pub end_time: i64,
}

/// Emitted when a referral relationship is established
#[event]
pub struct ReferralSet {
    /// Referee (the person being referred)
    pub referee: Pubkey,
    /// Referrer (the person who referred)
    pub referrer: Pubkey,
    /// Timestamp when relationship was created
    pub timestamp: i64,
}

/// Emitted when referral rewards are paid
#[event]
pub struct ReferralRewardPaid {
    /// Referrer receiving the reward
    pub referrer: Pubkey,
    /// Referee whose activity generated the reward
    pub referee: Pubkey,
    /// Amount of referral reward
    pub amount: u64,
    /// Timestamp of payment
    pub timestamp: i64,
}
