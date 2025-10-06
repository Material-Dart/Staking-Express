"use client"

import { FormEvent, useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();

        console.log('Login attempted with:', { email, password });
    }

    const handleCreateAccount = () => window.location.href = "/register";

    const handleForgotPassword = () => window.location.href = "/forgot-password";

    const navigateToHome = () => window.location.href = "/";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-500/20">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-8">
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
                        <p className="text-gray-400">Hoş Geldiniz!</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Emailinizi Giriniz" className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
                        </div>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifrenizi Giriniz" className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12" required />
                        </div>

                        {/* Login Button */}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50 mt-6">Giriş Yap</button>
                    </form>

                    {/* Footer Links */}
                    <div className="flex justify-between items-center mt-6">
                        <button onClick={handleCreateAccount} className="text-blue-400 hover:text-blue-300 transition-colors text-sm">Yeni Hesap Oluştur</button>
                        <button onClick={handleForgotPassword} className="text-blue-400 hover:text-blue-300 transition-colors text-sm">Şifremi Unuttum</button>
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