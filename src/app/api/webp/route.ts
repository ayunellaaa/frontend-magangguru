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

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, {recursive: true});

        const timestamp = Date.now();
        const ext = file.name.split('.').pop();

        const originalFilename = `${timestamp}-final.${ext}`;
        const webpFilename = `${timestamp}-final.webp`;

        const originalPath = path.join(uploadDir, originalFilename);
        const webpPath = path.join(uploadDir, webpFilename);
        await writeFile(originalPath, buffer);
       
        await sharp(buffer)
        .webp({quality: 80})
        .toFile(webpPath) ;

        const originalStats = await stat(originalPath);
        const webpStats = await stat(webpPath);

        return NextResponse.json({
            originalUrl: `/uploads/${originalFilename}`,
            webpUrl: `/uploads/${webpFilename}`,
            size: {
                originalUpload: file.size,
                original: originalStats.size,
                webp: webpStats.size
            },
        });
    }
    catch(error){
        console.error('WebP Conversion error: ', error);
        return NextResponse.json({error: 'Failed to convert image'}, {status: 500});
    }
}