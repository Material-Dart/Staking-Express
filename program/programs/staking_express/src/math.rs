use anchor_lang::prelude::*;
use crate::errors::StakingError;

/// Safe math operations to prevent overflow/underflow
/// 
/// Solana programs must handle arithmetic carefully to avoid panics.
/// These utilities provide checked operations with custom errors.

/// Safely add two u64 values
pub fn safe_add_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_add(b).ok_or(StakingError::Overflow.into())
}

/// Safely subtract two u64 values
pub fn safe_sub_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_sub(b).ok_or(StakingError::Underflow.into())
}

/// Safely multiply two u64 values
pub fn safe_mul_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_mul(b).ok_or(StakingError::Overflow.into())
}

/// Safely divide two u64 values
pub fn safe_div_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_div(b).ok_or(StakingError::Underflow.into())
}

/// Safely add two u128 values
pub fn safe_add_u128(a: u128, b: u128) -> Result<u128> {
    a.checked_add(b).ok_or(StakingError::Overflow.into())
}

/// Safely subtract two u128 values
pub fn safe_sub_u128(a: u128, b: u128) -> Result<u128> {
    a.checked_sub(b).ok_or(StakingError::Underflow.into())
}

/// Safely multiply two u128 values
pub fn safe_mul_u128(a: u128, b: u128) -> Result<u128> {
    a.checked_mul(b).ok_or(StakingError::Overflow.into())
}

/// Safely divide two u128 values
pub fn safe_div_u128(a: u128, b: u128) -> Result<u128> {
    a.checked_div(b).ok_or(StakingError::Underflow.into())
}

/// Convert u64 to u128 safely
pub fn u64_to_u128(value: u64) -> u128 {
    value as u128
}

/// Convert u128 to u64 with overflow check
pub fn u128_to_u64(value: u128) -> Result<u64> {
    u64::try_from(value).map_err(|_| StakingError::Overflow.into())
}

/// Calculate percentage with basis points (10000 = 100%)
/// 
/// Example: calculate_percentage(1000, 500) = 50 (5% of 1000)
pub fn calculate_percentage(amount: u64, basis_points: u16) -> Result<u64> {
    let result = safe_mul_u64(amount, basis_points as u64)?;
    safe_div_u64(result, 10000)
}

/// Scale a value by a factor (for precision)
/// 
/// Used in reward calculations to maintain precision
pub fn scale_value(value: u64, scale: u64) -> Result<u128> {
    safe_mul_u128(u64_to_u128(value), u64_to_u128(scale))
}

/// Unscale a value (reverse of scale_value)
pub fn unscale_value(value: u128, scale: u64) -> Result<u64> {
    let result = safe_div_u128(value, u64_to_u128(scale))?;
    u128_to_u64(result)
}
