import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir, stat } from 'fs/promises';
import path from "path";

export async function POST(request: NextRequest){
    try{
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if(!file){
            return NextResponse.json({error: 'No file uploaded'}, {status: 400});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const webpBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        const originalBase64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        const webpBase64 = `data:image/webp;base64,${webpBuffer.toString('base64')}`;

        return NextResponse.json({
            originalUrl: originalBase64,
            webpUrl: webpBase64,
            size: {
                originalUpload: file.size,
                original: buffer.length,
                webp: webpBuffer.length
            },
        });
    }
    catch(error){
        console.error('WebP Conversion error: ', error);
        return NextResponse.json({error: 'Failed to convert image'}, {status: 500});
    }
}