"use client";

import { useState } from "react";
import Link from "next/link"; // 1. Tambahkan import Link di sini
import ClientCompression from "@/components/ClientCompression";
import ServerSide from "@/components/ServerSide";
import WebPConversion from "@/components/WebPConversion";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";

export default function ImageProcessPage() {
    const [compressedFile, setCompressedFile] = useState<File | null>(null);
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [resizedFile, setResizedFile] = useState<any | null>(null);

    const handleFileCompressed = (file: File, originalSize: number) => {
        setCompressedFile(file);
        setOriginalSize(originalSize);
        setResizedFile(null);
    };

    const handleResizedFile = (data: any) => {
        setResizedFile(data);
    };

    return (
        <MainLayout>
            <PageTransition>
                <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
                    <div className="max-w-6xl mx-auto">

                        {/* 2. Tambahkan Menu/Tombol Kembali ke Home di sini */}
                        <div className="mb-6">
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm w-fit"
                            >
                                {/* Icon panah ke kiri */}
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Home
                            </Link>
                        </div>

                        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800">
                            Image Optimizer
                        </h1>

                        <ClientCompression onCompressed={handleFileCompressed} />

                        {compressedFile && (
                            <ServerSide
                                compressedFile={compressedFile}
                                originalSize={originalSize}
                                onresized={handleResizedFile}
                            />
                        )}

                        {resizedFile && compressedFile && (
                            <WebPConversion
                                compressedFile={compressedFile}
                                resizeData={{ ...resizedFile, originalSize: originalSize }}
                            />
                        )}
                    </div>
                </main>
            </PageTransition>
        </MainLayout>
    )
}