"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";
import { FileText, Plus, Trash2, Calendar, User, Info } from "lucide-react";

interface Tugas {
    id: string;
    judul: string;
    deskripsi: string;
    created_at: string;
    user_id: string;
}

function TugasContent() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tugasList, setTugasList] = useState<Tugas[]>([]);

    // Form states
    const [judul, setJudul] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Auth & Session Check
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setUserId(session.user.id);
                setIsLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/login");
            } else {
                setUserId(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // Fetch tasks list
    const fetchTugas = async () => {
        if (!userId) return;
        setFetchError(null);
        try {
            const { data, error } = await supabase
                .from("tugas_siswa")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) {
                setTugasList(data);
            }
        } catch (err: any) {
            console.error("Gagal memuat tugas:", err);
            setFetchError(err.message || "Gagal mengambil data tugas.");
        }
    };

    // Load tasks on userId change
    useEffect(() => {
        if (userId) {
            fetchTugas();
        }
    }, [userId]);

    // Handle Form Submit (Upload Task)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!judul.trim() || !deskripsi.trim()) {
            setFormError("Semua field harus diisi!");
            return;
        }

        if (!userId) {
            setFormError("Sesi Anda tidak valid. Silakan login kembali.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("tugas_siswa")
                .insert([
                    {
                        user_id: userId,
                        judul: judul.trim(),
                        deskripsi: deskripsi.trim(),
                    }
                ]);

            if (error) throw error;

            // Reset form
            setJudul("");
            setDeskripsi("");

            // Refresh tasks list
            fetchTugas();
            alert("Tugas berhasil dikirim!");
        } catch (err: any) {
            console.error("Gagal menyimpan tugas:", err);
            setFormError(err.message || "Gagal menyimpan tugas.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Task
    const handleDelete = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
            try {
                const { error } = await supabase
                    .from("tugas_siswa")
                    .delete()
                    .eq("id", id);

                if (error) throw error;

                // Refresh list
                fetchTugas();
            } catch (err: any) {
                console.error("Gagal menghapus tugas:", err);
                alert("Gagal menghapus tugas: " + err.message);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Task Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText size={20} className="text-blue-200" />
                                    Upload Tugas Baru
                                </h2>
                                <p className="text-blue-100 text-xs mt-1">Masukkan rincian tugas Anda di bawah ini</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {formError && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                        {formError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul Tugas
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Tugas Fisika Bab 3"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={judul}
                                        onChange={(e) => setJudul(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi Tugas
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Tuliskan keterangan detail atau link tugas Anda disini..."
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        value={deskripsi}
                                        onChange={(e) => setDeskripsi(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                                    >
                                        <Plus size={16} />
                                        {isSubmitting ? "Mengirim..." : "Kirim Tugas"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Task List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Tugas Saya</h2>
                                    <p className="text-slate-300 text-xs mt-1">Daftar tugas yang telah Anda kumpulkan</p>
                                </div>
                            </div>

                            <div className="p-6">
                                {fetchError && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg mb-4">
                                        {fetchError}
                                    </div>
                                )}

                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                                    {tugasList.map((tugas) => (
                                        <div key={tugas.id} className="p-4 border border-gray-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition relative group">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-base">{tugas.judul}</h3>
                                                    <p className="text-gray-600 text-sm mt-1.5 whitespace-pre-wrap">{tugas.deskripsi}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(tugas.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title="Hapus Tugas"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(tugas.created_at).toLocaleString("id-ID", {
                                                        dateStyle: "medium",
                                                        timeStyle: "short"
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {tugasList.length === 0 && !fetchError && (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                                            <Info size={36} className="text-slate-400 mx-auto mb-2" />
                                            <p className="text-slate-500 font-medium">Belum ada tugas yang dikumpulkan.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function TugasPage() {
    return (
        <MainLayout>
            <PageTransition>
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-gray-100">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                }>
                    <TugasContent />
                </Suspense>
            </PageTransition>
        </MainLayout>
    );
}
