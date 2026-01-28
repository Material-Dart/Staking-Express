use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

/// Unstake tokens from the pool
///
/// Withdraws staked tokens back to user after lock period.

#[derive(Accounts)]
pub struct Unstake<'info> {
    /// User unstaking tokens
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

    /// User's token account (destination)
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    /// Pool's stake vault (source)
    #[account(mut)]
    pub stake_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn unstake_handler(_ctx: Context<Unstake>, amount: u64) -> Result<()> {
    // TODO: Implement unstaking logic in Phase 2
    // - Check lock period
    // - Validate amount <= staked
    // - Update reward tracking
    // - Transfer tokens from vault
    // - Update stake account
    // - Emit Unstaked event

    msg!("Unstake instruction - scaffolding only. Amount: {}", amount);
    Ok(())
}
