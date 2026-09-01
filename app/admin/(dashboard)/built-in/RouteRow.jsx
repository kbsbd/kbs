"use client";

import { useActionState } from "react";
import { updateRouteSetting } from "@/lib/actions/routes";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function RouteRow({ route }) {
  const [state, formAction, pending] = useActionState(updateRouteSetting, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="path" value={route.path} />
      <input type="hidden" name="label" value={route.label} />

      <div className={styles.routeHead}>
        <div>
          <h2 className={styles.cardTitle} style={{ marginBottom: "0.2rem" }}>
            {route.label}
          </h2>
          <code className={styles.routePath}>{route.path}</code>
        </div>
        {route.noindex && <span className={styles.badgeWarn}>Hidden from search</span>}
      </div>

      <div className={styles.grid2}>
        <label className={styles.inlineCheck}>
          <input type="checkbox" name="noindex" defaultChecked={route.noindex} />
          <span>
            Hide from search
            <span className={styles.fieldHint}>
              Tells Google not to list this page. The page still works normally.
            </span>
          </span>
        </label>

        <label className={styles.inlineCheck}>
          {/* Hidden partner so an unticked box submits "off" rather than
              nothing — otherwise unticking would leave the old value. */}
          <input type="hidden" name="in_sitemap" value="off" />
          <input type="checkbox" name="in_sitemap" defaultChecked={route.in_sitemap} />
          <span>
            List in sitemap.xml
            <span className={styles.fieldHint}>
              Usually turned off together with the box on the left.
            </span>
          </span>
        </label>
      </div>

      <label>
        Search result title
        <input
          type="text"
          name="meta_title"
          defaultValue={route.meta_title || ""}
          placeholder="Leave empty to keep the page's own title"
        />
      </label>

      <label>
        Search result description
        <textarea
          name="meta_description"
          rows={2}
          defaultValue={route.meta_description || ""}
          maxLength={320}
          placeholder="Leave empty to keep the page's own description"
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
