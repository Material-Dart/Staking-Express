use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::events::*;

/// Stake tokens into the pool
/// 
/// Transfers user tokens to the vault and creates/updates their stake account.

#[derive(Accounts)]
pub struct Stake<'info> {
    /// User staking tokens
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// Staking pool
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    /// User's stake account (created if doesn't exist)
    #[account(
        init_if_needed,
        payer = user,
        space = StakeAccount::LEN,
        seeds = [seeds::STAKE_ACCOUNT, user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    /// User's token account (source)
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    /// Pool's stake vault (destination)
    #[account(mut)]
    pub stake_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Stake>, amount: u64) -> Result<()> {
    // TODO: Implement staking logic in Phase 2
    // - Validate amount
    // - Update reward tracking
    // - Transfer tokens to vault
    // - Update stake account
    // - Emit Staked event
    
    msg!("Stake instruction - scaffolding only. Amount: {}", amount);
    Ok(())
}
