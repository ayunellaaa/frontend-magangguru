"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    //State input
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    //State error
    const [error, setError] = useState("");
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

    //Handle submit register
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //1.Validasi input
        if (!email || !password) {
            setError("Email & Password wajib diisi");
            return;
        }
        //2.Validasi format email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError("Format email salah");
            return;
        }
        //3.Validasi panjang password
        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        //4.Validasi reCAPTCHA
        if (!recaptchaValue) {
            setError("Please verify you're not a robot");
            return;
        }

        //5. Autentikasi dengan Supabase
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            return;
        }

        //jika lolos
        setError("");
        alert("Login berhasil!")
        router.push("/");
    }

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 relative mt-12 sm:mt-0">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Masuk Akun</h2>
                    <p className="text-gray-500 text-sm mt-2">Silakan login untuk mengakses dashboard</p>
                    {error && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 mt-4 rounded-lg text-sm text-left">
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-700 font-medium mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                                placeholder="Masukkan Email Anda"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 pr-10"
                                    placeholder="Masukkan Password Anda"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Recaptcha disini */}
                    <div className="flex justify-center pt-2 w-full overflow-hidden sm:overflow-visible">
                        <div className="transform scale-85 sm:scale-100 origin-center">
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                onChange={(value) => setRecaptchaValue(value)}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-2.5 border border-transparent rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-2">
                        Masuk
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
                    Masuk dengan Google
                </button>

                <p className="text-center text-sm text-gray-600">
                    Belum punya akun?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline font-semibold">
                        Daftar Sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}