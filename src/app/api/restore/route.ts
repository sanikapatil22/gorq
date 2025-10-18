// src/app/api/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req: NextRequest) => {
  try {
    // Get file from formData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) throw new Error("No file uploaded");

    // Convert file to ArrayBuffer -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadedUrl: string = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url);
        }
      );
      stream.end(buffer);
    });

    // Send to OpenAI Janus Pro for restoration
    const restored = await openai.images.edit({
      model: "deepseek/janus-pro-7b",
      prompt: "Restore this antique to its original brand-new look",
      image: buffer as any, // TS-safe
    });

    const restoredUrl = restored.data?.[0]?.url;

    return NextResponse.json({ uploadedUrl, restoredUrl });
  } catch (err) {
    console.error("Restore error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
};
