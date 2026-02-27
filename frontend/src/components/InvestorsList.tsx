import { Users } from "lucide-react";

interface Investor {
    investor: string;
    amount: number;
}

interface InvestorsListProps {
    investors: Investor[]
}

export default function InvestorsList({ investors }: InvestorsListProps) {
    return (
        < div className="bg-slate-800/40 rounded-3xl p-8 border border-white/5" >
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
                        {investors && investors.length > 0 ? (
                            investors.map((investor, i) => (
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
        </div >
    );
}