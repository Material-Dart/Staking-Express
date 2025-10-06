"use client"

import { AlertCircle, Clock, Gift, Menu, Shield, TrendingUp, Users, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [countdown, setCountdown] = useState(21600); // 6 hours in seconds

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.screenY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 21600);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 3600).toString().padStart(2, "0")}:
  ${Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")}:
  ${(seconds % 60).toString().padStart(2, "0")}`;

  const navigateToLogin = () => window.location.href = "/login";

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
              <a href="#nasil-calisir" className="text-gray-300 hover:text-white transition-colors">Nasıl Çalışır</a>
              <a href="#komisyonlar" className="text-gray-300 hover:text-white transition-colors">Komisyonlar</a>
              <a href="#bonuslar" className="text-gray-300 hover:text-white transition-colors">Bonuslar</a>
              <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center gap-2" onClick={navigateToLogin}>
                <Wallet className="w-4 h-4" />
                Oturum Aç
              </button>
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
              <a href="#nasil-calisir" className="block text-gray-300 hover:text-white transition-colors">Nasıl Çalışır</a>
              <a href="#komisyonlar" className="block text-gray-300 hover:text-white transition-colors">Komisyonlar</a>
              <a href="#bonuslar" className="block text-gray-300 hover:text-white transition-colors">Bonuslar</a>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full flex items-center justify-center gap-2" onClick={navigateToLogin}>
                <Wallet className="w-4 h-4" />
                Oturum Aç
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-500/30">
              <span className="text-indigo-300 text-sm font-medium">🚀 SOL Staking Platformu</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              SOL Yatır,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Pasif Gelir Kazan</span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Staking Express ile SOL tokenlerinizi stake ederek otomatik ödüller kazanın. Şeffaf komisyon sistemi ve bonus havuzları ile yüksek getiri elde edin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center gap-2" onClick={navigateToLogin}>
                <Wallet className="w-5 h-5" />
                Hemen Başla
              </button>
              <button className="border-2 border-indigo-400 text-indigo-300 px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-500/10 transition-all">
                Daha Fazla Bilgi
              </button>
            </div>
          </div>

          {/* Live Stats */}
          <div className="bg-gradient-to-br from-slate-800/50 to-indigo-900/30 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">1234</div>
                <div className="text-gray-400">Toplam Stake Eden</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">45678</div>
                <div className="text-gray-400">Toplam SOL Stake</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">90123</div>
                <div className="text-gray-400">Bonus Ödül Havuzu</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">{formatTime(countdown)}</div>
                <div className="text-gray-400">Bonus Geri Sayımı</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Komisyon Yapısı */}
      <section id="komisyonlar" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Komisyon Yapısı</h2>
            <p className="text-xl text-gray-400">Şeffaf ve adil fee sistemi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-slate-800/50 to-indigo-900/20 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Stake Ederken</h3>
                  <p className="text-indigo-400 text-3xl font-bold">%10</p>
                </div>
              </div>
              <p className="text-gray-300">SOL yatırırken (stake ederken) yatırdığınız miktarın %10'u komisyon olarak alınır.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-indigo-900/20 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Unstake Ederken</h3>
                  <p className="text-red-400 text-3xl font-bold">%10</p>
                </div>
              </div>
              <p className="text-gray-300">SOL çekerken (unstake ederken) kalan %90'ın %10'u komisyon olarak alınır. Kazandığınız ödül komisyona dahil değildir.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/30">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">%10 Fee Nereye Gidiyor?</h3>
                  <p className="text-gray-300 mb-6">Komisyonlar adil bir şekilde dağıtılır ve ekosistemi destekler</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                      {item.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{item.percentage}</div>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bonus Sistemi */}
      <section id="bonuslar" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Bonus Sistemleri</h2>
            <p className="text-xl text-gray-400">Ekstra kazanç fırsatları</p>
          </div>

          <div>
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Bonus Havuz</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300">Son 6 saatte kimse yatırım yapmazsa son 10 yatırımcıya ödül dağıtılır</p>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300">Her 1 SOL yatırım, geri sayıma 15 dakika ekler</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300">Geri sayım her 12 saatte bir sıfırlanır</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <div className="font-semibold text-white mb-2">Sıfırlandığında:</div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-green-400 font-bold">40%</span> → Son 10 yatırımcıya
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-blue-400 font-bold">40%</span> → Tüm stake sahiplerine
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-purple-400 font-bold">20%</span> → Sonraki havuza taşınır
                </div>
              </div>
            </div>

            {/* Davet Sistemi */}
            <div className="bg-gradient-to-br from-slate-800/50 to-indigo-900/20 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Davet Ödülü</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-indigo-500/20 rounded-xl p-4 border border-indigo-500/30">
                  <div className="text-3xl font-bold text-indigo-400 mb-2">0.5%</div>
                  <p className="text-gray-300">Arkadaşlarınızın yatırdığı her SOL'den anında kazanın</p>
                </div>

                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300">Davet linkinizi paylaşın ve pasif gelir elde edin</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="font-semibold text-white mb-2">Davet Ödül Havuzu:</div>
                <p className="text-gray-300 text-sm mb-2">Davet linki kullanmayanlardan gelen %0.5 burada toplanır</p>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-indigo-400 font-bold">50%</span> → Her 30 günde bir tüm stake sahiplerine dağıtılır
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-purple-400 font-bold">50%</span> → Sonraki aya devredilir
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
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all flex items-center gap-2 mx-auto" onClick={navigateToLogin}>
            <Wallet className="w-5 h-5" />
            Oturum Aç ve Başla
          </button>
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
