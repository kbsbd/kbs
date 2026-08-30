/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { requestUploadSignature, recordUploadedAsset } from "@/lib/actions/media";
import { createClient } from "@/lib/supabase/client";
import styles from "./MediaPicker.module.css";

/*
 * The one media control used by every form in the dashboard.
 *
 * It is a *drop-in replacement for a plain URL text input*: it still renders a
 * real named input, so the surrounding <form action={serverAction}> keeps
 * working exactly as before and nothing else in the form has to change. On top
 * of that it adds:
 *
 *   - upload  — compresses in the browser, then sends the file straight to
 *               Cloudinary with a server-issued signature
 *   - library — pick something already uploaded
 *   - clear   — empty the field
 *
 * Pasting a URL by hand still works, which matters for anything already hosted
 * elsewhere (the existing /wp-content/... theme assets, YouTube posters, etc).
 */

/* Above this, images get resized before upload. 2000px covers a full-bleed
   hero on a 2x display; anything larger is wasted bytes on every page view. */
const MAX_DIMENSION = 2000;
/* Files under this are already small enough that re-encoding would more often
   make them bigger (and would flatten PNG transparency for no gain). */
const COMPRESS_THRESHOLD_BYTES = 300 * 1024;
const JPEG_QUALITY = 0.82;

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Downscale + re-encode an image in a canvas before it leaves the browser.
 *
 * Returns the ORIGINAL file whenever compression wouldn't help: SVGs and GIFs
 * (canvas would destroy vectors and animation), small files, and any case where
 * the re-encoded result came out larger than what we started with.
 */
async function compressImage(file) {
  const untouchable = ["image/svg+xml", "image/gif"];
  if (untouchable.includes(file.type)) return file;
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= COMPRESS_THRESHOLD_BYTES) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // PNGs with transparency must not become JPEG — flattening would paint the
  // transparent areas black. Keep them as PNG (still resized, which is where
  // most of the saving comes from for oversized PNGs).
  const keepsAlpha = file.type === "image/png" || file.type === "image/webp";
  const mime = keepsAlpha ? "image/webp" : "image/jpeg";

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, mime, JPEG_QUALITY)
  );
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + (keepsAlpha ? ".webp" : ".jpg");
  return new File([blob], newName, { type: mime });
}

function LibraryModal({ resourceType, onPick, onClose }) {
  const [assets, setAssets] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase isn't configured yet.");
        setAssets([]);
        return;
      }

      let query = supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(120);

      if (resourceType) query = query.eq("resource_type", resourceType);

      const { data, error: dbError } = await query;
      if (cancelled) return;
      if (dbError) setError(dbError.message);
      setAssets(data || []);
    })();

    return () => {
      cancelled = true;
    };
  }, [resourceType]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Media library"
      >
        <div className={styles.modalHead}>
          <h3>Media library</h3>
          <button type="button" onClick={onClose} className={styles.iconButton} aria-label="Close">
            ×
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {assets === null && <p className={styles.muted}>Loading…</p>}
        {assets?.length === 0 && !error && (
          <p className={styles.muted}>Nothing uploaded yet. Use “Upload” to add the first file.</p>
        )}

        <div className={styles.grid}>
          {(assets || []).map((asset) => (
            <button
              type="button"
              key={asset.id}
              className={styles.gridItem}
              onClick={() => onPick(asset.secure_url)}
              title={asset.original_filename || asset.public_id}
            >
              {asset.resource_type === "video" ? (
                <span className={styles.videoTile}>▶ video</span>
              ) : (
                <img src={asset.secure_url} alt={asset.alt_text || ""} loading="lazy" />
              )}
              <span className={styles.gridCaption}>
                {asset.original_filename || asset.public_id.split("/").pop()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MediaPicker({
  name,
  label,
  defaultValue = "",
  accept = "image",
  folder = "kbs",
  hint,
  required = false,
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef(null);

  const isVideo = accept === "video";
  const acceptAttr = isVideo ? "video/*" : "image/*";

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      setBusy(true);
      setError("");
      setStatus("Preparing…");

      try {
        const prepared = isVideo ? file : await compressImage(file);

        if (prepared !== file) {
          setStatus(
            `Compressed ${formatBytes(file.size)} → ${formatBytes(prepared.size)}. Uploading…`
          );
        } else {
          setStatus(`Uploading ${formatBytes(file.size)}…`);
        }

        const signed = await requestUploadSignature({
          folder,
          resourceType: isVideo ? "video" : "image",
        });

        if (!signed.ok) {
          setError(signed.message);
          return;
        }

        const { endpoint, apiKey, signature, params } = signed.signature;

        const body = new FormData();
        body.append("file", prepared);
        body.append("api_key", apiKey);
        body.append("signature", signature);
        Object.entries(params).forEach(([key, val]) => body.append(key, String(val)));

        const response = await fetch(endpoint, { method: "POST", body });
        const json = await response.json();

        if (!response.ok || json.error) {
          setError(json.error?.message || "Cloudinary rejected the upload.");
          return;
        }

        // Record it in the library. A failure here is non-fatal — the file is
        // already in Cloudinary and the URL is usable, it just won't appear in
        // the library list, so say so rather than pretending it all worked.
        const recorded = await recordUploadedAsset({
          public_id: json.public_id,
          secure_url: json.secure_url,
          resource_type: json.resource_type,
          format: json.format,
          width: json.width,
          height: json.height,
          bytes: json.bytes,
          original_filename: json.original_filename || file.name,
          folder,
        });

        setValue(json.secure_url);
        setStatus(
          recorded.ok
            ? "Uploaded."
            : "Uploaded to Cloudinary, but it couldn't be added to the library."
        );
      } catch (err) {
        setError(err.message || "Upload failed.");
      } finally {
        setBusy(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [folder, isVideo]
  );

  return (
    <div className={styles.wrap}>
      {label && (
        <span className={styles.label}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      )}

      {/* The real form field. Read-only to the eye but still editable, so a
          hand-pasted URL keeps working. */}
      <input
        type="text"
        name={name}
        value={value}
        required={required}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Upload a file, choose from the library, or paste a URL"
        className={styles.input}
      />

      {value && (
        <div className={styles.preview}>
          {isVideo ? (
            <video src={value} className={styles.previewMedia} muted playsInline controls />
          ) : (
            <img src={value} alt="" className={styles.previewMedia} />
          )}
        </div>
      )}

      <div className={styles.actions}>
        <input
          ref={fileRef}
          type="file"
          accept={acceptAttr}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className={styles.hiddenFile}
          id={`${name}-file`}
        />
        <label htmlFor={`${name}-file`} className={styles.button} data-disabled={busy || undefined}>
          {busy ? "Working…" : "Upload"}
        </label>

        <button
          type="button"
          className={styles.button}
          onClick={() => setLibraryOpen(true)}
          disabled={busy}
        >
          Library
        </button>

        {value && (
          <button
            type="button"
            className={styles.buttonGhost}
            onClick={() => {
              setValue("");
              setStatus("");
            }}
            disabled={busy}
          >
            Clear
          </button>
        )}
      </div>

      {hint && <p className={styles.hint}>{hint}</p>}
      {status && !error && <p className={styles.status}>{status}</p>}
      {error && <p className={styles.error}>{error}</p>}

      {libraryOpen && (
        <LibraryModal
          resourceType={isVideo ? "video" : "image"}
          onClose={() => setLibraryOpen(false)}
          onPick={(url) => {
            setValue(url);
            setLibraryOpen(false);
            setStatus("Chosen from library.");
          }}
        />
      )}
    </div>
  );
}
