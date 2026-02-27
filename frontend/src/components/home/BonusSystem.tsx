import { StakingActions, StakingData } from "@/hooks/useStaking";
import { Clock, Shield, Users } from "lucide-react";

interface BonusSystemProps {
    staking: StakingData & StakingActions;
    formatTime: (seconds: number) => string;
    localCountdown: number;
}

export default function BonusSystem({ staking, formatTime, localCountdown }: BonusSystemProps) {
    return (
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
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-linear" style={{ width: `${100 - (localCountdown / (12 * 60 * 60)) * 100}%` }}></div>
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
    );
}