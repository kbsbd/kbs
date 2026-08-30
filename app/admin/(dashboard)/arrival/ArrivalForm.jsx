"use client";

import { useActionState } from "react";
import { updateArrivalSettings } from "@/lib/actions/settings";
import MediaPicker from "@/components/admin/MediaPicker";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function ArrivalForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateArrivalSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label>
        Section heading
        <input
          type="text"
          name="arrival_heading"
          defaultValue={settings.arrival_heading || ""}
        />
        <span className={styles.fieldHint}>
          Types itself out one character at a time when the band scrolls into view.
        </span>
      </label>

      <label>
        YouTube URL or video ID
        <input
          type="text"
          name="arrival_youtube_id"
          defaultValue={settings.arrival_youtube_id || ""}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <span className={styles.fieldHint}>
          Paste the full URL — the ID is pulled out for you. Clearing this hides the whole band.
        </span>
      </label>

      {/* The poster frame was hardcoded in the component until migration 0006. */}
      <MediaPicker
        name="arrival_thumb_url"
        label="Poster image"
        defaultValue={settings.arrival_thumb_url || ""}
        folder="kbs/homepage"
        hint="The still shown before the video is opened. Wide — the original is 1920×800."
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
