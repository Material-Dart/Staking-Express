use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

/// Manage bonus reward pool
///
/// Creates or funds additional reward pools with custom schedules.

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct ManageBonusPool<'info> {
    /// Pool authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Staking pool
    #[account(
        mut,
        has_one = authority
    )]
    pub staking_pool: Account<'info, StakingPool>,

    /// Bonus pool account
    #[account(
        init_if_needed,
        payer = authority,
        space = BonusPool::LEN,
        seeds = [seeds::BONUS_POOL, pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub bonus_pool: Account<'info, BonusPool>,

    /// Bonus token mint
    pub bonus_mint: Account<'info, Mint>,

    /// Bonus vault
    #[account(
        init_if_needed,
        payer = authority,
        seeds = [seeds::BONUS_VAULT, bonus_pool.key().as_ref()],
        bump,
        token::mint = bonus_mint,
        token::authority = bonus_pool,
    )]
    pub bonus_vault: Account<'info, TokenAccount>,

    /// Authority's token account (source)
    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn manage_bonus_pool_handler(
    _ctx: Context<ManageBonusPool>,
    amount: u64,
    duration: i64,
) -> Result<()> {
    // TODO: Implement bonus pool logic in Phase 2
    // - Create or update bonus pool
    // - Transfer bonus tokens to vault
    // - Set distribution schedule
    // - Emit BonusPoolUpdated event

    msg!(
        "ManageBonusPool instruction - scaffolding only. Amount: {}, Duration: {}",
        amount,
        duration
    );
    Ok(())
}
