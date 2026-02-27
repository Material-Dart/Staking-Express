"use client"

import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(() => import("@solana/wallet-adapter-react-ui").then(wARU => wARU.WalletMultiButton), { ssr: false });

interface HeroSectionProps {
    connected: boolean;
    isMounted: boolean;
}

export default function HeroSection({ connected, isMounted }: HeroSectionProps) {
    const navigateToDashboard = () => window.location.href = "/dashboard";

    return (
        <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-sm font-medium text-indigo-300">Platform Canlıda</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                        Solana Üzerinde <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Geleceğin Staking Protokolü
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Yüksek verimli, güvenli ve topluluk odaklı staking deneyimi.
                        SOL yatırın, gerçek zamanlı ödüller kazanın ve bonus havuzlarından faydalanın.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {connected ? (
                            <button className="group bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center gap-2" onClick={navigateToDashboard}>
                                <TrendingUp className="w-5 h-5" />
                                Dashboard&apos;ı Aç
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                {isMounted && <WalletMultiButton className="!bg-gradient-to-r !from-indigo-500 !to-purple-500 !rounded-full !px-8 !py-4 !h-auto !font-semibold" />}
                            </div>
                        )}
                        <button className="border-2 border-indigo-400 text-indigo-300 px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-500/10 transition-all">
                            Daha Fazla Bilgi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}