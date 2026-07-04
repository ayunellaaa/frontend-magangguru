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