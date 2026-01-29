use anchor_lang::prelude::*;

/// Event emitted when the protocol is initialized
#[event]
pub struct ProtocolInitialized {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub material_dart_wallet: Pubkey,
    pub timestamp: i64,
}

/// Event emitted when a user stakes SOL
#[event]
pub struct Staked {
    pub user: Pubkey,
    pub gross_amount: u64,         // Amount before fees
    pub net_amount: u64,           // Amount after 10% fee
    pub fee_to_stakers: u64,       // 700 BPS
    pub fee_to_platform: u64,      // 100 BPS
    pub fee_to_bonus: u64,         // 100 BPS
    pub fee_to_referral: u64,      // 50 BPS
    pub fee_to_material_dart: u64, // 50 BPS
    pub referrer: Option<Pubkey>,
    pub total_staked_after: u64,
    pub reward_per_share_after: u128,
    pub timestamp: i64,
}

/// Event emitted when a user unstakes SOL
#[event]
pub struct Unstaked {
    pub user: Pubkey,
    pub gross_amount: u64,    // Amount before fees
    pub net_amount: u64,      // Amount after 10% fee
    pub rewards_claimed: u64, // Rewards transferred (no fee)
    pub fee_to_stakers: u64,
    pub fee_to_platform: u64,
    pub fee_to_bonus: u64,
    pub fee_to_referral: u64,
    pub fee_to_material_dart: u64,
    pub total_staked_after: u64,
    pub timestamp: i64,
}

/// Event emitted when a user claims rewards
#[event]
pub struct RewardsClaimed {
    pub user: Pubkey,
    pub amount: u64,
    pub reward_debt_after: u128,
    pub timestamp: i64,
}

/// Event emitted when bonus pool expires and distributes
#[event]
pub struct BonusPoolExpired {
    pub total_distributed: u64,
    pub to_last_ten: u64,     // 40%
    pub to_all_stakers: u64,  // 40%
    pub carried_forward: u64, // 20%
    pub last_ten_count: u8,
    pub countdown_reset_to: i64,
    pub timestamp: i64,
}

/// Event emitted when bonus countdown is extended
#[event]
pub struct BonusCountdownExtended {
    pub extended_by: i64, // Seconds added
    pub new_expiry: i64,
    pub staker: Pubkey,
    pub stake_amount: u64,
    pub timestamp: i64,
}

/// Event emitted when referral commission is paid
#[event]
pub struct ReferralPaid {
    pub referrer: Pubkey,
    pub referee: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

/// Event emitted when referral pool distributes monthly
#[event]
pub struct ReferralPoolDistributed {
    pub total_distributed: u64,
    pub to_stakers: u64,      // 50%
    pub carried_forward: u64, // 50%
    pub next_distribution: i64,
    pub timestamp: i64,
}

/// Event emitted when an investor is added to last-10 list
#[event]
pub struct InvestorAddedToLastTen {
    pub investor: Pubkey,
    pub amount: u64,
    pub position: u8,
    pub timestamp: i64,
}

/// Event emitted when pool is paused/unpaused
#[event]
pub struct PoolPauseToggled {
    pub paused: bool,
    pub authority: Pubkey,
    pub timestamp: i64,
}
