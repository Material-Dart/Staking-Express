import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, StakingExpress } from "../idl/staking_express";

export { IDL };
export type { StakingExpress };

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getProgram = (connection: Connection, wallet: { publicKey: PublicKey | null }) => {
    const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "processed",
    });
    return new Program(IDL as any, provider) as Program<StakingExpress>;
};
