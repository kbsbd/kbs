"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { img } from "@/lib/media";

/**
 * Pick an image → resize / compress it in the browser → upload to Cloudinary
 * through /api/admin/upload → hand the finished delivery URL back via onChange.
 * The parent stores that URL; nothing but the URL string touches the database.
 *
 * `variant` tunes the resize:
 *   cover   (default) — big content images, up to 2200px, WebP
 *   logo    — up to 800px longest edge, keeps transparency
 *   favicon — centre-cropped to a 512×512 square
 *
 * `value` may be a full URL (new uploads) or a legacy bare stem — img() resolves
 * both, so old rows keep working.
 */

type Variant = "cover" | "logo" | "favicon";

const PRESETS: Record<Variant, { maxWidthOrHeight: number; maxSizeMB: number; fileType: "image/webp" | "image/png" }> = {
  cover: { maxWidthOrHeight: 2200, maxSizeMB: 0.9, fileType: "image/webp" },
  logo: { maxWidthOrHeight: 800, maxSizeMB: 0.4, fileType: "image/png" },
  favicon: { maxWidthOrHeight: 512, maxSizeMB: 0.2, fileType: "image/png" },
};

function toDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Centre-crop a File to a square PNG, so a favicon is never stretched. */
function cropSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      const side = Math.min(im.width, im.height);
      const canvas = document.createElement("canvas");
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no canvas"));
      ctx.drawImage(im, (im.width - side) / 2, (im.height - side) / 2, side, side, 0, 0, side, side);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("crop failed"))), "image/png");
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not read image"));
    };
    im.src = url;
  });
}

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
  variant = "cover",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  variant?: Variant;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = img(value, 480);
  const contain = variant !== "cover";

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      const source: File | Blob = variant === "favicon" ? await cropSquare(file) : file;
      const toCompress =
        source instanceof File ? source : new File([source], "img.png", { type: "image/png" });
      const compressed = await imageCompression(toCompress, {
        ...PRESETS[variant],
        useWebWorker: true,
      });
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
      {label && <label className="font-mono-label text-[color:var(--text-quiet)]">{label}</label>}
      <div className={label ? "mt-2 flex items-start gap-4" : "flex items-start gap-4"}>
        <div
          className={`media-slot grid shrink-0 place-items-center overflow-hidden ${
            variant === "favicon" ? "h-16 w-16" : "h-24 w-32"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt=""
              className={contain ? "max-h-full max-w-full object-contain p-2" : "h-full w-full object-cover"}
            />
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
              {busy ? "Uploading…" : value ? "Replace" : "Upload"}
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
          <p className="max-w-[42ch] text-xs text-[color:var(--text-quiet)]">
            {hint ?? "Compressed in your browser before upload. JPG, PNG, WebP or GIF."}
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
