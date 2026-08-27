"use client";

import { useActionState } from "react";
import { updateHeroSettings } from "@/lib/actions/settings";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function HeroForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateHeroSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label>
        Hero video URL (Cloudinary)
        <input
          type="url"
          name="hero_video_url"
          defaultValue={settings.hero_video_url || ""}
          placeholder="https://res.cloudinary.com/your-cloud/video/upload/..."
        />
      </label>
      <label>
        Poster / fallback image URL
        <input
          type="url"
          name="hero_poster_url"
          defaultValue={settings.hero_poster_url || ""}
          placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
        />
      </label>
      <label>
        Headline (optional)
        <input type="text" name="hero_headline" defaultValue={settings.hero_headline || ""} />
      </label>
      <label>
        Subheadline (optional)
        <input
          type="text"
          name="hero_subheadline"
          defaultValue={settings.hero_subheadline || ""}
        />
      </label>

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
