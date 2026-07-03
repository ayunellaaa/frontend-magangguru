"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, LogOut } from "lucide-react";
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
        { key: "profile", label: "Profile", href: "#" },
        { key: "users", label: "Tabel Users", href: "/users" },
        { key: "image-process", label: "Image Process", href: "/image-process" },
        { key: "sprite", label: "Sprite Image", href: "/sprite" },
        { key: "analytics", label: "Analytic Dashboard", href: "/analytic-dashboard" },
        { key: "map", label: "Penanganan Map", href: "/penanganan-map" },
        { key: "web-storage", label: "Web-Storage", href: "/web-storage" },
        { key: "todo", label: "Todo App", href: "/indexdb" },
        { key: "todo-realtime", label: "Todo Realtime", href: "/realtime-db" },
    ],
    className = "",
    isOpen = false,
    onClose
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

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
                fixed inset-y-0 left-0 z-40 bg-white border-r w-64 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:sticky md:top-16 md:h-[calc(100vh-64px)] md:translate-x-0
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                ${className}
            `}
        >
            {/* Header Sidebar (Tombol Close hanya muncul di mobile) */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 md:hidden">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">My App</span>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* List Menu */}
            <ul className="space-y-2 text-gray-700 p-4 overflow-y-auto flex-1">
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
                                className={`block px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "hover:bg-gray-200 hover:text-gray-900"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100 mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                    <LogOut size={18} className="mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
}