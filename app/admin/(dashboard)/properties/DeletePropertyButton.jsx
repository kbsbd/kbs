"use client";

import { useActionState } from "react";
import { deleteProperty } from "@/lib/actions/properties";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function DeletePropertyButton({ id }) {
  const [, formAction, pending] = useActionState(deleteProperty, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Delete this property?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.dangerButton} disabled={pending}>
        Delete
      </button>
    </form>
  );
}
