use anchor_lang::prelude::*;

// Program modules
pub mod constants;
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
declare_id!("E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy");

/// Staking Express - Production-grade Solana staking protocol
///
/// Economic Model:
/// - 10% fee on stake/unstake: 700 BPS stakers, 100 BPS platform, 100 BPS bonus, 50 BPS referral, 50 BPS Material Dart
/// - Bonus pool: 12h countdown, 15min extension per 1 SOL, 40/40/20 distribution
/// - Referral pool: 30-day distribution, 50/50 split
///
/// Architecture:
/// - Uses PDAs for deterministic account addresses
/// - Implements safe math to prevent overflow/underflow
/// - Emits events for off-chain indexing
/// - Custom error codes for debugging
#[program]
pub mod staking_express {
    use super::*;

    /// Initialize the staking protocol
    ///
    /// Creates GlobalConfig, StakingPool, BonusPool, and ReferralPool accounts.
    /// Sets up authority, treasury, and Material Dart wallet.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize_handler(ctx)
    }

    /// Stake SOL into the pool
    ///
    /// Applies 10% fee:
    /// - 700 BPS → All stakers (via reward_per_share)
    /// - 100 BPS → Platform treasury
    /// - 100 BPS → Bonus pool
    /// - 50 BPS → Referrer or referral pool
    /// - 50 BPS → Material Dart team
    ///
    /// Extends bonus countdown +15min if stake >= 1 SOL
    /// Adds to last-10 circular buffer if stake >= 1 SOL
    pub fn stake(ctx: Context<Stake>, gross_amount: u64) -> Result<()> {
        stake_handler(ctx, gross_amount)
    }

    /// Unstake SOL from the pool
    ///
    /// Applies 10% fee on unstake amount (identical to stake fee structure).
    /// Pending rewards are transferred separately WITHOUT fees.
    pub fn unstake(ctx: Context<Unstake>, gross_amount: u64) -> Result<()> {
        unstake_handler(ctx, gross_amount)
    }

    /// Claim accumulated staking rewards
    ///
    /// Transfers pending rewards to user (NO FEE on rewards).
    /// Updates reward debt to prevent double-claiming.
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        claim_rewards_handler(ctx)
    }

    /// Distribute bonus pool (callable by anyone when conditions met)
    ///
    /// Triggers when:
    /// - Countdown expires (12 hours), OR
    /// - 6 hours of inactivity
    ///
    /// Distribution:
    /// - 40% → Last 10 investors (pro-rata)
    /// - 40% → All stakers (via reward_per_share)
    /// - 20% → Carry forward to next round
    ///
    /// Countdown resets to 12 hours, last-10 list persists
    pub fn distribute_bonus_pool(ctx: Context<DistributeBonusPool>) -> Result<()> {
        distribute_bonus_pool_handler(ctx)
    }

    /// Distribute referral pool (authority only)
    ///
    /// Triggers monthly (30 days) or can be forced by authority.
    ///
    /// Distribution:
    /// - 50% → All stakers (via reward_per_share)
    /// - 50% → Carry forward to next month
    pub fn distribute_referral_pool(
        ctx: Context<DistributeReferralPool>,
        force: bool,
    ) -> Result<()> {
        distribute_referral_pool_handler(ctx, force)
    }
}
