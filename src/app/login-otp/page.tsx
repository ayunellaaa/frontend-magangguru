"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReCAPTCHA from "react-google-recaptcha";
import { Mail, ArrowLeft, Send, ShieldCheck, KeyRound, Loader2 } from "lucide-react";

export default function LoginOtpPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<1 | 2>(1); // Step 1: Request OTP, Step 2: Verify OTP

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

    // Countdown timer state
    const [countdown, setCountdown] = useState(0);

    // Tick countdown
    useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Handle Send OTP (Step 1 or Resend)
    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email) {
            setError("Email wajib diisi");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError("Format email salah");
            return;
        }

        // Only enforce recaptcha on step 1 (first request)
        if (step === 1 && !recaptchaValue) {
            setError("Please verify you're not a robot");
            return;
        }

        setIsLoading(true);
        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: false, // only allow existing users to log in
                }
            });

            if (otpError) throw otpError;

            setSuccess("Kode OTP berhasil dikirim! Silakan periksa kotak masuk atau spam email Anda.");
            setStep(2);
            setCountdown(60); // start 60-second countdown
        } catch (err: any) {
            console.error("Gagal mengirim OTP:", err);
            setError(err.message || "Gagal mengirim kode OTP. Pastikan email Anda sudah terdaftar.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Verify OTP (Step 2)
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!otp.trim()) {
            setError("Kode OTP wajib diisi");
            return;
        }

        setIsLoading(true);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: email,
                token: otp.trim(),
                type: "email",
            });

            if (verifyError) throw verifyError;

            setSuccess("Verifikasi berhasil! Mengalihkan ke dashboard...");

            // Redirect immediately
            router.push("/");
        } catch (err: any) {
            console.error("Verifikasi OTP gagal:", err);
            setError(err.message || "Kode OTP salah atau telah kadaluarsa.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 relative mt-12 sm:mt-0">

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Masuk dengan OTP</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {step === 1
                            ? "Masukkan email Anda untuk menerima kode OTP 6-digit"
                            : "Masukkan kode OTP yang dikirim ke email Anda"
                        }
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    /* Step 1: Request OTP Form */
                    <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 font-medium mb-1.5">Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                                        placeholder="Masukkan Email Anda"
                                        required
                                        disabled={isLoading}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                        <Mail size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !recaptchaValue}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Kirim Kode OTP
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    /* Step 2: Verify OTP Form */
                    <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
                        <div className="space-y-4">
                            <div>
                                <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 mb-2">
                                    Kode OTP dikirim ke: <strong className="font-semibold">{email}</strong>
                                </div>
                                <label className="block text-sm text-gray-700 font-medium mb-1.5">Kode OTP 6-Digit</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={8}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-mono tracking-widest text-center text-lg"
                                        placeholder="******"
                                        required
                                        disabled={isLoading}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                        <ShieldCheck size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.trim().length < 6}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memverifikasi...
                                </>
                            ) : (
                                <>
                                    <KeyRound size={16} />
                                    Verifikasi & Masuk
                                </>
                            )}
                        </button>

                        {/* Countdown / Kirim Ulang OTP */}
                        <div className="text-center text-xs text-gray-500 mt-2 bg-slate-50 py-2 rounded-lg border border-gray-100">
                            {countdown > 0 ? (
                                <span>Kirim ulang OTP dalam <strong className="font-semibold text-blue-600">{countdown} detik</strong></span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleSendOtp()}
                                    disabled={isLoading}
                                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline focus:outline-none disabled:opacity-50 cursor-pointer"
                                >
                                    Kirim Ulang OTP
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setOtp("");
                                setSuccess(null);
                                setError(null);
                            }}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2 block hover:underline"
                            disabled={isLoading}
                        >
                            Ganti Email
                        </button>
                    </form>
                )}

                <div className="text-center pt-2">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Login
                    </Link>
                </div>

            </div>
        </div>
    );
}
