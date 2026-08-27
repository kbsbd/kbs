"use client";

import { useActionState } from "react";
import { updateIntegrationSettings } from "@/lib/actions/settings";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function IntegrationsForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateIntegrationSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label>
        Meta Pixel ID
        <input
          type="text"
          name="meta_pixel_id"
          defaultValue={settings.meta_pixel_id || ""}
          placeholder="e.g. 1112166228910159"
        />
      </label>
      <label>
        Google Analytics Measurement ID
        <input
          type="text"
          name="ga_measurement_id"
          defaultValue={settings.ga_measurement_id || ""}
          placeholder="e.g. G-XXXXXXXXXX"
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
