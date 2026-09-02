"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { img } from "@/lib/media";

/**
 * Pick an image → compress it in the browser → upload to Cloudinary through
 * /api/admin/upload → hand the finished delivery URL back via onChange. The
 * parent stores that URL on the row it is editing; nothing but the URL string
 * ever touches the database.
 *
 * `value` may be a full URL (new uploads) or a legacy bare stem — img() resolves
 * both, so old rows keep working.
 */

const COMPRESS = {
  maxWidthOrHeight: 2200,
  maxSizeMB: 0.9,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

function toDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = img(value, 480);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked after a failure
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      const compressed = await imageCompression(file, COMPRESS);
      const dataUri = await toDataUri(compressed);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUri }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "upload failed");
      onChange(json.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="font-mono-label text-[color:var(--text-quiet)]">{label}</label>
      <div className="mt-2 flex items-start gap-4">
        <div className="media-slot grid h-24 w-32 shrink-0 place-items-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="media-slot-label font-mono-label text-[10px]">No image</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
            </button>
            {value && !busy && (
              <button
                type="button"
                className="text-xs text-[color:var(--clay)] hover:underline"
                onClick={() => onChange("")}
              >
                Remove
              </button>
            )}
          </div>
          <p className="max-w-[40ch] text-xs text-[color:var(--text-quiet)]">
            Compressed in your browser before upload. JPG, PNG, WebP or GIF.
          </p>
          {error && (
            <p className="text-xs text-[color:var(--clay)]" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
