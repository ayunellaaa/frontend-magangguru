"use client";

import { useEffect, useState } from "react";

export type Kelas = {
    id: number;
    kelas: string;
};

export type SiswaInput = {
    nis: string;
    nama: string;
    jenis_kelamin: "L" | "P";
    tanggal_lahir: string;
    kelas_id: number;
};

export type Siswa = {
    id: string;
    nis: string;
    nama: string;
    jenis_kelamin: "L" | "P";
    tanggal_lahir: string;
    kelas_id: number;
    kelas?: string; // Resolved from join
};

interface SiswaFormProps {
    classes: Kelas[];
    onSubmit: (data: SiswaInput) => Promise<void>;
}

export default function SiswaForm({ classes, onSubmit }: SiswaFormProps) {
    const [nis, setNis] = useState("");
    const [nama, setNama] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">("L");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [kelasId, setKelasId] = useState<number | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setNis("");
        setNama("");
        setJenisKelamin("L");
        setTanggalLahir("");
        setKelasId(classes.length > 0 ? classes[0].id : "");
        setError(null);
    };

    // Auto-select first class if not set and classes are loaded
    useEffect(() => {
        if (classes.length > 0 && kelasId === "") {
            setKelasId(classes[0].id);
        }
    }, [classes, kelasId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nis || !nama || !jenisKelamin || !tanggalLahir || kelasId === "") {
            setError("Semua field harus diisi!");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                nis,
                nama,
                jenis_kelamin: jenisKelamin,
                tanggal_lahir: tanggalLahir,
                kelas_id: Number(kelasId),
            });
            resetForm();
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Tambah Data Siswa</h2>
                <p className="text-blue-100 text-xs mt-1">Masukkan informasi siswa secara lengkap</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIS (Nomor Induk Siswa)
                    </label>
                    <input
                        type="text"
                        placeholder="Contoh: 1001"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        placeholder="Contoh: Ahmad Fauzi"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin
                    </label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input
                                type="radio"
                                name="jenis_kelamin"
                                value="L"
                                checked={jenisKelamin === "L"}
                                onChange={() => setJenisKelamin("L")}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                            />
                            Laki-laki
                        </label>
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input
                                type="radio"
                                name="jenis_kelamin"
                                value="P"
                                checked={jenisKelamin === "P"}
                                onChange={() => setJenisKelamin("P")}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                            />
                            Perempuan
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Lahir
                    </label>
                    <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kelas
                    </label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={kelasId}
                        onChange={(e) => setKelasId(Number(e.target.value))}
                        required
                    >
                        {classes.length === 0 ? (
                            <option value="" disabled>Memuat kelas...</option>
                        ) : (
                            classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.kelas}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                    </button>
                </div>
            </form>
        </div>
    );
}
