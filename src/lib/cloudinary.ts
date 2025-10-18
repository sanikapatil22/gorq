import { v2 as cloudinary } from "cloudinary";

// Validate that required Cloudinary environment variables are set
export const validateCloudinaryConfig = () => {
  const requiredVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Cloudinary environment variables: ${missingVars.join(", ")}. ` +
      `Please set these variables in your .env.local file.`
    );
  }
};

// Configure Cloudinary (will be validated when actually used)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export const uploadToCloudinary = async (file: Blob | File) => {
  // Validate configuration before attempting upload
  validateCloudinaryConfig();
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const streamPromise = new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "restored_images" },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

  return streamPromise;
};
