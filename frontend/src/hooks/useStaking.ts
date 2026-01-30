import { useEffect, useState, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { getProgram } from "../lib/anchor";
import { getStakingPoolPDA, getBonusPoolPDA, getReferralPoolPDA, getUserStakePDA } from "../lib/pda";

export interface StakingData {
    totalStaked: number;
    bonusPoolBalance: number;
    referralPoolBalance: number;
    bonusCountdown: number;
    totalStakers: number;
    totalParticipants: number;
    userStaked: number;
    userRewards: number;
    loading: boolean;
    error: string | null;
}

export const useStaking = () => {
    const { connection } = useConnection();
    const { publicKey: userPublicKey } = useWallet();
    const [data, setData] = useState<StakingData>({
        totalStaked: 0,
        bonusPoolBalance: 0,
        referralPoolBalance: 0,
        bonusCountdown: 0,
        totalStakers: 0,
        totalParticipants: 0,
        userStaked: 0,
        userRewards: 0,
        loading: true,
        error: null,
    });

    const program = useMemo(() => getProgram(connection, { publicKey: userPublicKey }), [connection, userPublicKey]);

    const fetchData = async () => {
        try {
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

            if (userPublicKey) {
                try {
                    const userStakePDA = getUserStakePDA(userPublicKey);
                    const userStake = await program.account.userStakeState.fetch(userStakePDA);
                    userStaked = Number(userStake.stakedAmount) / 1e9;

                    // Pending rewards calculation: (staked * rewardPerShare / REWARD_PRECISION) - rewardDebt
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

            setData({
                totalStaked: stakingPool.totalStaked.toNumber() / 1e9,
                bonusPoolBalance: bonusPool.balance.toNumber() / 1e9,
                referralPoolBalance: referralPool.balance.toNumber() / 1e9,
                bonusCountdown: countdown,
                totalStakers: stakingPool.totalStakers.toNumber(),
                totalParticipants: bonusPool.totalParticipants.toNumber(),
                userStaked,
                userRewards,
                loading: false,
                error: null,
            });
        } catch (err: unknown) {
            console.error("Error fetching staking data:", err);
            const message = err instanceof Error ? err.message : String(err);
            setData(prev => ({ ...prev, loading: false, error: message }));
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling every 10s
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [program, userPublicKey]);

    return data;
};
