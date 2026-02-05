import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy");

export const RPC_ENDPOINT = "https://api.devnet.solana.com";

export const SEEDS = {
    GLOBAL_CONFIG: Buffer.from("global_config"),
    STAKING_POOL: Buffer.from("staking_pool"),
    USER_STAKE: Buffer.from("user_stake"),
    BONUS_POOL: Buffer.from("bonus_pool"),
    REFERRAL_POOL: Buffer.from("referral_pool"),
    REFERRER: Buffer.from("referrer"),
};
export type Cluster = "localnet" | "devnet" | "mainnet-beta";
export const SOLANA_NETWORK = "devnet" as Cluster; // Change to "devnet" or "mainnet-beta" as needed

export const getExplorerUrl = (signature: string) => {
    switch (SOLANA_NETWORK) {
        case "devnet":
            return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
        case "mainnet-beta":
            return `https://explorer.solana.com/tx/${signature}`;
        case "localnet":
        default:
            return `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${encodeURIComponent(RPC_ENDPOINT)}`;
    }
};
