use crate::state::*;
use anchor_lang::prelude::*;

/// Set referral relationship
///
/// Links a user to their referrer for commission tracking.

#[derive(Accounts)]
pub struct SetReferral<'info> {
    /// User being referred (referee)
    #[account(mut)]
    pub user: Signer<'info>,

    /// Staking pool
    pub staking_pool: Account<'info, StakingPool>,

    /// User's stake account
    #[account(
        mut,
        seeds = [seeds::STAKE_ACCOUNT, user.key().as_ref(), staking_pool.key().as_ref()],
        bump = stake_account.bump
    )]
    pub stake_account: Account<'info, StakeAccount>,

    /// Referrer's account
    /// CHECK: Validated in handler
    pub referrer: UncheckedAccount<'info>,

    /// Referral tracking account
    #[account(
        init_if_needed,
        payer = user,
        space = ReferralAccount::LEN,
        seeds = [seeds::REFERRAL, referrer.key().as_ref()],
        bump
    )]
    pub referral_account: Account<'info, ReferralAccount>,

    pub system_program: Program<'info, System>,
}

pub fn set_referral_handler(_ctx: Context<SetReferral>) -> Result<()> {
    // TODO: Implement referral logic in Phase 2
    // - Validate referrer != user
    // - Check if referral already set
    // - Update stake account with referrer
    // - Update referral account stats
    // - Emit ReferralSet event

    msg!("SetReferral instruction - scaffolding only");
    Ok(())
}
