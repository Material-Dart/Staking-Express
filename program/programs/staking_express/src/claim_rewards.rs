use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::events::*;

/// Claim accumulated staking rewards
/// 
/// Calculates and transfers pending rewards to the user.

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    /// User claiming rewards
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// Staking pool
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    /// User's stake account
    #[account(
        mut,
        seeds = [seeds::STAKE_ACCOUNT, user.key().as_ref(), staking_pool.key().as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    /// User's reward token account (destination)
    #[account(mut)]
    pub user_reward_account: Account<'info, TokenAccount>,
    
    /// Pool's reward vault (source)
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,
    
    /// Fee collector's token account
    #[account(mut)]
    pub fee_collector_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimRewards>) -> Result<()> {
    // TODO: Implement reward claiming logic in Phase 2
    // - Calculate pending rewards
    // - Deduct fees
    // - Transfer rewards to user
    // - Transfer fees to collector
    // - Update reward debt
    // - Handle referral rewards
    // - Emit RewardsClaimed event
    
    msg!("ClaimRewards instruction - scaffolding only");
    Ok(())
}
