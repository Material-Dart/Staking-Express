import { useEffect, useState, useMemo, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getProgram } from "../lib/anchor";
import { getStakingPoolPDA, getBonusPoolPDA, getReferralPoolPDA, getUserStakePDA, getGlobalConfigPDA } from "../lib/pda";

export interface StakingData {
    totalStaked: number;
    bonusPoolBalance: number;
    referralPoolBalance: number;
    bonusCountdown: number;
    totalStakers: number;
    totalParticipants: number;
    userStaked: number;
    userRewards: number;
    walletBalance: number;
    lastTenInvestors: { investor: string; amount: number }[];
    isAdmin: boolean;
    loading: boolean;
    error: string | null;
}

export interface StakingActions {
    stake: (amount: number) => Promise<string>;
    unstake: (amount: number) => Promise<string>;
    claim: () => Promise<string>;
    distributeBonusPool: () => Promise<string>;
}

export const useStaking = (): StakingData & StakingActions => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const userPublicKey = wallet.publicKey;
    const [data, setData] = useState<StakingData>({
        totalStaked: 0,
        bonusPoolBalance: 0,
        referralPoolBalance: 0,
        bonusCountdown: 0,
        totalStakers: 0,
        totalParticipants: 0,
        userStaked: 0,
        userRewards: 0,
        walletBalance: 0,
        lastTenInvestors: [],
        isAdmin: false,
        loading: true,
        error: null,
    });

    const program = useMemo(() => getProgram(connection, wallet), [connection, wallet]);

    const fetchData = useCallback(async () => {
        try {
            const globalConfigPDA = getGlobalConfigPDA();
            // Fetch global config to discover authority
            const globalConfig = await program.account.globalConfig.fetch(globalConfigPDA);
            const stakingPoolPDA = getStakingPoolPDA();
            const bonusPoolPDA = getBonusPoolPDA();
            const referralPoolPDA = getReferralPoolPDA();

            // Fetch accounts in parallel
            const [stakingPool, bonusPool, referralPool] = await Promise.all([
                program.account.stakingPool.fetch(stakingPoolPDA),
                program.account.bonusPool.fetch(bonusPoolPDA),
                program.account.referralPool.fetch(referralPoolPDA),
            ]);

            let userStaked = 0;
            let userRewards = 0;
            let walletBalance = 0;

            if (userPublicKey) {
                try {
                    const balance = await connection.getBalance(userPublicKey);
                    walletBalance = balance / LAMPORTS_PER_SOL;

                    const userStakePDA = getUserStakePDA(userPublicKey);
                    const userStake = await program.account.userStakeState.fetch(userStakePDA);
                    userStaked = Number(userStake.stakedAmount) / 1e9;

                    // Pending rewards calculation
                    const rewardPerShare = new BN(stakingPool.rewardPerShare.toString());
                    const rewardDebt = new BN(userStake.rewardDebt.toString());
                    const stakedAmount = new BN(userStake.stakedAmount.toString());
                    const REWARD_PRECISION = new BN("1000000000000"); // 1e12

                    const pending = stakedAmount.mul(rewardPerShare).div(REWARD_PRECISION).sub(rewardDebt);
                    userRewards = pending.toNumber() / 1e9;
                } catch (e) {
                    console.log("No user stake account found:", e);
                }
            }

            const currentTimestamp = Math.floor(Date.now() / 1000);
            const countdown = Math.max(0, bonusPool.expiryTimestamp.toNumber() - currentTimestamp);

            // Parse Last Ten Investors
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lastTenInvestors = (bonusPool.lastTenInvestors as any[]).map(item => ({
                investor: item.investor?.toString() || "",
                amount: item.amount ? item.amount.toNumber() / 1e9 : 0
            })).reverse().filter(i => i.amount > 0);

            setData({
                totalStaked: stakingPool.totalStaked.toNumber() / 1e9,
                bonusPoolBalance: bonusPool.balance.toNumber() / 1e9,
                referralPoolBalance: referralPool.balance.toNumber() / 1e9,
                bonusCountdown: countdown,
                totalStakers: stakingPool.totalStakers.toNumber(),
                totalParticipants: bonusPool.totalParticipants.toNumber(),
                userStaked,
                userRewards,
                walletBalance,
                lastTenInvestors,
                isAdmin: userPublicKey ? globalConfig.authority.equals(userPublicKey) : false,
                loading: false,
                error: null,
            });
        } catch (err: unknown) {
            console.error("Error fetching staking data:", err);
            const message = err instanceof Error ? err.message : String(err);
            setData(prev => ({ ...prev, loading: false, error: message }));
        }
    }, [program, userPublicKey, connection]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const stake = async (amount: number) => {
        if (!userPublicKey) throw new Error("Wallet not connected");

        try {
            const globalConfigPDA = getGlobalConfigPDA();
            const config = await program.account.globalConfig.fetch(globalConfigPDA);

            const amountBN = new BN(amount * 1e9);

            const tx = await program.methods
                .stake(amountBN)
                .accounts({
                    user: userPublicKey,
                    treasury: config.treasury,
                    materialDartWallet: config.materialDartWallet,
                    referrer: null, // Initial version supports null referrer
                })
                .rpc();

            await fetchData();
            return tx;
        } catch (error) {
            console.error("Stake error:", error);
            throw error;
        }
    };

    const unstake = async (amount: number) => {
        if (!userPublicKey) throw new Error("Wallet not connected");

        try {
            const globalConfigPDA = getGlobalConfigPDA();
            const config = await program.account.globalConfig.fetch(globalConfigPDA);

            const amountBN = new BN(amount * 1e9);

            const tx = await program.methods
                .unstake(amountBN)
                .accounts({
                    user: userPublicKey,
                    treasury: config.treasury,
                    materialDartWallet: config.materialDartWallet,
                    referrer: null,
                })
                .rpc();

            await fetchData();
            return tx;
        } catch (error) {
            console.error("Unstake error:", error);
            throw error;
        }
    };

    const claim = async () => {
        if (!userPublicKey) throw new Error("Wallet not connected");

        try {
            const tx = await program.methods
                .claimRewards()
                .accounts({
                    user: userPublicKey,
                })
                .rpc();

            await fetchData();
            return tx;
        } catch (error) {
            console.error("Claim error:", error);
            throw error;
        }
    };

    const distributeBonusPool = async () => {
        if (!userPublicKey) throw new Error("Wallet not connected");

        try {
            const globalConfigPDA = getGlobalConfigPDA();
            const stakingPoolPDA = getStakingPoolPDA();
            const bonusPoolPDA = getBonusPoolPDA();

            // Cast through unknown to bypass strict type checking
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tx = await (program as unknown as any).methods
                .distributeBonusPool()
                .accounts({
                    caller: userPublicKey,
                    globalConfig: globalConfigPDA,
                    stakingPool: stakingPoolPDA,
                    bonusPool: bonusPoolPDA,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            await fetchData();
            return tx;
        } catch (error) {
            console.error("Distribute bonus error:", error);
            throw error;
        }
    };

    return { ...data, stake, unstake, claim, distributeBonusPool };
};
