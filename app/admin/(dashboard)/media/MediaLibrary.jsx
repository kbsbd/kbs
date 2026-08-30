/* eslint-disable @next/next/no-img-element */
"use client";

import { useActionState, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import { deleteMediaAsset, updateAssetAltText } from "@/lib/actions/media";
import styles from "./media.module.css";

const initialState = { ok: false, message: "" };

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DeleteButton({ asset }) {
  const [state, formAction, pending] = useActionState(deleteMediaAsset, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Delete "${asset.original_filename || asset.public_id}" from Cloudinary?\n\n` +
              "This cannot be undone, and any page still pointing at this file will show a broken image."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={asset.id} />
      <button type="submit" className={styles.dangerButton} disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.message && !state.ok && <span className={styles.error}>{state.message}</span>}
    </form>
  );
}

function AltTextForm({ asset }) {
  const [state, formAction, pending] = useActionState(updateAssetAltText, initialState);

  return (
    <form action={formAction} className={styles.altForm}>
      <input type="hidden" name="id" value={asset.id} />
      <input
        type="text"
        name="alt_text"
        defaultValue={asset.alt_text || ""}
        placeholder="Describe this image"
        aria-label="Alt text"
      />
      <button type="submit" className={styles.ghostButton} disabled={pending}>
        {pending ? "…" : "Save"}
      </button>
      {state.message && (
        <span className={state.ok ? styles.success : styles.error}>{state.message}</span>
      )}
    </form>
  );
}

export default function MediaLibrary({ assets }) {
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState("all");

  const visible = assets.filter((a) => filter === "all" || a.resource_type === filter);

  async function copy(url, id) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard access can be denied (insecure origin, permissions). The URL
      // is visible in the field below anyway, so this just doesn't confirm.
      setCopied(null);
    }
  }

  return (
    <>
      {/* Uploading here is the same control the forms use, so there is one
          upload path to maintain. The field value is discarded — the point is
          the side effect of the file landing in the library. */}
      <div className={styles.uploadArea}>
        <MediaPicker
          name="library_upload_image"
          label="Upload an image"
          folder="kbs"
          accept="image"
          hint="Large images are resized to 2000px and re-encoded before upload."
        />
        <MediaPicker
          name="library_upload_video"
          label="Upload a video"
          folder="kbs/video"
          accept="video"
          hint="Videos are uploaded as-is. Keep hero videos under about 5MB."
        />
      </div>

      <div className={styles.filterRow}>
        {["all", "image", "video"].map((key) => (
          <button
            key={key}
            type="button"
            className={styles.filterButton}
            data-active={filter === key || undefined}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "All" : key === "image" ? "Images" : "Videos"}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className={styles.empty}>
          Nothing here yet. Upload a file above, and it becomes available in every image and video
          field across the dashboard.
        </p>
      )}

      <ul className={styles.grid}>
        {visible.map((asset) => (
          <li key={asset.id} className={styles.card}>
            <div className={styles.thumb}>
              {asset.resource_type === "video" ? (
                <video src={asset.secure_url} muted playsInline controls preload="metadata" />
              ) : (
                <img src={asset.secure_url} alt={asset.alt_text || ""} loading="lazy" />
              )}
            </div>

            <div className={styles.body}>
              <p className={styles.filename} title={asset.public_id}>
                {asset.original_filename || asset.public_id.split("/").pop()}
              </p>
              <p className={styles.meta}>
                {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ""}
                {formatBytes(asset.bytes)}
                {asset.format ? ` · ${asset.format}` : ""}
              </p>

              <AltTextForm asset={asset} />

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => copy(asset.secure_url, asset.id)}
                >
                  {copied === asset.id ? "Copied" : "Copy URL"}
                </button>
                <DeleteButton asset={asset} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
