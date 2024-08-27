import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';



const prisma= new PrismaClient();

// configuration
cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, 
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});



interface CloudinaryUploadResult{
    public_id: string;
    bytes: number;
    duration?: number ;
    [key: string]: any
}


export async function POST(request:NextRequest) {
    const {userId}= auth();

    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status: 401});

    }



    try {
        const formData= await request.formData();
        const file= formData.get("file") as File | null;

        const title= formData.get("title") as string;
        const description= formData.get("description") as string;
const originalSize= formData.get("originalSize") as string;        

        if(!file){
            return NextResponse.json({error: "File not Found"}, { status: 400 })
        }

        // if we get file then we have property called buffer 
        // file treat as file block
        // fixed steps

        const bytes= await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

      const result=  await new Promise<CloudinaryUploadResult>(
            (resolve,reject)=>{
                const uploadStream= cloudinary.uploader.upload_stream(
                    { 
                        resource_type: "video",
                        folder: 'video-uploads',
                        transformation: [
                            {
                                quality: "auto",
                                fetch_format: "mp4"
                            }
                        ]
                    
                    
                    },
                    (error ,result)=>{
                        if(error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                );

                // no more file writeable
                uploadStream.end(buffer);
            }
        )
// store in prisma client in order to add 
        const video= await prisma.video.create({
            data:{
                title,
                description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration || 0,


            }
        })

        return NextResponse.json({ video }, { status: 200 })
    } catch (error) {
        // logged errors
        console.log(error);

        return NextResponse.json({ error : "uploaded Video failed"}, {status: 500})
    } finally{
        // discoonect prisma here
        await prisma.$disconnect();
    }
}