"use client";

import { useActionState } from "react";
import { updateFooterSettings } from "@/lib/actions/site";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function FooterSettingsForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateFooterSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label>
        Newsletter heading
        <input
          type="text"
          name="newsletter_heading"
          defaultValue={settings.newsletter_heading || ""}
          placeholder="Never miss an update"
        />
      </label>

      <label>
        Footer address line
        <textarea name="footer_address" rows={2} defaultValue={settings.footer_address || ""} />
      </label>

      <label>
        Copyright line
        <input
          type="text"
          name="footer_copyright"
          defaultValue={settings.footer_copyright || ""}
          placeholder="Copyright © {year} KBS, all rights reserved."
        />
        <span className={styles.fieldHint}>
          Leave empty for the default. Write <code>{"{year}"}</code> anywhere in the text and it is
          replaced with the current year, so it stays correct every January.
        </span>
      </label>

      <p className={styles.fieldHint}>
        The footer’s link list and social icons are managed separately under Footer &amp; Social.
      </p>

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
