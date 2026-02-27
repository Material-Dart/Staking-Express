"use client"

import { Menu, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useStaking } from "@/hooks/useStaking";
import dynamic from "next/dynamic";

// Dynamically import heavy components
const WalletMultiButton = dynamic(() => import("@solana/wallet-adapter-react-ui").then(wARU => wARU.WalletMultiButton), { ssr: false, loading: () => <div className="bg-slate-700 animate-pulse h-10 w-32 rounded-full" /> });

const HeroSection = dynamic(() => import("@/components/home/HeroSection"), { loading: () => <div className="h-screen animate-pulse bg-slate-800/20" /> });

const LiveStats = dynamic(() => import("@/components/home/LiveStats"), {
  loading: () => (
    <div className="bg-slate-800/50 rounded-2xl p-8 border border-indigo-500/20 animate-pulse">
      <div className="h-24 bg-slate-700/50 rounded" />
    </div>)
});

const FeeBreakdown = dynamic(() => import("@/components/home/FeeBreakdown"), {
  loading: () => <div className="py-24 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="h-96 bg-slate-800/20 rounded-2xl animate-pulse" />
    </div>
  </div>
});

const BonusSystem = dynamic(() => import("@/components/home/BonusSystem"), {
  loading: () => <div className="py-24 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="h-96 bg-slate-800/20 rounded-2xl animate-pulse" />
    </div>
  </div>
});

const CTASection = dynamic(() => import("@/components/home/CTASection"), { loading: () => <div className="h-64 bg-slate-800/20 rounded-2xl animate-pulse" /> });

export default function Home() {
  const { connected } = useWallet();
  const staking = useStaking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [localCountdown, setLocalCountdown] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setLocalCountdown(staking.bonusCountdown);
  }, [staking.bonusCountdown]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/90 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Staking Express</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#komisyonlar" className="text-gray-300 hover:text-white transition-colors">Komisyonlar</a>
              <a href="#bonuslar" className="text-gray-300 hover:text-white transition-colors">Bonuslar</a>
              <WalletMultiButton className="!bg-gradient-to-r !from-indigo-500 !to-purple-500 !text-white !px-6 !py-2 !rounded-full !h-auto !text-sm !font-medium" />
            </div>

            <button className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-3">
              <a href="#komisyonlar" className="block text-gray-300 hover:text-white transition-colors">Komisyonlar</a>
              <a href="#bonuslar" className="block text-gray-300 hover:text-white transition-colors">Bonuslar</a>
              <div className="flex justify-center py-2">
                <WalletMultiButton className="!w-full !bg-gradient-to-r !from-indigo-500 !to-purple-500 !h-auto !py-3 !rounded-full" />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <HeroSection connected={connected} isMounted={isMounted} />

      {/* Live Stats */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <LiveStats staking={staking} formatTime={formatTime} localCountdown={localCountdown} />
        </div>
      </div>

      {/* Fee Section */}
      <FeeBreakdown />

      {/* Features Section */}
      <BonusSystem staking={staking} formatTime={formatTime} localCountdown={localCountdown} />

      {/* CTA Section */}
      <CTASection connected={connected} isMounted={isMounted} />

      {/* Footer */}
      <footer className="border-t border-indigo-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Staking Express</span>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-400 text-sm">
            <p>© 2025 Staking Express. Material Dart tarafından desteklenmektedir.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
