"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";

// Menghapus fungsi bawaan untuk di-override
if (typeof window !== "undefined" && L.Icon.Default.prototype) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
}

if (typeof window !== "undefined") {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

export default function MapComponent() {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(false);

    const getUserLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setLoading(false);
                },
                (err) => {
                    alert("Eror mendapatkan lokasi: " + err.message)
                    setLoading(false);
                }
            );
        }
    }

    return (
        <MainLayout>
            <PageTransition>
                <div className="min-h-screen bg-gray-50">
                    <div className="container mx-auto p-6">
                        <div className="mb-6">
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm w-fit"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Home
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold mb-6">Peta Sederhana</h1>

                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <button
                                onClick={getUserLocation}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                                {loading ? "Mencari lokasi..." : "Temukan Lokasi Saya"}
                            </button>

                            {userLocation && (
                                <p className="mt-2 text-gray-600">
                                    Lokasi anda: Latitude {userLocation[0].toFixed(4)}, Longitude {userLocation[1].toFixed(4)}
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <MapContainer
                                center={[-6.2088, 106.8456]}
                                zoom={5}
                                style={{ height: "500px", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                {userLocation && (
                                    <Marker position={userLocation}>
                                        <Popup>Lokasi Anda</Popup>
                                    </Marker>
                                )}
                            </MapContainer>

                        </div>
                    </div>
                </div>
            </PageTransition>
        </MainLayout>
    );
}
