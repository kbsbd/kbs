import crypto from "node:crypto";

/*
 * Cloudinary helpers. Server-only — this module reads CLOUDINARY_API_SECRET,
 * so it must never be imported from a "use client" file.
 *
 * The upload flow is deliberately *signed direct upload*:
 *
 *   browser  --(1) asks server for a signature-->  server action
 *   browser  --(2) POSTs the file straight to Cloudinary-->  Cloudinary
 *   browser  --(3) sends the returned public_id/url back-->  server action
 *                                                            (row in media_assets)
 *
 * The file never passes through the Next.js server, so a 20MB hero video
 * doesn't have to fit in a serverless request body, and the API secret never
 * leaves the server. The cloud name is public (it appears in every delivered
 * URL), which is why it is the one value exposed as NEXT_PUBLIC_.
 */

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

/**
 * Cloudinary's signature: every signed param except file/api_key/resource_type,
 * sorted by key, joined as `k=v` with `&`, then the API secret appended, then
 * SHA-1 hex.
 */
export function signParams(params) {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(toSign + API_SECRET).digest("hex");
}

/**
 * Everything the browser needs to POST a file directly to Cloudinary.
 *
 * `eager` asks Cloudinary to also build a compressed, width-capped derivative
 * at upload time — the browser already shrinks large images before uploading
 * (see MediaPicker), and this is the server-side backstop for anything that
 * slips through, plus automatic format negotiation (WebP/AVIF) on delivery.
 */
export function buildUploadSignature({ folder = "kbs", resourceType = "image" } = {}) {
  if (!isCloudinaryConfigured) return null;

  const timestamp = Math.round(Date.now() / 1000);

  // Params that are signed must be sent *exactly* as signed.
  const signed = {
    folder,
    timestamp,
    ...(resourceType === "image"
      ? { eager: "q_auto:good,f_auto,w_2000,c_limit", eager_async: "false" }
      : {}),
  };

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    resourceType,
    signature: signParams(signed),
    params: signed,
    endpoint: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
  };
}

/** Permanently removes an asset from Cloudinary. */
export async function destroyAsset(publicId, resourceType = "image") {
  if (!isCloudinaryConfigured) {
    return { ok: false, message: "Cloudinary isn't configured yet." };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp });

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature,
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
      { method: "POST", body }
    );
    const json = await response.json();

    // "not found" means it's already gone — treat that as success so a stale
    // row can still be cleared out of the library.
    if (json.result === "ok" || json.result === "not found") return { ok: true };
    return { ok: false, message: json.error?.message || json.result || "Delete failed." };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

/**
 * Turns a delivered Cloudinary URL into an optimised one by injecting
 * transformation flags after `/upload/`. Non-Cloudinary URLs pass through
 * untouched, so this is safe to call on any stored image URL.
 */
export function optimiseUrl(url, transform = "q_auto,f_auto") {
  if (!url || !url.includes("/upload/")) return url;
  if (/\/upload\/(q_auto|f_auto|w_\d|c_)/.test(url)) return url; // already transformed
  return url.replace("/upload/", `/upload/${transform}/`);
}
