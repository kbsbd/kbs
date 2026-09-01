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
        resize={{ maxWidth: 600, maxHeight: 240 }}
        hint="Leave empty to show the site name as a text wordmark instead. An SVG scales to any screen and is ideal; a transparent PNG also works — large ones are automatically resized down (to ~600px, plenty for high-density displays) before upload."
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
        resize={{ maxWidth: 128, maxHeight: 128 }}
        hint="A square PNG or ICO. Upload any size — it's resized to 128×128 before upload."
      />

      <MediaPicker
        name="apple_icon_url"
        label="Apple touch icon"
        defaultValue={settings.apple_icon_url || ""}
        folder="kbs/brand"
        resize={{ maxWidth: 180, maxHeight: 180 }}
        hint="Shown when someone saves the site to an iPhone home screen. Square — it's resized to 180×180 before upload."
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
