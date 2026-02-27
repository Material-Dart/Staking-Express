import { AlertCircle, Gift, Shield, TrendingUp, Users } from "lucide-react";

export default function FeeBreakdown() {
    const feeBreakdown = [
        { percentage: "7%", description: "Havuzdaki stake sahiplerine dağıtılır", icon: <Users className="w-5 h-5" />, color: "from-green-500 to-emerald-500" },
        { percentage: "1%", description: "Havuza bonus ödül olarak eklenir", icon: <Gift className="w-5 h-5" />, color: "from-purple-500 to-pink-500" },
        { percentage: "1%", description: "Platform komisyonu", icon: <Shield className="w-5 h-5" />, color: "from-blue-500 to-cyan-500" },
        { percentage: "0.5%", description: "Davet linki sahiplerine ödül", icon: <Users className="w-5 h-5" />, color: "from-orange-500 to-amber-500" },
        { percentage: "0.5%", description: "Material Dart ekibine", icon: <TrendingUp className="w-5 h-5" />, color: "from-indigo-500 to-purple-500" },
    ];

    return (
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
    );
}