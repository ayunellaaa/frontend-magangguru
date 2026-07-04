"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header: Sticky di atas */}
            <div className="sticky top-0 z-50">
                <Header brandName="MyApp" onBrandClick={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            <div className="flex flex-1 relative">
                {/* Sidebar: Overlay di mobile, Sticky di desktop */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 transition-all duration-300 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}