use anchor_lang::prelude::*;

// Program modules
pub mod errors;
pub mod events;
pub mod fees;
pub mod helpers;
pub mod math;
pub mod state;

// Instruction modules
pub mod bonus_pool;
pub mod claim_rewards;
pub mod initialize;
pub mod referral;
pub mod stake;
pub mod unstake;

// Re-exports for cleaner imports
pub use bonus_pool::*;
pub use claim_rewards::*;
pub use errors::*;
pub use events::*;
pub use initialize::*;
pub use referral::*;
pub use stake::*;
pub use state::*;
pub use unstake::*;

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
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize_handler(ctx)
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
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        stake_handler(ctx, amount)
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
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        unstake_handler(ctx, amount)
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
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        claim_rewards_handler(ctx)
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
        ctx: Context<ManageBonusPool>,
        amount: u64,
        duration: i64,
    ) -> Result<()> {
        manage_bonus_pool_handler(ctx, amount, duration)
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
    pub fn set_referral(ctx: Context<SetReferral>) -> Result<()> {
        set_referral_handler(ctx)
    }
}
