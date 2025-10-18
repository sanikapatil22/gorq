// src/app/api/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cloudinary, validateCloudinaryConfig } from "@/lib/cloudinary";
import Groq from "groq-sdk";

export const POST = async (req: NextRequest) => {
  try {
    // Validate Cloudinary configuration
    validateCloudinaryConfig();
    
    // Configure Groq inside the handler
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Get file from formData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) throw new Error("No file uploaded");

    // Convert file to ArrayBuffer -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload original image to Cloudinary
    const uploadedUrl: string = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "antique_originals" },
        (error, result) => {
          if (error) return reject(error);
          if (!result?.secure_url) return reject(new Error("Upload failed"));
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });

    // Convert image to base64 for Groq API
    const base64Image = buffer.toString("base64");
    const imageUrl = `data:${file.type};base64,${base64Image}`;

    // Use Groq's vision model to analyze and describe the restoration
    const completion = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
            {
              type: "text",
              text: "You are an expert at restoring antique items. Describe in detail what this antique item would look like when it was brand new, including colors, textures, finish, and any details that may have been lost to rust, damage, or age. Be specific and descriptive.",
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const restorationDescription = completion.choices[0]?.message?.content || "";

    // Use Groq to generate the restored image description
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an AI that helps restore images of antique items by providing detailed descriptions of what they would look like when brand new.",
        },
        {
          role: "user",
          content: `Based on this description of an antique item: "${restorationDescription}", create a detailed image restoration guide that describes exactly what the item should look like when fully restored to its original condition.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const restorationGuide = response.choices[0]?.message?.content || "";

    // For now, since we're using Groq which doesn't have image generation,
    // we'll apply Cloudinary transformations to enhance the image
    // This is a practical solution that improves the image quality
    const restoredUrl = cloudinary.url(uploadedUrl.split('/').pop() || "", {
      transformation: [
        { effect: "sharpen:100" },
        { effect: "contrast:20" },
        { effect: "vibrance:30" },
        { effect: "brightness:10" },
        { effect: "saturation:20" },
        { effect: "auto_color" },
        { effect: "auto_contrast" },
      ],
      folder: "antique_originals",
    });

    return NextResponse.json({ 
      uploadedUrl, 
      restoredImageUrl: restoredUrl,
      restorationDescription,
      restorationGuide,
    });
  } catch (err) {
    console.error("Restore error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
};
