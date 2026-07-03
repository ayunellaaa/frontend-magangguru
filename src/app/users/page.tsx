"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";

type User = {
    id: number;
    name: string;
    email: string;
    role: "Admin" | "Siswa";
}

//Data dummy
const dummyUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `User ${i + 1}@sekolah.com`,
    role: i % 3 === 0 ? "Admin" : "Siswa"
}));

const ITEMS_PER_PAGE = 10;

function UsersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    //state label
    const [isLoading, setIsLoading] = useState(false);
    const [selectQRcode, setSelectedQRCode] = useState<User | null>(null);

    //1 state untuk mencari dan debounce
    const [searchQuery, setSearchQuery] = useState('');
    const [debounceQuery, setDebounceQuery] = useState('');

    //2 state untuk debounce
    const filteredUsers = dummyUsers.filter((user) => {
        const query = debounceQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)

        )
    })

    //logic pagination
    const page = Number(searchParams.get("page") || 1);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentUsers = dummyUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(dummyUsers.length / ITEMS_PER_PAGE);

    //efel loading saat halamam berubah
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [page, debounceQuery]);

    //fungsi navigasi pagination
    const handlePageChange = (newPage: number) => {
        router.push(`/users?page=${newPage}`);
    }

    //Fungsi QR Code
    const getQRCodeUrl = (user: User | null) => {
        // PENGAMAN: Jika user masih null (saat awal render), kembalikan string kosong agar tidak eror
        if (!user) {
            return "";
        }

        // MEMUTUS ALUR LINK: Kita pisahkan karakter '@' dan titik '.' pada domain agar tidak membentuk format web
        // Contoh: "User 1@sekolah.com" akan berubah menjadi "User 1 (at) sekolah [dot] com"
        const safeEmail = user.email
            .replace("@", " (at) ")
            .replace(".com", " [dot] com");

        // Susun format teks keterangan biasa
        const textTeks = `DETAIL DATA USER\n-----------------\nID: ${user.id}\nNama: ${user.name}\nEmail: ${safeEmail}\nRole: ${user.role}`;

        // Encode data teks agar aman dikirim ke URL API
        const encodedData = encodeURIComponent(textTeks);

        return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodedData}`;
    };

    const handleQRCodeClick = (user: User) => {
        setSelectedQRCode(user);
    }

    const handleCloseModal = () => {
        setSelectedQRCode(null);
    }

    return (
        <MainLayout>
            <PageTransition>
                <div className="min-h-screen bg-gray-100 p-8 font-sans">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">

                        {/* 2. Tambahkan Menu/Tombol Kembali ke Home di sini */}
                        <div className="mb-6">
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm w-fit"
                            >
                                {/* Icon panah ke kiri */}
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Home
                            </Link>
                        </div>
                        {/* Pencarian */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama, email, atau role..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    const timer = setTimeout(() => {
                                        setDebounceQuery(e.target.value);
                                    }, 300);

                                    return () => clearTimeout(timer);
                                }}
                            />
                        </div>

                        {/* Tabel User */}
                        <div className="border rounded-lg overflow-hidden min-h-[300px] relative">
                            {/* Loading State */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                    <div className="flex flex-col items-center">
                                        {/* SPiner */}
                                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                                        <span className="text-indigo-600mfont-semibold text-sm">Loading...</span>
                                    </div>
                                </div>
                            )}

                            {/* Tabel */}
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 font-semibold uppercase">
                                    <tr>
                                        <th className="p-4 border-b">ID</th>
                                        <th className="p-4 border-b">Nama</th>
                                        <th className="p-4 border-b">Email</th>
                                        <th className="p-4 border-b">Role</th>
                                        <th className="p-4 border-b">QR Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition border-b last:border-0">
                                            <td className="p-4">{user.id}</td>
                                            <td className="p-4 font-semibold text-gray-900">{user.name}</td>
                                            <td className="p-4">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full ${user.role === "Admin" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>{user.role}</span></td>
                                            <td className="p-4">
                                                <img
                                                    src={getQRCodeUrl(user)}
                                                    className="w-16 h-16 cursor-pointer hover:scale-110 transition"
                                                    onClick={() => handleQRCodeClick(user)}
                                                    alt="QR Code"
                                                >
                                                </img>
                                            </td>
                                        </tr>
                                    ))}
                                    {dummyUsers.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-gray-400">
                                                Tidak ada data user.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                Halaman <b>{page}</b> Dari <b>{totalPages}</b> Halaman
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className={`px-4 py-2 border rounded-lg ${page === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className={`px-4 py-2 border rounded-lg ${page === totalPages
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    Selanjutnya
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Modal QR Code */}
                    {selectQRcode && (
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm"
                            onClick={handleCloseModal}
                        >
                            {/* Card */}
                            <div
                                className="bg-white rounded-lg p-6 max-w-md w-full-relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={handleCloseModal}
                                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-700">
                                    <X size={24} />
                                </button>

                                Informasi User
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{selectQRcode?.name}</h2>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>
                                            <span className="font-semibold">
                                                ID: </span>{selectQRcode.id}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Email: </span>{selectQRcode.email}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Role: </span>{selectQRcode.role}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <img
                                        src={getQRCodeUrl(selectQRcode)}
                                        className="w-60 h-60 rounded-lg"
                                        alt="QR Code"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PageTransition>
        </MainLayout>
    );
}

export default function UsersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        }>
            <UsersContent />
        </Suspense>
    );
}

