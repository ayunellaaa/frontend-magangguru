"use client";

import { useState } from "react";

interface WebPConversionProps {
    compressedFile: File | null;
    resizeData: any;
}

export default function WebPConversion({ compressedFile, resizeData }: WebPConversionProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    // Ambil nilai originalSize secara aman, berikan fallback 0 jika kosong
    const origSize = (resizeData && resizeData.originalSize) || 0;
    const webpSize = (result && result.size && result.size.webp) || 0;
    const savingsBytes = origSize - webpSize;
    const savingsPercent = origSize > 0 ? ((savingsBytes / origSize) * 100).toFixed(1) : "0.0";

    const handleConvert = async () => {
        if (!compressedFile) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('file', compressedFile, compressedFile.name || 'image.jpg');

        try {
            const response = await fetch('/api/webp', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResult(data);
        }
        catch (error) {
            console.error("Error converting file:", error);
        }
        finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Step 3: WebP Conversion</h2>
            <p className="text-gray-700 mb-4">Convert ke format WebP untuk performa optimal</p>

            <button
                onClick={handleConvert}
                disabled={!compressedFile || loading}
                className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium"
            >
                {loading ? 'Converting...' : 'Convert to WebP'}
            </button>

            {result && (
                <>
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Original Format(Compressed)</h3>
                            <img
                                src={result.originalUrl}
                                alt="Compressed"
                                className="w-full h-64 object-contain rounded bg-gray-50"
                            />
                            <p className="mt-3 text-sm text-gray-600">
                                Size: {formatBytes(result.size.original)}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">WebP Format</h3>
                            <picture>
                                <source srcSet={result.webpUrl} type="image/webp" />
                                <img
                                    src={result.webpUrl}
                                    alt="WebP"
                                    className="w-full h-64 object-contain rounded bg-gray-50"
                                />
                            </picture>
                            <p className="mt-3 text-sm text-gray-600">
                                Size: {formatBytes(result.size.webp)}
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                                Saved: {formatBytes(result.size.original - result.size.webp)}
                                ({((1 - (result.size.webp / result.size.original)) * 100).toFixed(1)} % dari ukuran original)
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100">
                        <h4 className="font-semibold mb-3">Final Comparion (End-to-End)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Original Upload</p>
                                <p className="font-bold text-lg">{formatBytes(resizeData && resizeData.originalSize)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Compressed</p>
                                <p className="font-bold text-lg">{formatBytes(result.size.original)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Thumbnail</p>
                                <p className="font-bold text-lg">{resizeData && formatBytes(resizeData.size.thumbnail)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">WebP (Final)</p>
                                <p className="font-bold text-lg text-green-600">{formatBytes(result.size.webp)}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-center text-green-600 font-semibold text-lg">
                                Total Savings (WebP vs Original): {formatBytes(savingsBytes)} ({savingsPercent}%)
                            </p>

                        </div>
                    </div>
                </>
            )}


        </div>
    )

}