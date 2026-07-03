"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface MenuItem {
    key: string;
    label: string;
    href?: string;
}

interface HeaderProps {
    brandName?: string;
    menuItems?: MenuItem[];
    onBrandClick?: () => void;
}

export default function Header({
    brandName = 'MyApp',
    menuItems = [
        { key: "home", label: "Home", href: "/" },
        { key: "about", label: "About", href: "/" },
        { key: "contact", label: "Contact", href: "/" }
    ],
    onBrandClick
}: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <header className="bg-blue-600 shadow-lg sticky top-0 z-50 w-full text-white select-none">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Teks Logo Kiri (MyApp) */}
                    <button
                        onClick={onBrandClick}
                        className="text-2xl font-bold hover:text-blue-100 active:scale-95 transition-all duration-200 focus:outline-none"
                    >
                        {brandName}
                    </button>

                    {/* Sisi Kanan: Navigasi */}
                    <div className="flex items-center">

                        {/* 1. TAMPILAN LAYAR LEBAR (Desktop / Tablet Menengah ke Atas) */}
                        {/* Menggunakan `sm:flex` agar menu keluar lebih cepat saat dilebarkan di inspect (di atas 640px) */}
                        <nav className="hidden sm:flex items-center">
                            <ul className="flex gap-6 lg:gap-8">
                                {menuItems.map((item) => (
                                    <li key={item.key}>
                                        <Link
                                            href={item.href || "/"}
                                            className="hover:text-blue-200 transition-colors duration-200 font-medium text-base"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* 2. TOMBOL HAMBURGER (Hanya muncul di HP / Layar di bawah 640px) */}
                        {/* Menggunakan `sm:hidden` agar langsung hilang begitu layar melebar sedikit */}
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="sm:hidden p-2 focus:outline-none hover:bg-blue-700 rounded-lg transition-colors duration-200 ml-2"
                            aria-label="Toggle Menu"
                        >
                            <div className="transform active:scale-95 transition-transform duration-200">
                                {isDropdownOpen ? <X size={24} /> : <Menu size={24} />}
                            </div>
                        </button>

                    </div>

                </div>
            </div>

            {/* 3. DROPDOWN MENU MOBILE (Hanya aktif di bawah 640px) */}
            <div
                className={`sm:hidden bg-blue-600 border-t border-blue-500/50 shadow-inner overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
            >
                <ul className="flex flex-col p-4 space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.key} className="border-b border-blue-400/10 pb-2 last:border-none last:pb-0">
                            <Link
                                href={item.href || "/"}
                                onClick={() => setIsDropdownOpen(false)}
                                className="block hover:text-blue-200 transition-all duration-200 font-medium px-2 py-1 text-base"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}