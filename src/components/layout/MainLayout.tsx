"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setIsAuthenticated(true);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/login");
            } else {
                setIsAuthenticated(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500 animate-pulse font-medium">Checking session...</div>
            </div>
        );
    }

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