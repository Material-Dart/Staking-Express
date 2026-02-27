"use client"

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { StakingActions, StakingData } from "@/hooks/useStaking";

interface StakeUnstakeCardProps {
    staking: StakingData & StakingActions;
    connected: boolean;
    onTransactionComplete: (signature: string) => void;
}

export default function StakeUnstakeCard({ staking, connected, onTransactionComplete }: StakeUnstakeCardProps) {
    const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
    const [amount, setAmount] = useState("");
    const [isStaking, setIsStaking] = useState(false);

    // Safe handlers (placeholders until hooked up to actual contract calls beyond read)
    const handleStake = async () => {
        if (!amount || !staking.stake) return;
        setIsStaking(true);
        try {
            const tx = await staking.stake(Number(amount));
            setAmount("");
            onTransactionComplete(tx);
            console.log("Tx signature:", tx);
        } catch (e) {
            console.error(e);
            alert("Stake failed: " + (e as Error).message);
        } finally {
            setIsStaking(false);
        }
    };

    const handleUnstake = async () => {
        if (!amount || !staking.unstake) return;
        setIsStaking(true);
        try {
            const tx = await staking.unstake(Number(amount));
            setAmount("");
            onTransactionComplete(tx);
            console.log("Tx signature:", tx);
        } catch (e) {
            console.error(e);
            alert("Unstake failed: " + (e as Error).message);
        } finally {
            setIsStaking(false);
        }
    };

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-xl">
            <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab("stake")}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === "stake"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    Stake Et
                </button>
                <button
                    onClick={() => setActiveTab("unstake")}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === "unstake"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    Çek (Unstake)
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Miktar (SOL)</span>
                        <div className="text-gray-400 text-right">
                            <div className="text-xs">
                                <span>Cüzdan: </span>
                                <span className="text-white font-mono">{staking.walletBalance?.toFixed(3) || "0.000"}</span>
                            </div>
                            <div className="text-xs">
                                <span>Stake: </span>
                                <span className="text-white font-mono">{staking.userStaked?.toFixed(3) || "0.000"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-4 text-2xl font-bold focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder-gray-600"
                        />
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-2 py-1 rounded transition-colors"
                            onClick={() => setAmount(activeTab === "unstake" ? (staking.userStaked || 0).toString() : (staking.walletBalance || 0).toString())}
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {activeTab === "stake" && (
                    <div className="space-y-3 bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/10">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">İşlem Ücreti</span>
                            <span className="text-white">~0.000005 SOL</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tahmini Başlangıç APY</span>
                            <span className="text-green-400 font-bold">~%12</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/5 text-xs text-indigo-300/80">
                            Stake yapınca 10% havuz komisyonu uygulanır. Ödül havuzlarından pay almaya başlarsınız.
                        </div>
                    </div>
                )}

                <button
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${!connected
                        ? "bg-slate-700 text-gray-400 cursor-not-allowed"
                        : activeTab === "stake"
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-indigo-500/25"
                            : "bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-purple-500/25"
                        }`}
                    disabled={!connected || isStaking}
                    onClick={activeTab === "stake" ? handleStake : handleUnstake}
                >
                    {!connected
                        ? "Cüzdanı Bağlayın"
                        : activeTab === "stake"
                            ? <><ArrowUpRight className="w-5 h-5" /> {isStaking ? "Stake Ediliyor..." : "Stake Et"}</>
                            : <><ArrowDownLeft className="w-5 h-5" /> {isStaking ? "Çekim Yapılıyor.." : "Çekim Yap"}</>
                    }
                </button>
            </div>
        </div>
    );
}