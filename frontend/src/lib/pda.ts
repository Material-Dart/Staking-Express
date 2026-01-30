import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, SEEDS } from "./constants";

export const getGlobalConfigPDA = () => {
    return PublicKey.findProgramAddressSync([SEEDS.GLOBAL_CONFIG], PROGRAM_ID)[0];
};

export const getStakingPoolPDA = () => {
    return PublicKey.findProgramAddressSync([SEEDS.STAKING_POOL], PROGRAM_ID)[0];
};

export const getBonusPoolPDA = () => {
    return PublicKey.findProgramAddressSync([SEEDS.BONUS_POOL], PROGRAM_ID)[0];
};

export const getReferralPoolPDA = () => {
    return PublicKey.findProgramAddressSync([SEEDS.REFERRAL_POOL], PROGRAM_ID)[0];
};

export const getUserStakePDA = (user: PublicKey) => {
    const stakingPool = getStakingPoolPDA();
    return PublicKey.findProgramAddressSync(
        [SEEDS.USER_STAKE, user.toBuffer(), stakingPool.toBuffer()],
        PROGRAM_ID
    )[0];
};
