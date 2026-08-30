"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  buildUploadSignature,
  destroyAsset,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

/**
 * Step 1 of the upload: hand the browser a short-lived signature.
 *
 * Gated on an admin session — without this check anyone could mint upload
 * credentials for the account by calling the action directly.
 */
export async function requestUploadSignature({ folder = "kbs", resourceType = "image" } = {}) {
  const { error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  if (!isCloudinaryConfigured) {
    return {
      ok: false,
      message:
        "Cloudinary isn't configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    };
  }

  const safeFolder = String(folder || "kbs").replace(/[^a-zA-Z0-9/_-]/g, "") || "kbs";
  const safeType = ["image", "video", "raw"].includes(resourceType) ? resourceType : "image";

  return { ok: true, signature: buildUploadSignature({ folder: safeFolder, resourceType: safeType }) };
}

/**
 * Step 3: record what Cloudinary just accepted, so the file shows up in the
 * media library and can be reused or deleted later.
 */
export async function recordUploadedAsset(asset) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  if (!asset?.public_id || !asset?.secure_url) {
    return { ok: false, message: "Upload response was missing public_id or secure_url." };
  }

  const row = {
    public_id: String(asset.public_id),
    secure_url: String(asset.secure_url),
    resource_type: String(asset.resource_type || "image"),
    format: asset.format ? String(asset.format) : null,
    width: Number.isFinite(asset.width) ? asset.width : null,
    height: Number.isFinite(asset.height) ? asset.height : null,
    bytes: Number.isFinite(asset.bytes) ? asset.bytes : null,
    original_filename: asset.original_filename ? String(asset.original_filename) : null,
    folder: asset.folder ? String(asset.folder) : "kbs",
  };

  // Re-uploading the same public_id overwrites in Cloudinary, so mirror that
  // here instead of erroring on the unique index.
  const { data, error: dbError } = await supabase
    .from("media_assets")
    .upsert(row, { onConflict: "public_id" })
    .select()
    .maybeSingle();

  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/admin/media");
  return { ok: true, asset: data || row };
}

export async function updateAssetAltText(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const altText = String(formData.get("alt_text") || "").trim() || null;

  const { error: dbError } = await supabase
    .from("media_assets")
    .update({ alt_text: altText })
    .eq("id", id);

  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/admin/media");
  return { ok: true, message: "Saved." };
}

/**
 * Deletes from Cloudinary first, then from the library. If Cloudinary refuses
 * we keep the row — a dangling row is recoverable, an orphaned Cloudinary file
 * that nothing references is not.
 */
export async function deleteMediaAsset(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");

  const { data: asset, error: readError } = await supabase
    .from("media_assets")
    .select("public_id, resource_type")
    .eq("id", id)
    .maybeSingle();

  if (readError) return { ok: false, message: readError.message };
  if (!asset) return { ok: false, message: "That file is no longer in the library." };

  const destroyed = await destroyAsset(asset.public_id, asset.resource_type || "image");
  if (!destroyed.ok) {
    return { ok: false, message: `Cloudinary: ${destroyed.message}` };
  }

  const { error: dbError } = await supabase.from("media_assets").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/admin/media");
  return { ok: true, message: "Deleted." };
}
