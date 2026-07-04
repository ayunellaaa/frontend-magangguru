"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    // State input
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // State visibility password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State error
    const [error, setError] = useState("");
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

    // Calculate password strength
    const getPasswordStrength = (pw: string) => {
        if (!pw) return { score: 0, label: "", color: "bg-gray-200" };
        
        let score = 0;
        if (pw.length >= 6) score += 1;
        if (pw.length >= 8) score += 1;
        if (/[A-Z]/.test(pw)) score += 1;
        if (/[0-9]/.test(pw)) score += 1;
        if (/[^A-Za-z0-9]/.test(pw)) score += 1;

        if (score <= 2) {
            return { score: 1, label: "Lemah (Weak)", color: "bg-red-500", text: "text-red-500" };
        } else if (score <= 4) {
            return { score: 2, label: "Sedang (Medium)", color: "bg-amber-500", text: "text-amber-500" };
        } else {
            return { score: 3, label: "Kuat (Strong)", color: "bg-green-500", text: "text-green-500" };
        }
    };

    const strength = getPasswordStrength(password);

    // Handle submit register
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 1. Validasi input
        if (!email || !password || !name || !confirmPassword) {
            setError("Semua field wajib diisi");
            return;
        }
        // 2. Validasi format email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError("Format email salah");
            return;
        }
        // 3. Validasi panjang password
        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }
        // 4. Validasi konfirmasi password
        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak sama");
            return;
        }

        // 5. Validasi reCAPTCHA
        if (!recaptchaValue) {
            setError("Please verify you're not a robot");
            return;
        }

        // 6. Autentikasi dengan Supabase (Daftar Akun)
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        setError("");
        alert("Register berhasil! Silakan periksa email Anda untuk verifikasi atau langsung login.");
        router.push("/login");
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin,
            }
        });
        if (error) {
            setError(error.message);
        }
    };

    // Check if confirm password matches password
    const isPasswordMatching = confirmPassword === "" || password === confirmPassword;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Daftar Akun</h2>
                    <p className="text-gray-500 text-sm mt-2">Silahkan daftar untuk mengakses akun</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1 mt-2">Nama</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Masukkan Nama Anda"
                            required
                        />

                        <label className="block text-sm text-gray-700 font-medium mb-1 mt-3">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Masukkan Email Anda"
                            required
                        />

                        <label className="block text-sm text-gray-700 font-medium mb-1 mt-3">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Masukkan Password Anda"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="mt-2 space-y-1">
                                <div className="flex gap-1 h-1.5 w-full">
                                    <div className={`h-full flex-1 rounded-sm transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-gray-200"}`}></div>
                                    <div className={`h-full flex-1 rounded-sm transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-gray-200"}`}></div>
                                    <div className={`h-full flex-1 rounded-sm transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-gray-200"}`}></div>
                                </div>
                                <span className={`text-xs font-semibold ${strength.text}`}>
                                    Kekuatan password: {strength.label}
                                </span>
                            </div>
                        )}

                        <label className="block text-sm text-gray-700 font-medium mb-1 mt-3">Konfirmasi Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                                    isPasswordMatching ? "border-gray-300" : "border-red-500 focus:ring-red-500"
                                }`}
                                placeholder="Masukkan Konfirmasi Password Anda"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Mismatch Warning */}
                        {!isPasswordMatching && (
                            <span className="text-xs text-red-500 font-semibold mt-1 block">
                                Password tidak sama
                            </span>
                        )}
                    </div>

                    {/* Recaptcha */}
                    <div className="flex justify-center pt-2 max-w-full overflow-x-auto">
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            onChange={(value) => setRecaptchaValue(value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isPasswordMatching || password.length < 6 || !recaptchaValue}
                        className="w-full px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Daftar
                    </button>
                </form>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">atau</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Daftar dengan Google
                </button>

                <p className="text-center text-sm text-gray-600">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                        Login Sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}