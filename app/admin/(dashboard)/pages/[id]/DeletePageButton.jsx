"use client";

import { useActionState } from "react";
import { deletePage } from "@/lib/actions/pages";
import styles from "../../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function DeletePageButton({ id, title }) {
  const [state, formAction, pending] = useActionState(deletePage, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Delete “${title}” and everything on it?\n\nThis cannot be undone. Visitors who follow a link to it will get a “page not found”.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.dangerButton} disabled={pending}>
        {pending ? "Deleting…" : "Delete page"}
      </button>
      {state.message && !state.ok && <p className={styles.error}>{state.message}</p>}
    </form>
  );
}
