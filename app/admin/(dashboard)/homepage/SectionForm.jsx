"use client";

import { useActionState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import styles from "../../admin.module.css";

/*
 * A small settings form built from a field list.
 *
 * The homepage screen has four near-identical cards (heading / blurb / button
 * label / button link), so describing them as data beats writing four
 * components that drift apart.
 *
 * Server Actions are passed in as props, which works because an action is a
 * serialisable reference rather than a closure.
 */

const initialState = { ok: false, message: "" };

export default function SectionForm({ action, fields, submitLabel = "Save" }) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {fields.map((field) => {
        if (field.type === "media") {
          return (
            <MediaPicker
              key={field.name}
              name={field.name}
              label={field.label}
              defaultValue={field.value || ""}
              accept={field.accept || "image"}
              folder={field.folder || "kbs"}
              hint={field.hint}
              {...(field.maxDimension ? { maxDimension: field.maxDimension } : {})}
            />
          );
        }

        if (field.type === "textarea") {
          return (
            <label key={field.name}>
              {field.label}
              <textarea
                name={field.name}
                rows={field.rows || 2}
                defaultValue={field.value || ""}
                placeholder={field.placeholder}
              />
              {field.hint && <span className={styles.fieldHint}>{field.hint}</span>}
            </label>
          );
        }

        return (
          <label key={field.name}>
            {field.label}
            <input
              type="text"
              name={field.name}
              defaultValue={field.value || ""}
              placeholder={field.placeholder}
            />
            {field.hint && <span className={styles.fieldHint}>{field.hint}</span>}
          </label>
        );
      })}

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
