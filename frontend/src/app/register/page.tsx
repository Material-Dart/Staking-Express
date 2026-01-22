"use client"

import { Gift } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ "password": "", "confirmPassword": "", "email": "" });
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [invitationCode, setInvitationCode] = useState("");

    const handleCreateAccount = () => {
        if (validateForm()) {
            console.log('Account creation attempted with:', {
                email,
                password,
                invitationCode: invitationCode || null
            });
        }
    };

    const validateForm = () => {
        const newErrors = { "password": "", "confirmPassword": "", "email": "" };

        if (!email) {
            newErrors.email = "Email gerekli"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Geçersiz email";
        }

        if (!password) {
            newErrors.password = "Şifre gerekli"
        } else if (password.length < 6) {
            newErrors.password = "Şifre en az 6 karakter olmalıdır";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Lütfen şifrenizi onaylayınız";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Şifreler uyuşmuyor";
        }

        setErrors(newErrors);
        return !newErrors.password && !newErrors.confirmPassword && !newErrors.email;
    };

    const navigateToLogin = () => window.location.href = "/login";

    const navigateToHome = () => window.location.href = "/";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Register Card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-500/20">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-1 p-2">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Staking Express</h1>
                        <p className="text-gray-400">Başlamak İçin Yeni Hesap Oluşturun!</p>
                    </div>

                    {/* Register Form */}
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Emailinizi Giriniz" className={`w-full px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                                }`} required />
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifrenizi Giriniz" className={`w-full px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 transition-all pr-12 ${errors.password ? "ring-2 ring-red-500" : "focus:ring-blue-500"}`} required />
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <div className="relative">
                                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Şifrenizi Yeniden Giriniz" className={`w-full px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 transition-all pr-12 ${errors.confirmPassword ? "ring-2 ring-red-500" : "focus:ring-blue-500"}`} required />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Invitation Code Input (Optional) */}
                        <div>
                            <div className="relative">
                                <input type="text" value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} placeholder="Davet Kodu (opsiyonel)" className="w-full px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 transition-all pl-11 focus:ring-blue-500" />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Gift className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs mt-1 ml-1">Davet kodu ile arkadaşın senin yatırdığın SOL'lerin %0.5ini anında kazansın!</p>
                        </div>

                        {/* Create Account Button */}
                        <button onClick={handleCreateAccount} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50 mt-6">Hesap Oluştur</button>
                    </div>

                    {/* Footer Links */}
                    <div className="text-center mt-6">
                        <span className="text-gray-400 text-sm">Zaten Hesabın Var Mı? </span>
                        <button onClick={navigateToLogin} className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">Oturum Aç</button>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <button onClick={navigateToHome} className="text-gray-400 hover:text-white transition-colors text-sm">← Ana Sayfaya Dön</button>
                </div>
            </div>
        </div>
    );
}