"use client"

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStaking } from "@/hooks/useStaking";
import { TrendingUp, Wallet, Clock, Users, Shield } from "lucide-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import heavy components with loading states
const WalletMultiButton = dynamic(
    () => import("@solana/wallet-adapter-react-ui").then(wARU => wARU.WalletMultiButton), { ssr: false, loading: () => (<div className="bg-slate-700 animate-pulse h-10 w-32 rounded-full" />) });

const TransactionNotification = dynamic(() => import("@/components/TransactionNotification"), { ssr: false, loading: () => <div className="h-20 bg-slate-800/50 rounded-2xl animate-pulse mb-8" /> });

const StakeUnstakeCard = dynamic(() => import("@/components/StakeUnstakeCard"), {
    loading: () => (<div className="bg-slate-800/80 rounded-3xl p-6 border border-white/5 animate-pulse">
        <div className="h-64 bg-slate-700/50 rounded-xl" />
    </div>)
});

const ProtocolStats = dynamic(() => import("@/components/ProtocolStats"), {
    loading: () => (<div className="bg-slate-800/80 rounded-3xl p-6 border border-white/5 animate-pulse">
        <div className="h-64 bg-slate-700/50 rounded-xl" />
    </div>)
});

const InvestorsList = dynamic(() => import("@/components/InvestorsList"), {
    loading: () => (<div className="bg-slate-800/80 rounded-3xl p-6 border border-white/5 animate-pulse">
        <div className="h-64 bg-slate-700/50 rounded-xl" />
    </div>)
});

export default function Dashboard() {
    const { connected } = useWallet();
    const staking = useStaking();
    const [isMounted, setIsMounted] = useState(false);
    const [localCountdown, setLocalCountdown] = useState(0);
    const [lastSignature, setLastSignature] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setLocalCountdown(staking.bonusCountdown);
    }, [staking.bonusCountdown]);

    useEffect(() => {
        const timer = setInterval(() => {
            setLocalCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const s = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const handleClaim = async () => {
        if (!staking.claim) return;
        setLastSignature(null);
        try {
            const tx = await staking.claim();
            setLastSignature(tx);
            console.log("Tx signature:", tx);
        } catch (e) {
            console.error(e);
            alert("Claim failed: " + (e as Error).message);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500/30">
            {/* Navbar */}
            <nav className="border-b border-indigo-500/10 bg-slate-900/80 backdrop-blur-xl fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-shadow">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Staking Express
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm text-gray-400">Sistem Normal</span>
                            </div>
                            <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-full !h-10 !px-6 !text-sm !font-medium transition-all" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Transaction Notification */}
                {lastSignature && (
                    <TransactionNotification signature={lastSignature} onClose={() => setLastSignature(null)} />
                )}

                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">Hoşgeldin, Yatırımcı</h1>
                    <p className="text-gray-400">Portföy durumunuz ve aktif havuz istatistikleri</p>
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                <Wallet className="w-6 h-6 text-indigo-400" />
                            </div>
                            <span className="text-xs font-mono text-gray-500 bg-slate-900 px-2 py-1 rounded">SOL</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{staking.userStaked.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">Sizin Stake Miktarınız</div>
                    </div>

                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                                <Shield className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="text-xs font-mono text-gray-500 bg-slate-900 px-2 py-1 rounded">SOL</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{staking.userRewards.toFixed(4)}</div>
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">Biriken Ödül</div>
                            <button
                                onClick={handleClaim}
                                disabled={staking.userRewards <= 0 || !staking.claim}
                                className="text-xs text-purple-400 hover:text-purple-300 font-semibold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Talep Et
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                                <Users className="w-6 h-6 text-pink-400" />
                            </div>
                            <span className="text-xs font-mono text-gray-500 bg-slate-900 px-2 py-1 rounded">SOL</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{staking.bonusPoolBalance.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">Bonus Havuzu</div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-6 rounded-2xl border border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-indigo-400/10 rounded-xl border border-indigo-400/20">
                                <Clock className="w-6 h-6 text-indigo-300" />
                            </div>
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                        </div>
                        <div className="text-3xl font-mono font-bold mb-1 text-white relative z-10">{formatTime(localCountdown)}</div>
                        <div className="text-sm text-indigo-200 relative z-10">Bonus Geri Sayımı</div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stake/Unstake */}
                    <div className="lg:col-span-1">
                        <StakeUnstakeCard staking={staking} connected={connected} onTransactionComplete={setLastSignature} />
                    </div>

                    {/* Right Column: Detailed Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProtocolStats staking={staking} connected={connected} onTransactionComplete={setLastSignature} />
                        <InvestorsList investors={staking.lastTenInvestors || []} />
                    </div>
                </div>
            </main>
        </div>
    );
}
