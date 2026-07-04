"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SidebarItem {
    key: string;
    label: string;
    href?: string;
    active?: boolean;
}

interface SidebarProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
    menuItems?: SidebarItem[];
}

export default function Sidebar({
    menuItems = [
        { key: "dashboard", label: "Dashboard", href: "/", active: true },
        { key: "settings", label: "Settings", href: "#" },
        { key: "profile", label: "Profile", href: "/pofile" },
        { key: "users", label: "Tabel Users", href: "/users" },
        { key: "image-process", label: "Image Process", href: "/image-process" },
        { key: "sprite", label: "Sprite Image", href: "/sprite" },
        { key: "analytics", label: "Analytic Dashboard", href: "/analytic-dashboard" },
        { key: "map", label: "Penanganan Map", href: "/penanganan-map" },
        { key: "web-storage", label: "Web-Storage", href: "/web-storage" },
        { key: "todo", label: "Todo App", href: "/indexdb" },
        { key: "todo-realtime", label: "Todo Realtime", href: "/realtime-db" },
        { key: "tugas", label: "Tugas Siswa RLS", href: "/tugas" },
    ],
    className = "",
    isOpen = false,
    onClose
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // User states
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    // Reset image error on avatar change
    useEffect(() => {
        setImageError(false);
    }, [avatarUrl]);

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

    // Fetch user details
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const currentUser = session.user;
                setEmail(currentUser.email || "");
                setFullName(currentUser.user_metadata?.full_name || currentUser.user_metadata?.display_name || currentUser.user_metadata?.name || "User");
                
                const storageAvatar = await getStorageAvatar(currentUser.id);
                setAvatarUrl(storageAvatar || currentUser.user_metadata?.avatar_url || null);
            }
        };

        fetchUserData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const currentUser = session.user;
                setEmail(currentUser.email || "");
                setFullName(currentUser.user_metadata?.full_name || currentUser.user_metadata?.display_name || currentUser.user_metadata?.name || "User");
                
                getStorageAvatar(currentUser.id).then((storageAvatar) => {
                    setAvatarUrl(storageAvatar || currentUser.user_metadata?.avatar_url || null);
                });
            } else {
                setEmail("");
                setFullName("");
                setAvatarUrl(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Get initials for profile picture fallback
    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return "";
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.push("/login");
        } else {
            alert("Gagal logout: " + error.message);
        }
    };

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-[9999] bg-white border-r w-64 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:sticky md:top-16 md:h-[calc(100vh-64px)] md:translate-x-0
                ${className}
            `}
        >
            {/* Header Sidebar (Tombol Close) */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Navigation</span>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                    title="Tutup Sidebar"
                >
                    <X size={18} />
                </button>
            </div>

            {/* User Profile Card Section inside Sidebar */}
            {fullName && (
                <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex items-center gap-3">
                    {/* Circle Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 border border-blue-200 flex-shrink-0 flex items-center justify-center">
                        {avatarUrl && avatarUrl !== "null" && avatarUrl !== "" && !imageError ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <span className="text-sm font-bold text-blue-600 uppercase select-none">
                                {getInitials(fullName)}
                            </span>
                        )}
                    </div>
                    {/* User Info */}
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-800 truncate" title={fullName}>
                            {fullName}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate" title={email}>
                            {email}
                        </p>
                    </div>
                </div>
            )}

            {/* List Menu */}
            <ul className="space-y-1 text-gray-700 p-3 overflow-y-auto flex-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || item.active;

                    return (
                        <li key={item.key}>
                            <Link
                                href={item.href || "#"}
                                onClick={() => {
                                    // Tutup sidebar otomatis di mobile saat menu dipilih
                                    if (window.innerWidth < 768 && onClose) onClose();
                                }}
                                className={`block px-3 py-2 rounded-lg transition-all duration-150 font-semibold text-sm ${isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* Logout Button */}
            <div className="p-3 border-t border-gray-100 mt-auto bg-white">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 rounded-lg font-bold text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                >
                    <LogOut size={16} className="mr-2" />
                    Logout
                </button>
            </div>
        </aside>
    );
}