"use client";

import { useActionState } from "react";
import { updateHeroSettings } from "@/lib/actions/settings";
import MediaPicker from "@/components/admin/MediaPicker";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

/* Both media fields moved to MediaPicker in the Phase 2 pass, so the hero
   video and its poster can be uploaded rather than pasted. Pasting a URL still
   works — MediaPicker renders a real text input underneath. */
export default function HeroForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateHeroSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <MediaPicker
        name="hero_video_url"
        label="Hero video"
        accept="video"
        defaultValue={settings.hero_video_url || ""}
        folder="kbs/hero"
        hint="Plays muted on a loop behind the search bar. Keep it under a few MB — it loads on every visit to the homepage."
      />

      <MediaPicker
        name="hero_poster_url"
        label="Poster / fallback image"
        defaultValue={settings.hero_poster_url || ""}
        folder="kbs/hero"
        hint="Shown while the video loads, and instead of it if autoplay is blocked. Use a still from the video so the swap isn't jarring."
      />

      <label>
        Headline (optional)
        <input type="text" name="hero_headline" defaultValue={settings.hero_headline || ""} />
        <span className={styles.fieldHint}>
          Leave both text fields empty to show the video with no overlaid copy.
        </span>
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
