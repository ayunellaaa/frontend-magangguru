"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(
    () => import("./MapComponent"),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-blue-600 font-semibold text-sm mt-2">Loading Map...</span>
                </div>
            </div>
        )
    }
);

export default function PenangananMapPage() {
    return <MapComponent />;
}