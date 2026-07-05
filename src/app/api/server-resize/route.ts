import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir, stat } from 'fs/promises';
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const thumbnailBuffer = await sharp(buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center',
            })
            .toBuffer();

        const originalBase64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        const thumbnailBase64 = `data:${file.type || 'image/jpeg'};base64,${thumbnailBuffer.toString('base64')}`;

        return NextResponse.json({
            originalUrl: originalBase64,
            thumbnailUrl: thumbnailBase64,
            size: {
                compressed: buffer.length,
                thumbnail: thumbnailBuffer.length,
            },
        });
    } catch (error) {
        console.error('Rezise error: ', error);
        return NextResponse.json({ error: 'Failed to resize image' }, { status: 500 });
    }
}