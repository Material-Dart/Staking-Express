import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy");

export const RPC_ENDPOINT = "http://127.0.0.1:8899";

export const SEEDS = {
    GLOBAL_CONFIG: Buffer.from("global_config"),
    STAKING_POOL: Buffer.from("staking_pool"),
    USER_STAKE: Buffer.from("user_stake"),
    BONUS_POOL: Buffer.from("bonus_pool"),
    REFERRAL_POOL: Buffer.from("referral_pool"),
    REFERRER: Buffer.from("referrer"),
};
