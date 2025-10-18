import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = async (file: Blob | File) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await cloudinary.uploader.upload_stream({
    resource_type: "image",
    folder: "restored_images",
  }, (error, result) => {
    if (error) throw error;
    return result;
  });

  const streamPromise = new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      resolve(result?.secure_url!);
    });
    stream.end(buffer);
  });

  return streamPromise;
};
