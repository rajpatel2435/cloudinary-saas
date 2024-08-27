import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { error } from 'console';
import { resolve } from 'path';
import { rejects } from 'assert';

// configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});



interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any
}


export async function POST(request: NextRequest) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "File not Found" }, { status: 400 })
        }

        // if we get file then we have property called buffer 
        // file treat as file block
        // fixed steps

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'next-cloudinary-uploads' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                );

                // no more file writeable
                uploadStream.end(buffer);
            }
        )

        return NextResponse.json({ publicId: result.public_id }, { status: 200 })
    } catch (error) {

        console.log(error);

        return NextResponse.json({ error: "uploaded Image failed" }, { status: 401 })
    }
}