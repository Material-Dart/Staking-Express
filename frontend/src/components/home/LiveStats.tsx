import { StakingActions, StakingData } from "@/hooks/useStaking";

interface LiveStatsProps {
    staking: StakingData & StakingActions;
    formatTime: (seconds: number) => string;
    localCountdown: number;
}

export default function LiveStats({ staking, formatTime, localCountdown }: LiveStatsProps) {
    return (
        <div className="bg-gradient-to-br from-slate-800/50 to-indigo-900/30 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{staking.loading ? "..." : staking.totalStakers}</div>
                    <div className="text-gray-400">Toplam Stake Eden</div>
                </div>
                <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{staking.loading ? "..." : staking.totalStaked.toFixed(2)}</div>
                    <div className="text-gray-400">Toplam SOL Stake</div>
                </div>
                <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{staking.loading ? "..." : staking.bonusPoolBalance.toFixed(2)}</div>
                    <div className="text-gray-400">Bonus Ödül Havuzu</div>
                </div>
                <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-400 mb-2">{formatTime(localCountdown)}</div>
                    <div className="text-gray-400">Bonus Geri Sayımı</div>
                </div>
            </div>
        </div>
    );
}