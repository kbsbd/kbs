"use client";

import { useActionState } from "react";
import { updateBrandingSettings } from "@/lib/actions/site";
import MediaPicker from "@/components/admin/MediaPicker";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function BrandingForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateBrandingSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.grid2}>
        <label>
          Site name
          <input
            type="text"
            name="site_name"
            defaultValue={settings.site_name || ""}
            placeholder="KBS"
          />
        </label>
        <label>
          Tagline
          <input
            type="text"
            name="site_tagline"
            defaultValue={settings.site_tagline || ""}
            placeholder="A Leading Real Estate Developer in Bangladesh"
          />
        </label>
      </div>

      <MediaPicker
        name="logo_url"
        label="Header logo"
        defaultValue={settings.logo_url || ""}
        folder="kbs/brand"
        hint="Leave empty to show the site name as a text wordmark instead. A transparent PNG or SVG about 240px wide works best."
      />

      <label>
        Logo alt text
        <input
          type="text"
          name="logo_alt"
          defaultValue={settings.logo_alt || ""}
          placeholder="Defaults to the site name"
        />
      </label>

      <MediaPicker
        name="favicon_url"
        label="Favicon (browser tab icon)"
        defaultValue={settings.favicon_url || ""}
        folder="kbs/brand"
        hint="A square PNG or ICO, ideally 32×32 or 64×64."
      />

      <MediaPicker
        name="apple_icon_url"
        label="Apple touch icon"
        defaultValue={settings.apple_icon_url || ""}
        folder="kbs/brand"
        hint="Shown when someone saves the site to an iPhone home screen. Square, 180×180."
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
