import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadedImage {
  imageUrl: string;
  cloudinaryPublicId: string;
}

/** Uploads an image buffer to Cloudinary under interio-quote/<folder>. Server-only. */
export async function uploadImage(
  buffer: Buffer,
  folder: "templates" | "quotes"
): Promise<UploadedImage> {
  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `interio-quote/${folder}`,
          resource_type: "image",
          transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve(result);
        }
      );
      stream.end(buffer);
    }
  );
  return { imageUrl: result.secure_url, cloudinaryPublicId: result.public_id };
}

export async function deleteImage(cloudinaryPublicId: string): Promise<void> {
  await cloudinary.uploader.destroy(cloudinaryPublicId);
}
