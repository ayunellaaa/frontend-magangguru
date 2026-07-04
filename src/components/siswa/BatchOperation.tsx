"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Sparkles, RefreshCw } from "lucide-react";
import type { Kelas, SiswaInput } from "./SiswaForm";

interface BatchOperationProps {
    classes: Kelas[];
    onSaveBatch: (data: SiswaInput[], mode: "add" | "update") => Promise<void>;
}

interface BatchRow {
    tempId: string;
    nis: string;
    nama: string;
    jenis_kelamin: "L" | "P";
    tanggal_lahir: string;
    kelas_id: number;
}

export default function BatchOperation({ classes, onSaveBatch }: BatchOperationProps) {
    const [rows, setRows] = useState<BatchRow[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMode, setSaveMode] = useState<"add" | "update" | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize with one empty row when classes are loaded
    useEffect(() => {
        if (rows.length === 0 && classes.length > 0) {
            addEmptyRow();
        }
    }, [classes]);

    const addEmptyRow = () => {
        const defaultClassId = classes.length > 0 ? classes[0].id : 1;
        const newRow: BatchRow = {
            tempId: crypto.randomUUID(),
            nis: "",
            nama: "",
            jenis_kelamin: "L",
            tanggal_lahir: "",
            kelas_id: defaultClassId,
        };
        setRows([...rows, newRow]);
    };

    const removeRow = (tempId: string) => {
        setRows(rows.filter((row) => row.tempId !== tempId));
    };

    const updateRowField = (tempId: string, field: keyof BatchRow, value: any) => {
        setRows(
            rows.map((row) => {
                if (row.tempId === tempId) {
                    return { ...row, [field]: value };
                }
                return row;
            })
        );
    };

    const handleSave = async (mode: "add" | "update") => {
        setError(null);

        // Check if there are rows
        if (rows.length === 0) {
            setError("Tambahkan minimal 1 data siswa!");
            return;
        }

        // Validate fields
        const invalidRow = rows.some(
            (row) => !row.nis.trim() || !row.nama.trim() || !row.tanggal_lahir
        );

        if (invalidRow) {
            setError("Semua field (NIS, Nama, Tanggal Lahir) pada seluruh baris harus diisi!");
            return;
        }

        // Check for duplicate NIS within the batch input itself
        const nisValues = rows.map((r) => r.nis.trim());
        const hasDuplicateNis = nisValues.some((nis, idx) => nisValues.indexOf(nis) !== idx);
        if (hasDuplicateNis) {
            setError("Terdapat duplikasi NIS di dalam daftar input batch Anda!");
            return;
        }

        setIsSaving(true);
        setSaveMode(mode);
        try {
            const payload: SiswaInput[] = rows.map((row) => ({
                nis: row.nis.trim(),
                nama: row.nama.trim(),
                jenis_kelamin: row.jenis_kelamin,
                tanggal_lahir: row.tanggal_lahir,
                kelas_id: Number(row.kelas_id),
            }));

            await onSaveBatch(payload, mode);

            const defaultClassId = classes.length > 0 ? classes[0].id : 1;
            setRows([
                {
                    tempId: crypto.randomUUID(),
                    nis: "",
                    nama: "",
                    jenis_kelamin: "L",
                    tanggal_lahir: "",
                    kelas_id: defaultClassId,
                },
            ]);
            alert(mode === "add" ? "Batch data siswa berhasil ditambahkan!" : "Batch data siswa berhasil diupdate / ditambahkan!");
        } catch (err: any) {
            setError(err.message || "Gagal menyimpan batch data.");
        } finally {
            setIsSaving(false);
            setSaveMode(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles size={20} className="text-teal-200" />
                        Batch Operation (Massal Insert / Update)
                    </h2>
                    <p className="text-teal-100 text-xs mt-1">
                        Masukkan data siswa secara massal. Gunakan tombol "Add" untuk tambah baru, atau "Update" untuk update+insert data.
                    </p>
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form Table */}
                <div className="overflow-x-auto border border-gray-100 rounded-xl w-full">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[850px]">
                        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase border-b border-gray-200">
                            <tr>
                                <th className="p-3 w-[15%]">NIS</th>
                                <th className="p-3 w-[30%]">Nama Lengkap</th>
                                <th className="p-3 w-[15%]">Jenis Kelamin</th>
                                <th className="p-3 w-[18%]">Tanggal Lahir</th>
                                <th className="p-3 w-[17%]">Kelas</th>
                                <th className="p-3 w-[5%] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {rows.map((row) => (
                                <tr key={row.tempId} className="hover:bg-slate-50/30 transition">
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            placeholder="Contoh: 1001"
                                            className="w-full min-w-[90px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                            value={row.nis}
                                            onChange={(e) => updateRowField(row.tempId, "nis", e.target.value)}
                                            required
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            placeholder="Nama Lengkap"
                                            className="w-full min-w-[180px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                                            value={row.nama}
                                            onChange={(e) => updateRowField(row.tempId, "nama", e.target.value)}
                                            required
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            className="w-full min-w-[120px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                            value={row.jenis_kelamin}
                                            onChange={(e) => updateRowField(row.tempId, "jenis_kelamin", e.target.value as "L" | "P")}
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="date"
                                            className="w-full min-w-[140px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                            value={row.tanggal_lahir}
                                            onChange={(e) => updateRowField(row.tempId, "tanggal_lahir", e.target.value)}
                                            required
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            className="w-full min-w-[130px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                            value={row.kelas_id}
                                            onChange={(e) => updateRowField(row.tempId, "kelas_id", Number(e.target.value))}
                                            required
                                        >
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.kelas}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(row.tempId)}
                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                            title="Hapus Baris"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                    <button
                        type="button"
                        onClick={addEmptyRow}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg font-medium text-sm transition-all w-full sm:w-auto"
                    >
                        <Plus size={16} />
                        Tambah Baris
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {/* Button 1: Add (Insert Only) */}
                        <button
                            type="button"
                            onClick={() => handleSave("add")}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow hover:shadow-md transition-all disabled:opacity-50 w-full sm:w-auto"
                        >
                            <Plus size={16} />
                            {isSaving && saveMode === "add" ? "Menambahkan..." : "Add"}
                        </button>

                        {/* Button 2: Update (Upsert) */}
                        <button
                            type="button"
                            onClick={() => handleSave("update")}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm shadow hover:shadow-md transition-all disabled:opacity-50 w-full sm:w-auto"
                        >
                            <RefreshCw size={16} className={isSaving && saveMode === "update" ? "animate-spin" : ""} />
                            {isSaving && saveMode === "update" ? "Mengupdate..." : "Update"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
