import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { StakingExpress, IDL } from "../idl/staking_express";

export type { StakingExpress };

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getProgram = (connection: Connection, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
    });
    return new Program(IDL as any, provider) as Program<StakingExpress>;
};
