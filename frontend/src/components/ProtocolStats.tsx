import { StakingActions, StakingData } from "@/hooks/useStaking";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { useState } from "react";

interface ProtocolStatsProps {
    staking: StakingData & StakingActions;
    connected: boolean;
    onTransactionComplete: (signature: string) => void;
}

export default function ProtocolStats({ staking, connected, onTransactionComplete }: ProtocolStatsProps) {
    const [isDistributing, setIsDistributing] = useState(false);

    const handleDistributeBonus = async () => {
        if (!staking.distributeBonusPool) return;
        setIsDistributing(true);
        try {
            const tx = await staking.distributeBonusPool();
            onTransactionComplete(tx);
            console.log("Tx signature:", tx);
        } catch (e) {
            console.error(e);
            alert("Distribute failed: " + (e as Error).message);
        } finally {
            setIsDistributing(false);
        }
    };

    return (
        < div className="bg-slate-800/40 rounded-3xl p-8 border border-white/5" >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Protokol Durumu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                    <div className="text-sm text-gray-400">Toplam Kilitli Değer (TVL)</div>
                    <div className="text-4xl font-bold text-white">{staking.totalStaked.toFixed(2)} SOL</div>
                    <div className="text-green-400 text-sm flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> %12.5 (24s)
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs mb-1">Toplam Yatırımcı</div>
                        <div className="text-xl font-bold">{staking.totalStakers}</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs mb-1">Bonus Havuzu katılımcısı</div>
                        <div className="text-xl font-bold">{staking.totalParticipants}</div>
                    </div>
                </div>
                {/* Admin action: Distribute Bonus Pool */}
                <div className="md:col-span-2 flex items-center justify-end">
                    {connected && staking.isAdmin && (
                        <button
                            onClick={handleDistributeBonus}
                            className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transaction-colors"
                            disabled={isDistributing}
                        >
                            {isDistributing ? "Distributing Bonus Pool" : "Distribute Bonus Pool"}
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
}