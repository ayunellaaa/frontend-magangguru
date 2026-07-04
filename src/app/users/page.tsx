"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";
import { supabase } from "@/lib/supabase";
import SiswaForm from "@/components/siswa/SiswaForm";
import type { Siswa, Kelas, SiswaInput } from "@/components/siswa/SiswaForm";
import SiswaTable from "@/components/siswa/SiswaTable";
import BatchOperation from "@/components/siswa/BatchOperation";

const ITEMS_PER_PAGE = 10;

function UsersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // States
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [classes, setClasses] = useState<Kelas[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debounceQuery, setDebounceQuery] = useState("");

    // Pagination
    const page = Number(searchParams.get("page") || 1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceQuery(searchQuery);
            if (searchQuery !== (searchParams.get("search") || "")) {
                router.push(`/users?page=1`);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, router, searchParams]);

    // Fetch classes list for form/table dropdowns
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data, error } = await supabase
                    .from("kelas")
                    .select("id, kelas")
                    .order("kelas", { ascending: true });

                if (error) throw error;
                if (data) {
                    setClasses(data);
                }
            } catch (err) {
                console.error("Gagal memuat kelas:", err);
            }
        };

        fetchClasses();
    }, []);

    // Fetch student data with join to resolve class names
    const fetchSiswa = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from("siswa_backend")
                .select("*, kelas:kelas_id(kelas)", { count: "exact" });

            if (debounceQuery) {
                query = query.or(`nama.ilike.%${debounceQuery}%,nis.ilike.%${debounceQuery}%`);
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, count, error } = await query
                .range(from, to)
                .order("nis", { ascending: true });

            if (error) {
                if (error.code === "PGRST103" && page > 1) {
                    router.push(`/users?page=1`);
                    return;
                }
                throw error;
            }

            if (data) {
                const formattedData: Siswa[] = data.map((item: any) => {
                    let resolvedKelas = "";
                    if (item.kelas) {
                        resolvedKelas = Array.isArray(item.kelas)
                            ? item.kelas[0]?.kelas
                            : item.kelas?.kelas || "";
                    }
                    return {
                        id: item.id,
                        nis: item.nis,
                        nama: item.nama,
                        jenis_kelamin: item.jenis_kelamin,
                        tanggal_lahir: item.tanggal_lahir,
                        kelas_id: item.kelas_id,
                        kelas: resolvedKelas,
                    };
                });
                setSiswaList(formattedData);

                if (count !== null) {
                    setTotalPages(Math.ceil(count / ITEMS_PER_PAGE) || 1);
                }
            }
        } catch (err: any) {
            console.error("Gagal memuat data siswa:", err?.message || err);
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger fetch on page/query changes
    useEffect(() => {
        fetchSiswa();
    }, [page, debounceQuery]);

    // Handle Form Submit (Insert Only with generated UUID)
    const handleInsert = async (data: SiswaInput) => {
        const generatedId = crypto.randomUUID();
        const { error } = await supabase
            .from("siswa_backend")
            .insert([
                {
                    id: generatedId,
                    nis: data.nis,
                    nama: data.nama,
                    jenis_kelamin: data.jenis_kelamin,
                    tanggal_lahir: data.tanggal_lahir,
                    kelas_id: data.kelas_id,
                },
            ]);

        if (error) throw error;

        // Refresh list
        fetchSiswa();
    };

    // Handle Inline Update
    const handleUpdate = async (id: string, data: SiswaInput) => {
        const { error } = await supabase
            .from("siswa_backend")
            .update({
                nis: data.nis,
                nama: data.nama,
                jenis_kelamin: data.jenis_kelamin,
                tanggal_lahir: data.tanggal_lahir,
                kelas_id: data.kelas_id,
            })
            .eq("id", id);

        if (error) {
            alert("Gagal mengupdate data: " + error.message);
            throw error;
        }

        // Refresh list
        fetchSiswa();
    };

    // Handle Batch Save (Insert or Update if NIS already exists)
    const handleBatchSave = async (batchData: SiswaInput[], mode: "add" | "update") => {
        // Extract all NIS values
        const nisValues = batchData.map((item) => item.nis);

        // Fetch existing records with matching NIS
        const { data: existingSiswa, error: fetchError } = await supabase
            .from("siswa_backend")
            .select("id, nis")
            .in("nis", nisValues);

        if (fetchError) throw fetchError;

        // If 'add' mode, block if any NIS already exists
        if (mode === "add" && existingSiswa && existingSiswa.length > 0) {
            const registeredNis = existingSiswa.map((s) => s.nis).join(", ");
            throw new Error(`Gagal: NIS berikut sudah terdaftar di database: ${registeredNis}`);
        }

        // Create a mapping of NIS -> existing UUID ID
        const existingNisMap: Record<string, string> = {};
        if (existingSiswa) {
            existingSiswa.forEach((item) => {
                existingNisMap[item.nis] = item.id;
            });
        }

        // Build the payload
        const payload = batchData.map((item) => {
            const existingId = existingNisMap[item.nis];
            return {
                id: existingId || crypto.randomUUID(), // Update if ID exists, insert if new UUID
                nis: item.nis,
                nama: item.nama,
                jenis_kelamin: item.jenis_kelamin,
                tanggal_lahir: item.tanggal_lahir,
                kelas_id: item.kelas_id,
            };
        });

        // Call upsert in Supabase
        const { error: upsertError } = await supabase
            .from("siswa_backend")
            .upsert(payload);

        if (upsertError) throw upsertError;

        // Refresh student table list
        fetchSiswa();
    };

    // Handle Delete
    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from("siswa_backend")
            .delete()
            .eq("id", id);

        if (error) {
            alert("Gagal menghapus data: " + error.message);
            throw error;
        }

        // Refresh list
        fetchSiswa();
    };

    const handlePageChange = (newPage: number) => {
        router.push(`/users?page=${newPage}`);
    };

    return (
        <MainLayout>
            <PageTransition>
                <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Responsive Two Column Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form Column (Insert Only) */}
                            <div className="lg:col-span-1">
                                <SiswaForm
                                    classes={classes}
                                    onSubmit={handleInsert}
                                />
                            </div>

                            {/* Table Column (with Inline Edit) */}
                            <div className="lg:col-span-2">
                                <SiswaTable
                                    siswaList={siswaList}
                                    classes={classes}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    isLoading={isLoading}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>

                        {/* Batch Operations Section */}
                        <div className="pt-4">
                            <BatchOperation
                                classes={classes}
                                onSaveBatch={handleBatchSave}
                            />
                        </div>

                    </div>
                </div>
            </PageTransition>
        </MainLayout>
    );
}

export default function UsersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        }>
            <UsersContent />
        </Suspense>
    );
}
