"use client"

import { AlertCircle, Clock, Gift, Menu, Shield, TrendingUp, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useStaking } from "@/hooks/useStaking";

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

  const navigateToDashboard = () => window.location.href = "/dashboard";

  const feeBreakdown = [
    { percentage: "7%", description: "Havuzdaki stake sahiplerine dağıtılır", icon: <Users className="w-5 h-5" />, color: "from-green-500 to-emerald-500" },
    { percentage: "1%", description: "Havuza bonus ödül olarak eklenir", icon: <Gift className="w-5 h-5" />, color: "from-purple-500 to-pink-500" },
    { percentage: "1%", description: "Platform komisyonu", icon: <Shield className="w-5 h-5" />, color: "from-blue-500 to-cyan-500" },
    { percentage: "0.5%", description: "Davet linki sahiplerine ödül", icon: <Users className="w-5 h-5" />, color: "from-orange-500 to-amber-500" },
    { percentage: "0.5%", description: "Material Dart ekibine", icon: <TrendingUp className="w-5 h-5" />, color: "from-indigo-500 to-purple-500" },
  ];

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
              {isMounted && <WalletMultiButton className="!bg-gradient-to-r !from-indigo-500 !to-purple-500 !text-white !px-6 !py-2 !rounded-full !h-auto !text-sm !font-medium" />}
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
                {isMounted && <WalletMultiButton className="!w-full !bg-gradient-to-r !from-indigo-500 !to-purple-500 !h-auto !py-3 !rounded-full" />}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
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

          {/* Live Stats */}
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
        </div>
      </div>

      {/* Fee Section */}
      <section id="komisyonlar" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Şeffaf Komisyon Yapısı</h2>
            <p className="text-gray-400">Her yatırımda ve çekimde uygulanan %10 komisyonun dağılımı</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {feeBreakdown.map((fee, index) => (
              <div key={index} className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${fee.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {fee.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{fee.percentage}</div>
                <div className="text-sm text-gray-400 leading-relaxed">{fee.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-indigo-400 shrink-0" />
            <p className="text-indigo-200/70 text-sm">
              Önemli: Biriken ödüllerinizi çekerken herhangi bir komisyon uygulanmaz. %10 komisyon sadece ana para yatırma ve çekme işlemlerinde geçerlidir.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="bonuslar" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Eşsiz Bonus Sistemi</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">12 Saatlik Geri Sayım</h3>
                    <p className="text-gray-400">Her 1 SOL ve üzeri yatırım geri sayımı 15 dakika uzatır (max 12 saat).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Son 10 Yatırımcı</h3>
                    <p className="text-gray-400">Geri sayım bittiğinde havuzun %40&apos;ı son 10 yatırımcıya dağıtılır.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Tüm Stake Sahipleri</h3>
                    <p className="text-gray-400">Havuzun diğer %40&apos;ı tüm stake sahiplerine payları oranında dağıtılır.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-slate-800 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-gray-400 font-medium">Aktif Bonus Havuzu</div>
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    Canlı
                  </div>
                </div>
                <div className="text-5xl font-bold text-white mb-2">{staking.bonusPoolBalance.toFixed(2)} SOL</div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-8">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-2/3"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Katılımcı Sayısı</div>
                    <div className="text-lg font-bold text-white">{staking.totalParticipants}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Geri Sayım</div>
                    <div className="text-lg font-bold text-indigo-400">{formatTime(localCountdown)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
