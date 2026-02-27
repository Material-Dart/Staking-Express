import { Shield, ArrowUpRight, X } from "lucide-react";
import { getExplorerUrl } from "@/lib/constants";

interface TransactionNotificationProps {
    signature: string,
    onClose: () => void
}

export default function TransactionNotification({ signature, onClose }: TransactionNotificationProps) {
    return (
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
                        <span>{signature.slice(0, 8)}...{signature.slice(-8)}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <a
                    href={getExplorerUrl(signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                    Explorer&apos;da Gör <ArrowUpRight className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}