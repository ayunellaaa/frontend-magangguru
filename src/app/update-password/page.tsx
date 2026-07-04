"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";

export default function UpdatePasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form match checks
    const isPasswordMatching = confirmPassword === "" || password === confirmPassword;

    // Handle password update
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!password || !confirmPassword) {
            setError("Semua field wajib diisi");
            return;
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak sama");
            return;
        }

        setIsLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) throw updateError;

            setSuccess("Password Anda berhasil diperbarui! Mengalihkan ke halaman login...");
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            console.error("Gagal memperbarui password:", err);
            setError(err.message || "Gagal memperbarui password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 relative mt-12 sm:mt-0">
                
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Password Baru</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Silakan buat password baru untuk mengamankan akun Anda
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-700 font-medium mb-1.5">Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                                    placeholder="Masukkan Password Baru"
                                    required
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                    <Lock size={18} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 font-medium mb-1.5">Konfirmasi Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-2.5 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 ${
                                        isPasswordMatching ? "border-gray-300" : "border-red-500 focus:ring-red-500"
                                    }`}
                                    placeholder="Konfirmasi Password Baru"
                                    required
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                                    <Lock size={18} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {!isPasswordMatching && (
                                <span className="text-xs text-red-500 font-semibold mt-1 block">
                                    Password tidak sama
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !isPasswordMatching || password.length < 6}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? "Memperbarui..." : "Perbarui Password"}
                    </button>
                </form>

            </div>
        </div>
    );
}
