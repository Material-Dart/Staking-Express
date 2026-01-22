use anchor_lang::prelude::*;

/// Main staking pool configuration and state
/// 
/// This account stores global protocol settings and is a PDA
/// derived from ["staking_pool", authority].
#[account]
pub struct StakingPool {
    /// Protocol authority (can update settings)
    pub authority: Pubkey,
    
    /// Token mint being staked
    pub stake_mint: Pubkey,
    
    /// Token mint for rewards (can be same as stake_mint)
    pub reward_mint: Pubkey,
    
    /// Vault holding staked tokens
    pub stake_vault: Pubkey,
    
    /// Vault holding reward tokens
    pub reward_vault: Pubkey,
    
    /// Total amount of tokens currently staked
    pub total_staked: u64,
    
    /// Reward rate per second (scaled by 1e9 for precision)
    /// Example: 1e9 = 1 token per second
    pub reward_rate: u64,
    
    /// Last time rewards were updated
    pub last_update_time: i64,
    
    /// Accumulated reward per token (scaled by 1e18)
    pub reward_per_token_stored: u128,
    
    /// Fee percentage (basis points, 100 = 1%)
    pub fee_basis_points: u16,
    
    /// Fee collector address
    pub fee_collector: Pubkey,
    
    /// Whether the pool is paused
    pub paused: bool,
    
    /// Minimum stake amount
    pub min_stake_amount: u64,
    
    /// Lock duration in seconds (0 = no lock)
    pub lock_duration: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl StakingPool {
    /// Size calculation for account allocation
    /// 
    /// Discriminator (8) + all fields
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 16 + 2 + 32 + 1 + 8 + 8 + 1;
}

/// User's staking position
/// 
/// PDA derived from ["stake_account", user, pool]
#[account]
pub struct StakeAccount {
    /// Owner of this stake account
    pub owner: Pubkey,
    
    /// Staking pool this account belongs to
    pub pool: Pubkey,
    
    /// Amount of tokens staked
    pub amount: u64,
    
    /// Reward debt (for reward calculation)
    /// Prevents double-claiming when stake changes
    pub reward_debt: u128,
    
    /// Last time user claimed rewards
    pub last_claim_time: i64,
    
    /// Time when tokens were staked (for lock period)
    pub stake_time: i64,
    
    /// Referrer address (if any)
    pub referrer: Option<Pubkey>,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl StakeAccount {
    /// Size calculation for account allocation
    pub const LEN: usize = 8 + 32 + 32 + 8 + 16 + 8 + 8 + 33 + 1;
}

/// Bonus reward pool for additional incentives
/// 
/// PDA derived from ["bonus_pool", pool_id]
#[account]
pub struct BonusPool {
    /// Unique identifier for this bonus pool
    pub pool_id: u64,
    
    /// Main staking pool this bonus is for
    pub staking_pool: Pubkey,
    
    /// Token mint for bonus rewards
    pub bonus_mint: Pubkey,
    
    /// Vault holding bonus tokens
    pub bonus_vault: Pubkey,
    
    /// Total bonus tokens allocated
    pub total_bonus: u64,
    
    /// Bonus tokens distributed so far
    pub distributed: u64,
    
    /// Start time for distribution
    pub start_time: i64,
    
    /// End time for distribution
    pub end_time: i64,
    
    /// Bonus rate per second
    pub bonus_rate: u64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl BonusPool {
    pub const LEN: usize = 8 + 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

/// Referral tracking account
/// 
/// PDA derived from ["referral", referrer]
#[account]
pub struct ReferralAccount {
    /// The referrer's address
    pub referrer: Pubkey,
    
    /// Number of users referred
    pub referral_count: u32,
    
    /// Total rewards earned from referrals
    pub total_earned: u64,
    
    /// Timestamp of first referral
    pub created_at: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl ReferralAccount {
    pub const LEN: usize = 8 + 32 + 4 + 8 + 8 + 1;
}

/// PDA seeds for deterministic address derivation
pub mod seeds {
    pub const STAKING_POOL: &[u8] = b"staking_pool";
    pub const STAKE_ACCOUNT: &[u8] = b"stake_account";
    pub const BONUS_POOL: &[u8] = b"bonus_pool";
    pub const REFERRAL: &[u8] = b"referral";
    pub const STAKE_VAULT: &[u8] = b"stake_vault";
    pub const REWARD_VAULT: &[u8] = b"reward_vault";
    pub const BONUS_VAULT: &[u8] = b"bonus_vault";
}
