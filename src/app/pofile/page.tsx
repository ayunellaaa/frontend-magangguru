"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";
import { User, Shield, Key, Camera, Trash2, Loader2, CheckCircle, Info } from "lucide-react";

function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [userId, setUserId] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [avatarUrl]);

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return "";
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Get avatar directly from Storage bucket to bypass OAuth metadata resets
    const getStorageAvatar = async (uid: string) => {
        try {
            const { data: files, error } = await supabase.storage.from("avatar").list(uid);
            if (error) throw error;
            if (files && files.length > 0) {
                const avatarFile = files.find(f => f.name.startsWith("avatar"));
                if (avatarFile) {
                    const { data: { publicUrl } } = supabase.storage.from("avatar").getPublicUrl(`${uid}/${avatarFile.name}`);
                    return `${publicUrl}?t=${new Date(avatarFile.updated_at || "").getTime()}`;
                }
            }
        } catch (err) {
            console.warn("Gagal mengambil avatar dari storage:", err);
        }
        return null;
    };

    // Fetch user details and session
    const loadSession = async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/login");
        } else {
            const currentUser = session.user;
            setUser(currentUser);
            setUserId(currentUser.id);
            setEmail(currentUser.email || "");
            setFullName(currentUser.user_metadata?.full_name || currentUser.user_metadata?.display_name || currentUser.user_metadata?.name || "User");
            
            const storageAvatar = await getStorageAvatar(currentUser.id);
            setAvatarUrl(storageAvatar || currentUser.user_metadata?.avatar_url || null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/login");
            } else {
                const currentUser = session.user;
                setUser(currentUser);
                setUserId(currentUser.id);
                setEmail(currentUser.email || "");
                setFullName(currentUser.user_metadata?.full_name || currentUser.user_metadata?.display_name || currentUser.user_metadata?.name || "User");
                
                getStorageAvatar(currentUser.id).then((storageAvatar) => {
                    setAvatarUrl(storageAvatar || currentUser.user_metadata?.avatar_url || null);
                });
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // Handle Upload Avatar Photo
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setSuccess(null);
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Check if file is image
        if (!file.type.startsWith("image/")) {
            setError("Berkas harus berupa gambar!");
            return;
        }

        // Limit file size to 2MB
        if (file.size > 2 * 1024 * 1024) {
            setError("Ukuran gambar maksimal 2MB!");
            return;
        }

        setIsUploading(true);
        try {
            // Upload / Upsert file in Supabase storage
            const fileExt = file.name.split(".").pop();
            // Use unique timestamp to prevent client caching issues
            const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

            // If user already had an avatar, let's try to delete the old one first to save storage Space
            if (avatarUrl) {
                try {
                    // Extract relative path from old url
                    const oldPathParts = avatarUrl.split("/public/avatar/");
                    if (oldPathParts.length > 1) {
                        const oldPath = oldPathParts[1].split("?")[0]; // remove query params
                        await supabase.storage.from("avatar").remove([decodeURIComponent(oldPath)]);
                    }
                } catch (delOldErr) {
                    console.warn("Failed to remove old avatar file:", delOldErr);
                }
            }

            const { error: uploadError } = await supabase.storage
                .from("avatar")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatar")
                .getPublicUrl(filePath);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            setSuccess("Foto profil berhasil diperbarui!");
        } catch (err: any) {
            console.error("Gagal mengunggah foto profil:", err);
            setError(err.message || "Gagal mengunggah foto profil.");
        } finally {
            setIsUploading(false);
            // Reset input file
            e.target.value = "";
        }
    };

    // Handle Delete Avatar Photo
    const handleAvatarDelete = async () => {
        setError(null);
        setSuccess(null);

        if (!avatarUrl) return;

        if (confirm("Apakah Anda yakin ingin menghapus foto profil Anda?")) {
            setIsDeleting(true);
            try {
                // List and delete all files in the user's storage folder
                const { data: files, error: listError } = await supabase.storage.from("avatar").list(userId);
                if (listError) throw listError;

                if (files && files.length > 0) {
                    const filesToRemove = files.map(f => `${userId}/${f.name}`);
                    const { error: removeError } = await supabase.storage
                        .from("avatar")
                        .remove(filesToRemove);

                    if (removeError) throw removeError;
                }

                // Reset user metadata
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: null }
                });

                if (updateError) throw updateError;

                setAvatarUrl(null);
                setSuccess("Foto profil berhasil dihapus!");
            } catch (err: any) {
                console.error("Gagal menghapus foto profil:", err);
                setError(err.message || "Gagal menghapus foto profil.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Profil Pengguna
                    </h1>
                </div>

                {/* Profile Detail Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-10 flex flex-col items-center text-center relative">
                        
                        {/* Avatar Image Circle Container */}
                        <div className="relative group w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center mb-4 transition-all">
                            {avatarUrl && avatarUrl !== "null" && avatarUrl !== "" && !imageError ? (
                                <img
                                    src={avatarUrl}
                                    alt="Foto Profil"
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <span className="text-4xl font-bold text-slate-500 uppercase select-none">
                                    {getInitials(fullName)}
                                </span>
                            )}

                            {/* Loading Overlay */}
                            {(isUploading || isDeleting) && (
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                                </div>
                            )}

                            {/* Camera Icon Overlay on Hover */}
                            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer select-none">
                                <Camera size={24} />
                                <span className="text-[10px] font-semibold mt-1">Ganti Foto</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploading || isDeleting}
                                />
                            </label>
                        </div>

                        <h2 className="text-2xl font-bold text-white">{fullName}</h2>
                        <p className="text-blue-100 text-sm mt-1">{email}</p>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        
                        {/* Alerts */}
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Action buttons below the photo */}
                        <div className="flex flex-wrap justify-center gap-3 border-b border-gray-100 pb-6">
                            <label className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-sm rounded-lg transition-all cursor-pointer select-none disabled:opacity-50">
                                <Camera size={16} />
                                Unggah Foto Baru
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploading || isDeleting}
                                />
                            </label>
                            
                            {avatarUrl && (
                                <button
                                    type="button"
                                    onClick={handleAvatarDelete}
                                    disabled={isUploading || isDeleting}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 font-semibold text-sm rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                    Hapus Foto Profil
                                </button>
                            )}
                        </div>

                        {/* User Details Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <Shield size={12} className="text-slate-400" />
                                    ID Pengguna (UID)
                                </span>
                                <p className="font-mono text-sm text-slate-700 break-all select-all font-semibold">
                                    {userId}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <Key size={12} className="text-slate-400" />
                                    Peran Keamanan (Role)
                                </span>
                                <p className="font-semibold text-sm text-slate-700">
                                    Siswa / User Authenticated
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50/60 border border-amber-200/50 rounded-xl flex gap-3 text-amber-800 text-xs font-medium">
                            <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-900 mb-0.5">Informasi Penyimpanan Foto</h4>
                                <p className="text-amber-800/80 leading-relaxed">
                                    Foto profil Anda disimpan secara aman di bucket penyimpanan <strong>avatar</strong> Supabase Anda. Kebijakan keamanan Row Level Security (RLS) menjamin foto Anda hanya dapat diakses oleh pengguna yang sudah login ke aplikasi.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

// Wrap in layout and transitions
export function WrappedProfilePage() {
    return (
        <MainLayout>
            <PageTransition>
                <ProfilePage />
            </PageTransition>
        </MainLayout>
    );
}

// Default export
import { Suspense } from "react";
export default function SafeProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <WrappedProfilePage />
        </Suspense>
    );
}
