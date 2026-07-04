"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

import MediaSection from "@/components/MediaSection";
import InfiniteScrollFeed from "@/components/InfiniteScroll";

export default function HomePage() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen to auth state changes (e.g. if user logs out from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse">Memeriksa sesi...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-20 bg-gray-50">
          <Header
            brandName="MyApp"
            onBrandClick={() => setSidebarOpen(!isSidebarOpen)}
          />
        </div>

        <main className="flex-1 p-4 sm:p-6 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Selamat Datang</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">Statistik 1</div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">Statistik 2</div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100 md:col-span-2">Statistik Full</div>
          </div>

          <div className="space-y-6">
            <MediaSection />
            <InfiniteScrollFeed />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}