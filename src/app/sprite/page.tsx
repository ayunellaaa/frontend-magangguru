"use client";

import { useState } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";

type Icon = {
    name: string;
    posX: string; // Koordinat X custom dalam persen
    posY: string; // Koordinat Y custom dalam persen
    color: string;
}

export default function SpritePage() {
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);

    // Nilai persentase di bawah ini sudah dikalibrasi manual agar presisi di tengah kotak
    const socialIcons: Icon[] = [
        // Baris 1
        { name: "WhatsApp", posX: "13.2%", posY: "13.2%", color: "#25d366" },
        { name: "Pinterest", posX: "37.8%", posY: "13.2%", color: "#e60023" },
        { name: "LinkedIn", posX: "62.3%", posY: "13.2%", color: "#0077b5" },
        { name: "Skype", posX: "86.8%", posY: "13.2%", color: "#00aff0" },

        // Baris 2
        { name: "Dribbble", posX: "13.2%", posY: "37.8%", color: "#ea4c89" },
        { name: "Facebook", posX: "37.8%", posY: "37.8%", color: "#1877f2" },
        { name: "Google+", posX: "62.3%", posY: "37.8%", color: "#dd4b39" },
        { name: "Behance", posX: "86.8%", posY: "37.8%", color: "#0073e6" },

        // Baris 3
        { name: "Twitter", posX: "13.2%", posY: "62.3%", color: "#1da1f2" },
        { name: "Instagram", posX: "37.8%", posY: "62.3%", color: "#e4405f" },
        { name: "Snapchat", posX: "62.3%", posY: "62.3%", color: "#fffc00" },
        { name: "Vimeo", posX: "86.8%", posY: "62.3%", color: "#1ab7ea" },

        // Baris 4
        { name: "Youtube", posX: "13.2%", posY: "86.8%", color: "#ff0000" },
        { name: "Messenger", posX: "37.8%", posY: "86.8%", color: "#0084ff" },
        { name: "Codepen", posX: "62.3%", posY: "86.8%", color: "#1769ff" },
        { name: "RSS", posX: "86.8%", posY: "86.8%", color: "#f26522" },
    ];

    const displaySize = 80;
    const previewSize = 200;

    return (
        <MainLayout>
            <PageTransition>
                <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
                    {/* Header */}
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                        <h1 className="m-0 text-xl md:text-2xl font-semibold">Sosial Media Icons</h1>
                        <p className="mt-2 mb-0 text-gray-600 text-sm md:text-base">CSS Sprite Sheet</p>
                    </div>

                    {/* IconGrid */}
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                            {socialIcons.map((icon, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center gap-2 md:gap-3 cursor-pointer"
                                    onMouseEnter={() => setHoveredIcon(icon.name)}
                                    onMouseLeave={() => setHoveredIcon(null)}
                                    onClick={() => setSelectedIcon(icon)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div
                                        className={`rounded-xl shadow-sm transition-all duration-200
                                ${hoveredIcon === icon.name ? 'scale-110' : 'scale-100'}`}
                                        style={{
                                            width: `${displaySize}px`,
                                            height: `${displaySize}px`,
                                            backgroundImage: 'url("/logo.jpg")',
                                            // Skala zoom background disesuaikan sedikit ke 4.62 agar lingkaran memenuhi box dengan rapi
                                            backgroundSize: `${displaySize * 4.62}px ${displaySize * 4.62}px`,
                                            backgroundPosition: `${icon.posX} ${icon.posY}`,
                                            boxShadow: hoveredIcon === icon.name
                                                ? `0 4px 12px ${icon.color}60`
                                                : undefined
                                        }}
                                    />
                                    <span className="text-xs md:text-sm text-gray-800 text-center">{icon.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Preview Section */}
                        {selectedIcon && (
                            <div className="mt-4 md:mt-6 p-4 md:p-6 rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4 md:items-center shadow-sm">
                                <div className="rounded-2xl mx-auto md:mx-0 flex-shrink-0"
                                    style={{
                                        width: `${previewSize}px`,
                                        height: `${previewSize}px`,
                                        backgroundImage: "url('/logo.jpg')",
                                        backgroundSize: `${previewSize * 4.62}px ${previewSize * 4.62}px`,
                                        backgroundPosition: `${selectedIcon.posX} ${selectedIcon.posY}`,
                                    }}
                                />

                                <div className="flex-1 w-full md:w-auto text-center md:text-left">
                                    <h3 className="m-0 text-lg md:text-xl font-semibold">{selectedIcon.name}</h3>
                                    <p className="text-gray-600 text-sm mt-2 mb-0">Preview</p>
                                    <div className="mt-3 md:mt-4">
                                        <button
                                            onClick={() => setSelectedIcon(null)}
                                            className="px-4 py-2 rounded-lg border-none bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors">
                                            Close
                                        </button>
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