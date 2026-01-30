use anchor_lang::prelude::*;

use crate::constants::*;

/// Global configuration for the Staking Express protocol
/// PDA derived from ["global_config"]
#[account]
pub struct GlobalConfig {
    /// Protocol authority (can update settings)
    pub authority: Pubkey,

    /// Treasury wallet for platform commission (100 BPS)
    pub treasury: Pubkey,

    /// Material Dart team wallet (50 BPS)
    pub material_dart_wallet: Pubkey,

    /// Whether the protocol is paused
    pub paused: bool,

    /// Whether the protocol is initialized
    pub is_initialized: bool,

    pub bump: u8,
}

impl GlobalConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // treasury
        32 + // material_dart_wallet
        1 +  // paused
        1 +  // is_initialized
        1; // bump
}

/// Main staking pool state
/// PDA derived from ["staking_pool"]
#[account]
pub struct StakingPool {
    /// Global config account
    pub config: Pubkey,

    /// Total amount of SOL staked (net of fees)
    pub total_staked: u64,

    /// Accumulated reward per share (scaled by REWARD_PRECISION = 1e12)
    /// Formula: reward_per_share += (fee_amount * REWARD_PRECISION) / total_staked
    pub reward_per_share: u128,

    /// Last timestamp when pool was updated
    pub last_update_timestamp: i64,

    pub bump: u8,
}

impl StakingPool {
    pub const LEN: usize = 8 +  // discriminator
        32 + // config
        8 +  // total_staked
        16 + // reward_per_share (u128)
        8 +  // last_update_timestamp
        1; // bump
}

/// User's individual staking position
/// PDA derived from ["user_stake", user, staking_pool]
#[account]
pub struct UserStakeState {
    /// Owner of this stake position
    pub user: Pubkey,

    /// Staking pool this belongs to
    pub pool: Pubkey,

    /// Amount of SOL staked (net amount after 10% fee)
    pub staked_amount: u64,

    /// Reward debt for reward calculation
    /// Formula: reward_debt = staked_amount * reward_per_share / REWARD_PRECISION
    /// Prevents double-claiming when stake changes
    pub reward_debt: u128,

    /// Timestamp when user first staked
    pub stake_timestamp: i64,

    /// Last timestamp when user claimed rewards
    pub last_claim_timestamp: i64,

    /// Referrer address (if user was referred)
    pub referrer: Option<Pubkey>,

    pub bump: u8,
}

impl UserStakeState {
    pub const LEN: usize = 8 +  // discriminator
        32 + // user
        32 + // pool
        8 +  // staked_amount
        16 + // reward_debt (u128)
        8 +  // stake_timestamp
        8 +  // last_claim_timestamp
        33 + // referrer (Option<Pubkey>)
        1; // bump
}

/// Bonus pool with countdown mechanism
/// PDA derived from ["bonus_pool"]
#[account]
pub struct BonusPool {
    /// Staking pool this bonus pool belongs to
    pub staking_pool: Pubkey,

    /// Current balance in bonus pool (lamports)
    pub balance: u64,

    /// Countdown expiry timestamp (12 hours initially)
    pub expiry_timestamp: i64,

    /// Last investment timestamp (for 6-hour inactivity check)
    pub last_investment_timestamp: i64,

    /// Circular buffer: last 10 investors
    /// Only updated when deposit >= 1 SOL
    pub last_ten_investors: [LastTenInvestor; MAX_LAST_TEN_INVESTORS],

    /// Current position in circular buffer (0-9)
    pub current_position: u8,

    /// Number of investors in buffer (0-10)
    pub investor_count: u8,

    pub bump: u8,
}

impl BonusPool {
    pub const LEN: usize = 8 +   // discriminator
        32 +  // staking_pool
        8 +   // balance
        8 +   // expiry_timestamp
        8 +   // last_investment_timestamp
        (40 * MAX_LAST_TEN_INVESTORS) + // last_ten_investors array
        1 +   // current_position
        1 +   // investor_count
        1; // bump
}

/// Single entry in the last-10 circular buffer
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default)]
pub struct LastTenInvestor {
    /// Investor's public key
    pub investor: Pubkey,

    /// Amount staked (for pro-rata distribution)
    pub amount: u64,
}
/// Referral pool for accumulating referral fees
/// PDA derived from ["referral_pool"]
#[account]
pub struct ReferralPool {
    /// Staking pool this referral pool belongs to
    pub staking_pool: Pubkey,

    /// Current balance in referral pool (lamports)
    /// Accumulates 50 BPS from users who join without referrer
    pub balance: u64,

    /// Next distribution timestamp (30 days from last distribution)
    pub next_distribution_timestamp: i64,

    /// Last distribution timestamp
    pub last_distribution_timestamp: i64,

    /// Total distributed so far
    pub total_distributed: u64,

    pub bump: u8,
}

impl ReferralPool {
    pub const LEN: usize = 8 +  // discriminator
        32 + // staking_pool
        8 +  // balance
        8 +  // next_distribution_timestamp
        8 +  // last_distribution_timestamp
        8 +  // total_distributed
        1; // bump
}

/// Individual referrer tracking account
/// PDA derived from ["referrer", referrer_pubkey]
#[account]
pub struct ReferrerAccount {
    /// Referrer's public key
    pub referrer: Pubkey,

    /// Number of users referred
    pub referral_count: u32,

    /// Total rewards earned from referrals
    pub total_earned: u64,

    /// Timestamp when first referral was made
    pub created_at: i64,

    pub bump: u8,
}

impl ReferrerAccount {
    pub const LEN: usize = 8 +  // discriminator
        32 + // referrer
        4 +  // referral_count
        8 +  // total_earned
        8 +  // created_at
        1; // bump
}

/// PDA seeds for deterministic address derivation
pub mod seeds {
    pub const GLOBAL_CONFIG: &[u8] = b"global_config";
    pub const STAKING_POOL: &[u8] = b"staking_pool";
    pub const USER_STAKE: &[u8] = b"user_stake";
    pub const BONUS_POOL: &[u8] = b"bonus_pool";
    pub const REFERRAL_POOL: &[u8] = b"referral_pool";
    pub const REFERRER: &[u8] = b"referrer";
}
