"use client";

import { useActionState } from "react";
import { updateLegalPage } from "@/lib/actions/legal";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function LegalPageForm({ page }) {
  const [state, formAction, pending] = useActionState(updateLegalPage, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="slug" value={page.slug} />
      <label>
        Title
        <input type="text" name="title" defaultValue={page.title} required />
      </label>
      <label>
        Content
        <textarea name="content" defaultValue={page.content || ""} rows={10} />
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
