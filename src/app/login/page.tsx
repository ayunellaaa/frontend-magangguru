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