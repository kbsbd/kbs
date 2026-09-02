/**
 * Cloudinary — server only. The API secret must never reach the browser.
 *
 * The admin dashboard compresses an image in the browser first, then posts it
 * to /api/admin/upload, which calls uploadImage() here. We store the finished
 * delivery URL (with f_auto,q_auto baked in) straight into the database, so the
 * public site never needs the Cloudinary account at all — img() just passes an
 * http(s) URL through untouched.
 */

import { v2 as cloudinary } from "cloudinary";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const KEY = process.env.CLOUDINARY_API_KEY || "";
const SECRET = process.env.CLOUDINARY_API_SECRET || "";
const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "kbs";

export const cloudinaryConfigured = Boolean(CLOUD && KEY && SECRET);

if (cloudinaryConfigured) {
  cloudinary.config({ cloud_name: CLOUD, api_key: KEY, api_secret: SECRET, secure: true });
}

/**
 * Upload one image, given as a data: URI (what the browser compressor produces).
 * Returns the delivery URL to store and the public id for later deletion.
 */
export async function uploadImage(
  dataUri: string,
  folder = FOLDER
): Promise<{ url: string; publicId: string }> {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    // a second pass of savings on top of the browser-side compression
    quality: "auto:good",
  });
  const url = cloudinary.url(res.public_id, {
    secure: true,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url, publicId: res.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!cloudinaryConfigured || !publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
