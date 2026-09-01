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
        maxDimension={400}
        hint="Leave empty to show the site name as a text wordmark instead. A transparent PNG or SVG works best. Big files are shrunk to 400px on upload — the header shows it about 38px tall, so anything larger is wasted."
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
        maxDimension={256}
        hint="A square PNG or ICO. Anything larger is shrunk to 256px, which covers every browser size."
      />

      <MediaPicker
        name="apple_icon_url"
        label="Apple touch icon"
        defaultValue={settings.apple_icon_url || ""}
        folder="kbs/brand"
        maxDimension={180}
        hint="Shown when someone saves the site to an iPhone home screen. Square — shrunk to 180×180, which is the size iOS asks for."
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
