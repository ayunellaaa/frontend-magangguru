import { useState } from "react";

import imageCompression from "browser-image-compression";

interface ClientCompressProps {
    onCompressed: (file: File, originalFile: number) => void;
}

export default function ClientCompression({ onCompressed }: ClientCompressProps) {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [compressedFile, setCompressedFile] = useState<File | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>("");
    const [compressedPreview, setCompressedPreview] = useState<string>("");
    const [compressing, setCompressing] = useState(false);

    const handlefilechange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOriginalFile(file);
        setOriginalPreview(URL.createObjectURL(file));
        setCompressing(true);

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,

            };
            const compressed = await imageCompression(file, options);
            setCompressedFile(compressed);
            setCompressedPreview(URL.createObjectURL(compressed));
            onCompressed(compressed, file.size);

        } catch (error) {
            console.error("Compression failed:", error);
        } finally {
            setCompressing(false);
        }
    };

    const formatBytes = (bytes: number) => {
        return (bytes / 1024).toFixed(2) + "KB"
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
                Step 1: Client-Side Compression
            </h2>
            <p className="text-grray-600 mb-6">Upload Gambar untuk kompres otomatis di browser</p>
            <input
                type="file"
                accept="image/*"
                onChange={handlefilechange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file-text-sm file:font-semibold file:bg-blue-500 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />

            {compressing && (
                <div className="mt-6 text-center">
                    <p className="text-gray-600">Compressing...</p>
                </div>
            )}

            {originalPreview && compressedPreview && !compressing && (
                <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Original</h3>
                        <img src={originalPreview} alt="Original"
                            className="w-full h-64 object-contain rounded bg-gray-50"
                        />
                        <div className="mt-3 text-sm text-gray-600">
                            <p>Size: {originalFile && formatBytes(originalFile?.size)}</p>
                            <p>Type: {originalFile?.type}</p>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Compressed</h3>
                        <img src={compressedPreview} alt="Original"
                            className="w-full h-64 object-contain rounded bg-gray-50"
                        />
                        <div className="mt-3 text-sm text-gray-600">
                            <p>Size: {compressedFile && formatBytes(compressedFile?.size)}</p>
                            <p>Type: {compressedFile?.type}</p>
                            <p>Saved: {compressedFile && compressedFile && originalFile && formatBytes(originalFile.size - compressedFile.size)}</p>
                        </div>
                    </div>

                </div>


            )}



        </div>
    )

}