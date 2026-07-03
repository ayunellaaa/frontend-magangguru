"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";
import { useNotification } from "@/components/layout/NotificationComponent";

interface SavedData {
    local: {
        name: string | null;
        theme: string | null;
        preferences: string | null;
    };

    session: {
        filter: string | null;
        page: string | null;
    };
}

export default function WebStoragePage() {
    const [name, setName] = useState("");
    const [theme, setTheme] = useState("light");
    const [filter, setFilter] = useState("");
    const [savedData, setSavedData] = useState<SavedData | null>(null); // Perbaikan: setName menjadi setSavedData
    const { sendNotification } = useNotification();

    //Load data saat komponen dimount
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "light";
        setTheme(storedTheme);
        loadAllData();
    }, []);

    //Fungsi Load All data
    const loadAllData = () => {
        const local = {
            name: localStorage.getItem("userName"),
            theme: localStorage.getItem("theme"),
            preferences: localStorage.getItem("preferences"),
        };

        const session = {
            filter: sessionStorage.getItem("filter"),
            page: sessionStorage.getItem("page"),
        }
        setSavedData({ local, session }); // Perbaikan: setSaveData menjadi setSavedData
    };

    //Fungsi untuk simpan nama di local storage
    const saveName = () => {
        localStorage.setItem("userName", name);
        loadAllData();
        sendNotification({
            title: "Data Disimpan",
            body: `Nama pengguna "${name}" berhasil disimpan di Local Storage.`
        });
    };

    //Simpan Tema di local storage
    const saveTheme = (newTheme: string) => {
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
        loadAllData();
        sendNotification({
            title: "Tema Diperbarui",
            body: `Tema diubah menjadi "${newTheme}".`
        });
    };

    //Simpan Preferensi di local storage
    const savePreferences = () => {
        const preferences = JSON.stringify({ fontSize: "medium", notifications: true });
        localStorage.setItem("preferences", preferences);
        loadAllData();
        sendNotification({
            title: "Preferensi Disimpan",
            body: "Preferensi pengguna berhasil disimpan di Local Storage."
        });
    };

    //Simpan Filter di session storage
    const saveFilter = () => {
        sessionStorage.setItem("filter", filter);
        sessionStorage.setItem("page", "1");
        loadAllData();
        sendNotification({
            title: "Filter Disimpan",
            body: `Filter "${filter}" disimpan di Session Storage.`
        });
    };

    //Fungsi untuk clear storage
    const clearAll = () => {
        localStorage.clear();
        sessionStorage.clear();
        setName("");
        setFilter("");
        setTheme("light");
        setSavedData(null);
        sendNotification({
            title: "Storage Dibersihkan",
            body: "Semua data di Local Storage & Session Storage telah dihapus."
        });
    };

    return (
        <MainLayout>
            <PageTransition>
                <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                    <div className="max-w-5xl mx-auto p-6 space-y-6">
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
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg"> {/* Perbaikan: typo purpel dan shadow-l */}
                            <h1 className="text-2xl font-bold">Web Storage</h1> {/* Perbaikan: 2x; menjadi 2xl */}
                            <p className="text-sm opacity-90">Local Storage vs Session Storage</p> {/* Perbaikan: Storafe menjadi Storage */}
                        </div>

                        {/* Input Section */}
                        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-4 md:p-6 rounded-lg shadow-lg`}> {/* Perbaikan: menutup div diletakkan dengan benar */}
                            <h2 className="text-xl font-bold mb-4">Contoh Penyimpanan Data</h2>

                            <div className="space-y-4">
                                {/* Simpan Nama*/}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Pengguna</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Masukkan nama..."
                                            className="flex-1 px-3 py-2 border rounded-lg text-gray-900"
                                        />
                                        <button onClick={saveName} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                            Simpan
                                        </button>
                                    </div>
                                    <p className="text-xs mt-1 opacity-70">Disimpan di Local Storage</p>
                                </div>

                                {/* Simpan Tema */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tema</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveTheme("light")}
                                            className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>Light</button>
                                        <button
                                            onClick={() => saveTheme("dark")}
                                            className={`px-4 py-2 rounded-lg ${theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-200"}`}>Dark</button>
                                    </div>
                                    <p className="text-xs mt-1 opacity-70">Simpan di Local Storage</p>
                                </div>
                                {/* Simpan Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Filter Pencarian</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)} // Perbaikan: setName menjadi setFilter
                                            placeholder="Masukkan  Filter..."
                                            className="flex-1 px-3 py-2 border rounded-lg text-gray-900"
                                        />
                                        <button onClick={saveFilter} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                            Simpan
                                        </button>
                                    </div>
                                    <p className="text-xs mt-1 opacity-70">Disimpan di Session Storage</p> {/* Perbaikan: Local menjadi Session */}
                                </div>
                                {/* Simpan All sebagai JSON*/}
                                <div>
                                    <button onClick={savePreferences} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                        Simpan Preferensi (Local Storage JSON)
                                    </button>
                                </div>

                                {/* Hapus All JSON*/}
                                <div>
                                    <button onClick={clearAll} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                        Hapus Semua Data Storage
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Display Datanya*/}
                        {savedData && (
                            <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-4 md:p-6 rounded-lg shadow-lg`}>
                                <h2 className="text-xl font-bold mb-4">Data Tersimpan</h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-bold text-green-600 mb-2">Local Storage</h3>
                                        <div className="space-y-1 text-sm font-mono bg-green-50 text-gray-900 p-3 rounded">
                                            <div>userName: {savedData.local.name || "null"}</div>
                                            <div>theme: {savedData.local.theme || "null"}</div> {/* Perbaikan: theme */}
                                            <div className="break-all">preferences: {savedData.local.preferences || "null"}</div> {/* Perbaikan: preferences */}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-orange-600 mb-2">Session Storage</h3> {/* Perbaikan: Session */}
                                        <div className="space-y-1 text-sm font-mono bg-orange-50 text-gray-900 p-3 rounded"> {/* Perbaikan: background color */}
                                            <div>searchFilter: {savedData.session.filter || "null"}</div>
                                            <div>currentPage: {savedData.session.page || "null"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PageTransition>
        </MainLayout>
    );
}