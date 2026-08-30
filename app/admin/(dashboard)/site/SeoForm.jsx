"use client";

import { useActionState } from "react";
import { updateSeoSettings } from "@/lib/actions/site";
import MediaPicker from "@/components/admin/MediaPicker";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function SeoForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateSeoSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label>
        Homepage title
        <input
          type="text"
          name="meta_title"
          defaultValue={settings.meta_title || ""}
          placeholder={`${settings.site_name || "KBS"} – ${settings.site_tagline || "…"}`}
        />
        <span className={styles.fieldHint}>
          Leave empty to use “Site name – Tagline”. Other pages append “| {settings.site_name || "KBS"}”
          to their own titles automatically.
        </span>
      </label>

      <label>
        Meta description
        <textarea
          name="meta_description"
          rows={3}
          defaultValue={settings.meta_description || ""}
          maxLength={320}
        />
        <span className={styles.fieldHint}>
          The grey text under the link in Google results. Around 150–160 characters reads best.
        </span>
      </label>

      <MediaPicker
        name="og_image_url"
        label="Share image"
        defaultValue={settings.og_image_url || ""}
        folder="kbs/brand"
        hint="Shown when the site is shared on Facebook, WhatsApp or LinkedIn. 1200×630 is the standard size."
      />

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
