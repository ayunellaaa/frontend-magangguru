"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
    const router = useRouter();

    //State input
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    //State error
    const [error, setError] = useState("");
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

    //Handle submit register
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //1.Validasi input
        if (!email || !password || !name || !confirmPassword) {
            setError("Semua field wajib diisi");
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
        //4.Validasi konfirmasi password
        if (password !== confirmPassword) {
            setError("Konfirmasi password salah");
            return;
        }

        //5.Validasi reCAPTCHA
        if (!recaptchaValue) {
            setError("Please verify you're not a robot");
            return;
        }

        //6. Autentikasi dengan Supabase (Daftar Akun)
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

        //jika lolos
        setError("");
        alert("Register berhasil! Silakan periksa email Anda untuk verifikasi atau langsung login.")
        router.push("/login");
    }

    return (
        <div className="min-h-screen flex items-center justify-content bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Daftar Akun</h2>
                    <p className="text-gray-500 text-sm mt-2">Silahkan daftar untuk mengakses akun</p>
                    {error && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm text-gray-700 font-medium mb-2 mt-3">Nama</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Masukkan Nama Anda"
                        />
                        <label className="block text-sm text-gray-700 font-medium mb-2 mt-3">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Masukkan Email Anda"
                        />
                        <label className="block text-sm text-gray-700 font-medium mb-2 mt-3">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Masukkan Password Anda"
                        />
                        <label className="block text-sm text-gray-700 font-medium mb-2 mt-3">Konfirmasi Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Masukkan Konfirmasi Password Anda"
                        />
                    </div>
                    {/* Recaptcha disini */}
                    <div className="flex justify-center pt-2">
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            onChange={(value) => setRecaptchaValue(value)}
                        />
                    </div>

                    <button type="submit" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-500">
                        Daftar
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">Sudah punya akun? {""}
                    <Link href="/login" className="text-blue-500 hover:underline font-medium">
                        Login Sekarang
                    </Link>
                </p>
            </div>
        </div>
    )

}