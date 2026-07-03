"use client";

import { useState } from "react";
import Image from "next/image";

export default function MediaSection() {
    // State untuk mengatur buka/tutup modal video YouTube
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <section className="mt-8 space-y-8">
            {/*Judul Section*/}
            <h3 className="text-2xl font-bold">Galeri Media Responsive</h3>

            {/*Single Image*/}
            <div className="space-y-4">
                <h4 className="text-2xl font-semibold">Gambar Optimasi Otomatis</h4>
                <Image
                    src="/images.jpg"
                    width={800}
                    height={600}
                    alt="Gambar Optimasi Otomatis"
                    className="w-full h-auto rounded-lg shadow-md"
                />
                <p className="text-gray-600 text-sm">Gambar ini otomatis di lazy load, dikonversi jadi WebP, dan ukurannya disesuaikan berdasarkan device pengguna untuk performa optimal</p>
            </div>

            {/* Grid gambar 2: Di mobile bertumpuk */}
            <div>
                <h4 className="text-2xl font-semibold">Grid Gambar Responsive</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Image
                        src="/images3.jpg"
                        width={800}
                        height={600}
                        alt="Gambar 1"
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <Image
                        src="/images2.jpg"
                        width={800}
                        height={600}
                        alt="Gambar 2"
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                </div>
            </div>

            {/* Video Responsive Youtube (Dengan Mode Fokus/Blur) */}
            <div className="space-y-4">
                <h4 className="text-xl font-semibold">Video YouTube Responsive</h4>

                {/* Thumbnail Pemicu */}
                <div
                    className="aspect-video w-full relative rounded-lg shadow-xl overflow-hidden cursor-pointer group"
                    onClick={() => setIsVideoOpen(true)}
                >
                    <img
                        src="https://img.youtube.com/vi/nNJkh92SwUk/maxresdefault.jpg"
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <p className="text-gray-600 text-sm">Klik pada gambar untuk memutar video dengan mode fokus.</p>

                {/* Modal Video Popup */}
                {isVideoOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute -top-10 right-0 text-white hover:text-gray-300 font-semibold"
                                onClick={() => setIsVideoOpen(false)}
                            >
                                Tutup ✕
                            </button>

                            <iframe
                                src="https://www.youtube.com/embed/nNJkh92SwUk?si=8A7iFCkVCmZ9KK_4&autoplay=1"
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                frameBorder={0}
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>

            {/* Video lokal Opsional (DIKEMBALIKAN KE SINI) */}
            <div className="space-y-4">
                <h4 className="text-xl font-semibold">Video Lokal Responsive</h4>
                <div className="aspect-video w-full">
                    <video
                        src="/sample-video.mp4"
                        controls
                        className="w-full h-full rounded-lg shadow-xl"
                    ></video>
                </div>
                <p className="text-gray-600 text-sm">Video ini akan otomatis menyesuaikan ukuran layar dan tetap enak ditonton di mobile maupun desktop</p>
            </div>

        </section>
    )
}