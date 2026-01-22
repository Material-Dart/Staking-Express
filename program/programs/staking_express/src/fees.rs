use anchor_lang::prelude::*;
use crate::math::*;

/// Fee calculation utilities
/// 
/// Handles protocol fee extraction and distribution

/// Calculate fee amount from a given amount
/// 
/// # Arguments
/// * `amount` - Total amount before fees
/// * `fee_basis_points` - Fee percentage in basis points (100 = 1%)
/// 
/// # Returns
/// * Tuple of (fee_amount, amount_after_fee)
pub fn calculate_fee(amount: u64, fee_basis_points: u16) -> Result<(u64, u64)> {
    if fee_basis_points == 0 {
        return Ok((0, amount));
    }
    
    let fee_amount = calculate_percentage(amount, fee_basis_points)?;
    let amount_after_fee = safe_sub_u64(amount, fee_amount)?;
    
    Ok((fee_amount, amount_after_fee))
}

/// Validate fee basis points are within acceptable range
/// 
/// Maximum fee is 10% (1000 basis points)
pub fn validate_fee_basis_points(fee_basis_points: u16) -> Result<()> {
    require!(
        fee_basis_points <= 1000,
        crate::errors::StakingError::InvalidConfig
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_fee() {
        // 5% fee on 1000 tokens
        let (fee, after_fee) = calculate_fee(1000, 500).unwrap();
        assert_eq!(fee, 50);
        assert_eq!(after_fee, 950);
    }

    #[test]
    fn test_zero_fee() {
        let (fee, after_fee) = calculate_fee(1000, 0).unwrap();
        assert_eq!(fee, 0);
        assert_eq!(after_fee, 1000);
    }
}
