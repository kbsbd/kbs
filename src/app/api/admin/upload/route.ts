import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";

/**
 * Admin image upload.
 *
 * The browser compresses the file first and sends it as a data: URI. This route
 * re-checks the admin session (a route handler is a public endpoint), pushes the
 * image to Cloudinary and returns the finished delivery URL for the dashboard to
 * save into the row it is editing.
 */

export const runtime = "nodejs";

/* Post-compression the payload is small; this is a generous ceiling on the
   base64 string, not the image. */
const MAX_CHARS = 12_000_000;

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "not signed in as an admin" }, { status: 401 });
  }
  if (!cloudinaryConfigured) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server." },
      { status: 503 }
    );
  }

  let body: { dataUri?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const dataUri = typeof body.dataUri === "string" ? body.dataUri : "";
  if (!/^data:image\/(png|jpe?g|webp|gif|avif);base64,/.test(dataUri)) {
    return NextResponse.json({ error: "expected an image data URI" }, { status: 422 });
  }
  if (dataUri.length > MAX_CHARS) {
    return NextResponse.json({ error: "image too large" }, { status: 413 });
  }

  try {
    const { url, publicId } = await uploadImage(dataUri);
    return NextResponse.json({ ok: true, url, publicId });
  } catch (err) {
    console.error("[upload] cloudinary failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
