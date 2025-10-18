import { NextRequest, NextResponse } from "next/server";
import { cloudinary, validateCloudinaryConfig } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    // Validate Cloudinary configuration
    validateCloudinaryConfig();
    
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use a Promise wrapper for upload_stream
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "restores" }, (err, res) => {
        if (err || !res) reject(err || new Error("Upload failed"));
        else resolve(res);
      });
      stream.end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
