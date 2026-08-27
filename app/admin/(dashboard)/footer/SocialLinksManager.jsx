"use client";

import { useActionState } from "react";
import { addSocialLink, deleteSocialLink } from "@/lib/actions/footer";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

function DeleteButton({ id }) {
  const [, formAction, pending] = useActionState(deleteSocialLink, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.dangerButton} disabled={pending}>
        Remove
      </button>
    </form>
  );
}

export default function SocialLinksManager({ links }) {
  const [state, formAction, pending] = useActionState(addSocialLink, initialState);

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Platform</th>
            <th>URL</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id || link.platform}>
              <td>{link.platform}</td>
              <td style={{ wordBreak: "break-all" }}>{link.url}</td>
              <td>{link.id && <DeleteButton id={link.id} />}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form action={formAction} className={styles.form} style={{ marginTop: "1.25rem" }}>
        <div className={styles.grid2}>
          <label>
            Platform
            <select name="platform" required defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
            </select>
          </label>
          <label>
            URL
            <input type="url" name="url" required placeholder="https://..." />
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
