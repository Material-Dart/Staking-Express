"use client"

import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(() => import("@solana/wallet-adapter-react-ui").then(wARU => wARU.WalletMultiButton), { ssr: false });

interface CTASectionProps {
    connected: boolean;
    isMounted: boolean;
}

export default function CTASection({ connected, isMounted }: CTASectionProps) {
    const navigateToDashboard = () => window.location.href = "/dashboard";

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12">
                <h2 className="text-4xl font-bold text-white mb-4">Hemen Stake Etmeye Başla</h2>
                <p className="text-xl text-indigo-100 mb-8">SOL tokenlerinizi yatırın, otomatik ödüller kazanın</p>
                <div className="flex justify-center">
                    {connected ? (
                        <button className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all flex items-center gap-2" onClick={navigateToDashboard}>
                            <TrendingUp className="w-5 h-5" />
                            Dashboard&apos;ı Aç
                        </button>
                    ) : (
                        isMounted && <WalletMultiButton className="!bg-white !text-indigo-600 !px-8 !py-4 !rounded-full !h-auto !font-semibold" />
                    )}
                </div>
            </div>
        </section>
    );
}