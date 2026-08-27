"use client";

import { useActionState } from "react";
import { updateArrivalSettings } from "@/lib/actions/settings";
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
      </label>
      <label>
        YouTube URL or video ID
        <input
          type="text"
          name="arrival_youtube_id"
          defaultValue={settings.arrival_youtube_id || ""}
          placeholder="https://www.youtube.com/watch?v=..."
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
