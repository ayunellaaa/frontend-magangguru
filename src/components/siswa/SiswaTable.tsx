"use client";

import { useState } from "react";
import { X, Edit2, Trash2, QrCode, Save, XCircle } from "lucide-react";
import type { Siswa, Kelas, SiswaInput } from "./SiswaForm";

interface SiswaTableProps {
    siswaList: Siswa[];
    classes: Kelas[];
    onUpdate: (id: string, data: SiswaInput) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export default function SiswaTable({
    siswaList,
    classes,
    onUpdate,
    onDelete,
    isLoading,
    searchQuery,
    onSearchChange,
    page,
    totalPages,
    onPageChange
}: SiswaTableProps) {
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Inline edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNis, setEditNis] = useState("");
    const [editNama, setEditNama] = useState("");
    const [editJenisKelamin, setEditJenisKelamin] = useState<"L" | "P">("L");
    const [editTanggalLahir, setEditTanggalLahir] = useState("");
    const [editKelasId, setEditKelasId] = useState<number>(1);
    const [isSaving, setIsSaving] = useState(false);

    const getQRCodeUrl = (siswa: Siswa | null) => {
        if (!siswa) return "";
        const jkLabel = siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan";
        const textInfo = `DETAIL DATA SISWA\n-----------------\nNIS: ${siswa.nis}\nNama: ${siswa.nama}\nJenis Kelamin: ${jkLabel}\nTanggal Lahir: ${siswa.tanggal_lahir}\nKelas: ${siswa.kelas || "N/A"}`;
        const encodedData = encodeURIComponent(textInfo);
        return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodedData}`;
    };

    const startEditing = (siswa: Siswa) => {
        setEditingId(siswa.id);
        setEditNis(siswa.nis);
        setEditNama(siswa.nama);
        setEditJenisKelamin(siswa.jenis_kelamin);
        setEditTanggalLahir(siswa.tanggal_lahir || "");
        setEditKelasId(siswa.kelas_id);
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEdit = async (id: string) => {
        if (!editNis || !editNama || !editTanggalLahir) {
            alert("Field tidak boleh kosong!");
            return;
        }

        setIsSaving(true);
        try {
            await onUpdate(id, {
                nis: editNis,
                nama: editNama,
                jenis_kelamin: editJenisKelamin,
                tanggal_lahir: editTanggalLahir,
                kelas_id: editKelasId
            });
            setEditingId(null);
        } catch (error) {
            console.error("Gagal update data:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
            setDeletingId(id);
            try {
                await onDelete(id);
            } catch (error) {
                console.error("Failed to delete", error);
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden w-full">
            {/* Header Table */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Daftar Siswa</h2>
                    <p className="text-slate-300 text-xs mt-1">Data siswa aktif dari database backend</p>
                </div>
                <div className="w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Cari siswa..."
                        className="w-full border border-slate-600 bg-slate-900/50 text-white rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="relative min-h-[300px] overflow-x-auto w-full">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 transition-all">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                            <span className="text-blue-600 font-semibold text-sm">Memuat data...</span>
                        </div>
                    </div>
                )}

                <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                    <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-gray-200">
                        <tr>
                            <th className="p-4 w-[12%]">NIS</th>
                            <th className="p-4 w-[25%]">Nama</th>
                            <th className="p-4 w-[18%]">Jenis Kelamin</th>
                            <th className="p-4 w-[15%]">Tanggal Lahir</th>
                            <th className="p-4 w-[15%]">Kelas</th>
                            <th className="p-4 w-[5%] text-center">QR Code</th>
                            <th className="p-4 w-[10%] text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {siswaList.map((siswa) => {
                            const isEditing = editingId === siswa.id;

                            if (isEditing) {
                                return (
                                    <tr key={siswa.id} className="bg-blue-50/50 transition border-l-4 border-blue-500">
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                className="w-full min-w-[80px] border border-gray-300 rounded px-2 py-1 font-mono text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                value={editNis}
                                                onChange={(e) => setEditNis(e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                className="w-full min-w-[150px] border border-gray-300 rounded px-2 py-1 text-sm font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                value={editNama}
                                                onChange={(e) => setEditNama(e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <select
                                                className="w-full min-w-[110px] border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                value={editJenisKelamin}
                                                onChange={(e) => setEditJenisKelamin(e.target.value as "L" | "P")}
                                            >
                                                <option value="L">Laki-laki</option>
                                                <option value="P">Perempuan</option>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="date"
                                                className="w-full min-w-[130px] border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                value={editTanggalLahir}
                                                onChange={(e) => setEditTanggalLahir(e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <select
                                                className="w-full min-w-[110px] border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                value={editKelasId}
                                                onChange={(e) => setEditKelasId(Number(e.target.value))}
                                            >
                                                {classes.map((cls) => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.kelas}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2 text-center text-gray-400">
                                            —
                                        </td>
                                        <td className="p-2">
                                            <div className="flex justify-center gap-1.5 min-w-[130px]">
                                                <button
                                                    onClick={() => saveEdit(siswa.id)}
                                                    disabled={isSaving}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition disabled:opacity-50"
                                                >
                                                    <Save size={12} />
                                                    Simpan
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-semibold transition"
                                                >
                                                    <XCircle size={12} />
                                                    Batal
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={siswa.id} className="hover:bg-slate-50/50 transition">
                                    <td className="p-4 font-mono font-medium text-gray-900">{siswa.nis}</td>
                                    <td className="p-4 font-semibold text-gray-900">{siswa.nama}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            siswa.jenis_kelamin === "L" 
                                                ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                                : "bg-pink-50 text-pink-700 border border-pink-100"
                                        }`}>
                                            {siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-gray-700">{siswa.tanggal_lahir}</td>
                                    <td className="p-4 font-medium text-gray-700">{siswa.kelas || "-"}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => setSelectedSiswa(siswa)}
                                            className="inline-flex items-center justify-center p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 hover:text-blue-600 transition-all hover:scale-105"
                                            title="Tampilkan QR Code"
                                        >
                                            <QrCode size={20} />
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2 min-w-[140px]">
                                            <button
                                                onClick={() => startEditing(siswa)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-lg border border-amber-200 text-xs font-semibold transition"
                                            >
                                                <Edit2 size={13} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(siswa.id)}
                                                disabled={deletingId === siswa.id}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg border border-red-200 text-xs font-semibold transition disabled:opacity-50"
                                            >
                                                <Trash2 size={13} />
                                                {deletingId === siswa.id ? "Hapus..." : "Hapus"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {siswaList.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400">
                                    Tidak ada data siswa ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-4 py-4 sm:px-6 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Halaman <b>{page}</b> dari <b>{totalPages}</b>
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="px-3.5 py-1.5 border rounded-lg bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="px-3.5 py-1.5 border rounded-lg bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Detail & QR Code */}
            {selectedSiswa && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all"
                    onClick={() => setSelectedSiswa(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedSiswa(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Detail Kartu Siswa</h3>
                            <p className="text-xs text-slate-400 mt-1 font-mono">{selectedSiswa.nis}</p>
                        </div>

                        <div className="flex justify-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <img
                                src={getQRCodeUrl(selectedSiswa)}
                                className="w-52 h-52 rounded-lg shadow-sm"
                                alt="QR Code Siswa"
                            />
                        </div>

                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 text-sm">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-400 font-medium">Nama Lengkap</span>
                                <span className="font-semibold text-slate-800 text-right">{selectedSiswa.nama}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-400 font-medium">Jenis Kelamin</span>
                                <span className="font-semibold text-slate-800">
                                    {selectedSiswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-slate-400 font-medium">Tanggal Lahir</span>
                                <span className="font-semibold text-slate-800 font-mono">{selectedSiswa.tanggal_lahir}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Kelas</span>
                                <span className="font-semibold text-slate-800">{selectedSiswa.kelas || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
