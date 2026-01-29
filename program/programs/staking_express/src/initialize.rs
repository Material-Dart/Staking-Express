use anchor_lang::prelude::*;

use crate::constants::*;
use crate::events::*;
use crate::helpers::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Global configuration account
    #[account(
        init,
        payer = authority,
        space = GlobalConfig::LEN,
        seeds = [seeds::GLOBAL_CONFIG],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Main staking pool
    #[account(
        init,
        payer = authority,
        space = StakingPool::LEN,
        seeds = [seeds::STAKING_POOL],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    /// Bonus pool with countdown mechanism
    #[account(
        init,
        payer = authority,
        space = BonusPool::LEN,
        seeds = [seeds::BONUS_POOL],
        bump
    )]
    pub bonus_pool: Account<'info, BonusPool>,

    /// Referral pool for monthly distributions
    #[account(
        init,
        payer = authority,
        space = ReferralPool::LEN,
        seeds = [seeds::REFERRAL_POOL],
        bump
    )]
    pub referral_pool: Account<'info, ReferralPool>,

    /// Treasury wallet (receives 100 BPS platform commission)
    /// CHECK: This is just a wallet that receives SOL
    pub treasury: UncheckedAccount<'info>,

    /// Material Dart team wallet (receives 50 BPS)
    /// CHECK: This is just a wallet that receives SOL
    pub material_dart_wallet: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_handler(ctx: Context<Initialize>) -> Result<()> {
    let authority = ctx.accounts.authority.key();
    let global_config = &mut ctx.accounts.global_config;
    let staking_pool = &mut ctx.accounts.staking_pool;
    let bonus_pool = &mut ctx.accounts.bonus_pool;
    let referral_pool = &mut ctx.accounts.referral_pool;
    let treasury = ctx.accounts.treasury.key();
    let material_dart_wallet = ctx.accounts.material_dart_wallet.key();

    // Get current timestamp
    let current_timestamp = get_current_timestamp()?;

    // Initialize GlobalConfig
    global_config.authority = authority;
    global_config.treasury = treasury;
    global_config.material_dart_wallet = material_dart_wallet;
    global_config.paused = false;
    global_config.bump = ctx.bumps.global_config;

    // Initialize StakingPool
    staking_pool.config = global_config.key();
    staking_pool.total_staked = 0;
    staking_pool.reward_per_share = 0;
    staking_pool.last_update_timestamp = current_timestamp;
    staking_pool.bump = ctx.bumps.staking_pool;

    // Initialize BonusPool with 12-hour countdown
    bonus_pool.staking_pool = staking_pool.key();
    bonus_pool.balance = 0;
    bonus_pool.expiry_timestamp = current_timestamp + BONUS_INITIAL_COUNTDOWN;
    bonus_pool.last_investment_timestamp = current_timestamp;
    bonus_pool.last_ten_investors = [LastTenInvestor::default(); MAX_LAST_TEN_INVESTORS];
    bonus_pool.current_position = 0;
    bonus_pool.investor_count = 0;
    bonus_pool.bump = ctx.bumps.bonus_pool;

    // Initialize ReferralPool with 30-day distribution period
    referral_pool.staking_pool = staking_pool.key();
    referral_pool.balance = 0;
    referral_pool.next_distribution_timestamp = current_timestamp + REFERRAL_DISTRIBUTION_PERIOD;
    referral_pool.last_distribution_timestamp = current_timestamp;
    referral_pool.total_distributed = 0;
    referral_pool.bump = ctx.bumps.referral_pool;

    // Emit initialization event
    emit!(ProtocolInitialized {
        authority,
        treasury,
        material_dart_wallet,
        timestamp: current_timestamp,
    });

    msg!("✅ Staking Express protocol initialized successfully");
    msg!("Authority: {}", authority);
    msg!("Treasury: {}", treasury);
    msg!("Material Dart: {}", material_dart_wallet);
    msg!("Bonus countdown: 12 hours");
    msg!("Referral distribution: 30 days");

    Ok(())
}
