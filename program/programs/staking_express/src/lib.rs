
use anchor_lang::prelude::*;

// Program modules
pub mod errors;
pub mod events;
pub mod state;
pub mod helpers;
pub mod math;
pub mod fees;

// Instruction modules
pub mod initialize;
pub mod stake;
pub mod unstake;
pub mod claim_rewards;
pub mod bonus_pool;
pub mod referral;

// Re-exports for cleaner imports
pub use errors::*;
pub use events::*;
pub use state::*;

// Program ID - This will be replaced when deployed
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Staking Express - Production-grade Solana staking protocol
/// 
/// Features:
/// - Flexible staking with configurable lock periods
/// - Dynamic reward distribution
/// - Bonus pool system for additional incentives
/// - Referral rewards program
/// - Fee collection mechanism
/// 
/// Architecture:
/// - Uses PDAs for deterministic account addresses
/// - Implements safe math to prevent overflow/underflow
/// - Emits events for off-chain indexing
/// - Custom error codes for debugging
#[program]
pub mod staking_express {
    use super::*;

    /// Initialize the staking pool
    /// 
    /// Creates the main StakingPool account with initial configuration.
    /// Only callable once per authority.
    /// 
    /// # Arguments
    /// * `ctx` - Context containing all required accounts
    /// 
    /// # Returns
    /// * `Result<()>` - Success or error
    pub fn initialize(ctx: Context<initialize::Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    /// Stake tokens into the pool
    /// 
    /// Transfers user tokens to the pool vault and creates/updates
    /// their stake account with reward tracking.
    /// 
    /// # Arguments
    /// * `ctx` - Context containing all required accounts
    /// * `amount` - Amount of tokens to stake
    /// 
    /// # Returns
    /// * `Result<()>` - Success or error
    pub fn stake(ctx: Context<stake::Stake>, amount: u64) -> Result<()> {
        stake::handler(ctx, amount)
    }

    /// Unstake tokens from the pool
    /// 
    /// Withdraws staked tokens back to the user after any lock period.
    /// Automatically claims pending rewards.
    /// 
    /// # Arguments
    /// * `ctx` - Context containing all required accounts
    /// * `amount` - Amount of tokens to unstake
    /// 
    /// # Returns
    /// * `Result<()>` - Success or error
    pub fn unstake(ctx: Context<unstake::Unstake>, amount: u64) -> Result<()> {
        unstake::handler(ctx, amount)
    }

    /// Claim accumulated staking rewards
    /// 
    /// Calculates and transfers pending rewards to the user.
    /// Updates reward debt to prevent double-claiming.
    /// 
    /// # Arguments
    /// * `ctx` - Context containing all required accounts
    /// 
    /// # Returns
    /// * `Result<()>` - Success or error
    pub fn claim_rewards(ctx: Context<claim_rewards::ClaimRewards>) -> Result<()> {
        claim_rewards::handler(ctx)
    }

    /// Create or fund a bonus reward pool
    /// 
    /// Allows protocol to create additional reward streams
    /// with custom distribution schedules.
    /// 
    /// # Arguments
    /// * `ctx` - Context containing all required accounts
    /// * `amount` - Amount of bonus tokens to add
    /// * `duration` - Distribution period in seconds
    /// 
    /// # Returns
    /// * `Result<()>` - Success or error
    pub fn manage_bonus_pool(
        ctx: Context<bonus_pool::ManageBonusPool>,
        amount: u64,
        duration: i64,
    ) -> Result<()> {
        bonus_pool::handler(ctx, amount, duration)
    }

    /// Register or update referral relationship
    /// 
    /// Links a user to their referrer for commission tracking.
    /// Referrer earns a percentage of referee's rewards.
    /// 
    /// # Arguments
    /// * `ctx` - Context containing all required accounts
    /// 
    /// # Returns
    /// * `Result<()>` - Success or error
    pub fn set_referral(ctx: Context<referral::SetReferral>) -> Result<()> {
        referral::handler(ctx)
    }
}
