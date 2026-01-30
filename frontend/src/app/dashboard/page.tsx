"use client"

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useStaking } from "@/hooks/useStaking";
import { TrendingUp, Wallet, Clock, Users, Shield, ArrowUpRight, ArrowDownLeft, AlertCircle, LogOut, Menu, X } from "lucide-react";
import { getExplorerUrl } from "@/lib/constants";
import Link from "next/link";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Dashboard() {
    const { connected, publicKey } = useWallet();
    const staking = useStaking();
    const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
    const [amount, setAmount] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    // Safe handlers (placeholders until hooked up to actual contract calls beyond read)
    const handleStake = async () => {
        if (!amount || !staking.stake) return;
        setLastSignature(null);
        try {
            const tx = await staking.stake(Number(amount));
            setAmount("");
            setLastSignature(tx);
            console.log("Tx signature:", tx);
        } catch (e) {
            console.error(e);
            alert("Stake failed: " + (e as Error).message);
        }
    };

    const handleUnstake = async () => {
        if (!amount || !staking.unstake) return;
        setLastSignature(null);
        try {
            const tx = await staking.unstake(Number(amount));
            setAmount("");
            setLastSignature(tx);
            console.log("Tx signature:", tx);
        } catch (e) {
            console.error(e);
            alert("Unstake failed: " + (e as Error).message);
        }
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

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Transaction Notification */}
                {lastSignature && (
                    <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">İşlem Başarılı!</div>
                                <div className="text-xs text-indigo-300 font-mono flex items-center gap-2">
                                    <span className="opacity-70">İşlem Kimliği:</span>
                                    <span>{lastSignature.slice(0, 8)}...{lastSignature.slice(-8)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <button
                                onClick={() => setLastSignature(null)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <a
                                href={getExplorerUrl(lastSignature)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                            >
                                Explorer'da Gör <ArrowUpRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
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
                                    disabled={!connected}
                                    onClick={activeTab === "stake" ? handleStake : handleUnstake}
                                >
                                    {!connected
                                        ? "Cüzdanı Bağlayın"
                                        : activeTab === "stake"
                                            ? <><ArrowUpRight className="w-5 h-5" /> Stake Et</>
                                            : <><ArrowDownLeft className="w-5 h-5" /> Çekim Yap</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Stats */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Protocol Overview Card */}
                        <div className="bg-slate-800/40 rounded-3xl p-8 border border-white/5">
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
                            </div>
                        </div>

                        {/* Last Investors List aka "Wall of Fame" */}
                        <div className="bg-slate-800/40 rounded-3xl p-8 border border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-400" />
                                    Son 10 Yatırımcı
                                </h2>
                                <div className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                    Potansiyel Kazananlar
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                                            <th className="py-3 font-medium">Sıra</th>
                                            <th className="py-3 font-medium">Cüzdan</th>
                                            <th className="py-3 font-medium text-right">Miktar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {staking.lastTenInvestors && staking.lastTenInvestors.length > 0 ? (
                                            staking.lastTenInvestors.map((investor, i) => (
                                                <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                    <td className="py-3 text-sm text-gray-400 pl-2">#{i + 1}</td>
                                                    <td className="py-3">
                                                        <div className="font-mono text-sm text-indigo-300 bg-indigo-500/5 px-2 py-1 rounded w-fit group-hover:bg-indigo-500/20 transition-colors">
                                                            {investor.investor.slice(0, 4)}...{investor.investor.slice(-4)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-right text-sm font-medium text-white">
                                                        {investor.amount.toFixed(2)} SOL
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="text-center">
                                                <td colSpan={3} className="py-4 text-xs text-gray-500 italic">
                                                    Henüz yatırımcı yok.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
