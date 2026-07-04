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

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        let ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || ext === 'blob') {
            const mimeType = file.type || '';
            if (mimeType.startsWith('image/')) {
                ext = mimeType.split('/')[1];
                if (ext === 'jpeg') ext = 'jpg';
            } else {
                ext = 'jpg';
            }
        }

        const originalFilename = `${timestamp}-compressed.${ext}`;
        const thumbnailFilename = `${timestamp}-thumbnail.${ext}`;

        const originalPath = path.join(uploadDir, originalFilename);
        await writeFile(originalPath, buffer);

        const thumbnailPath = path.join(uploadDir, thumbnailFilename);
        await sharp(buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center',
            })
            .toFile(thumbnailPath);

        const compressedStats = await stat(originalPath);
        const thumbnailStats = await stat(thumbnailPath);

        return NextResponse.json({
            originalUrl: `/uploads/${originalFilename}`,
            thumbnailUrl: `/uploads/${thumbnailFilename}`,
            size: {
                compressed: compressedStats.size,
                thumbnail: thumbnailStats.size,
            },
        });
    } catch (error) {
        console.error('Rezise error: ', error);
        return NextResponse.json({ error: 'Failed to resize image' }, { status: 500 });
    }
}