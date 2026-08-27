"use client";

import { useActionState } from "react";
import { addFooterLink, deleteFooterLink } from "@/lib/actions/footer";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

function DeleteButton({ id }) {
  const [, formAction, pending] = useActionState(deleteFooterLink, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.dangerButton} disabled={pending}>
        Remove
      </button>
    </form>
  );
}

export default function FooterLinksManager({ links }) {
  const [state, formAction, pending] = useActionState(addFooterLink, initialState);

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Label</th>
            <th>Link</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id || link.label}>
              <td>{link.label}</td>
              <td style={{ wordBreak: "break-all" }}>{link.href}</td>
              <td>{link.id && <DeleteButton id={link.id} />}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form action={formAction} className={styles.form} style={{ marginTop: "1.25rem" }}>
        <div className={styles.grid2}>
          <label>
            Label
            <input type="text" name="label" required />
          </label>
          <label>
            Link
            <input type="text" name="href" required placeholder="/gallery or https://..." />
          </label>
        </div>
        {state.message && (
          <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
        )}
        <button type="submit" className={styles.secondaryButton} disabled={pending}>
          {pending ? "Adding…" : "Add link"}
        </button>
      </form>
    </>
  );
}
