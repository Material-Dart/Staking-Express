use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::state::*;
use crate::events::*;

/// Initialize the staking pool
/// 
/// This instruction creates the main StakingPool account and associated vaults.
/// Can only be called once per authority.

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// Authority that will manage the pool
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Staking pool PDA
    #[account(
        init,
        payer = authority,
        space = StakingPool::LEN,
        seeds = [seeds::STAKING_POOL, authority.key().as_ref()],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    /// Token mint for staking
    pub stake_mint: Account<'info, Mint>,
    
    /// Token mint for rewards
    pub reward_mint: Account<'info, Mint>,
    
    /// Vault to hold staked tokens
    #[account(
        init,
        payer = authority,
        seeds = [seeds::STAKE_VAULT, staking_pool.key().as_ref()],
        bump,
        token::mint = stake_mint,
        token::authority = staking_pool,
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    /// Vault to hold reward tokens
    #[account(
        init,
        payer = authority,
        seeds = [seeds::REWARD_VAULT, staking_pool.key().as_ref()],
        bump,
        token::mint = reward_mint,
        token::authority = staking_pool,
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    /// Fee collector address
    /// CHECK: Can be any address, validated by authority
    pub fee_collector: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    // TODO: Implement initialization logic in Phase 2
    // - Set pool parameters
    // - Initialize reward tracking
    // - Emit PoolInitialized event
    
    msg!("Initialize instruction - scaffolding only");
    Ok(())
}
