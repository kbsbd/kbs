"use client";

import { useActionState, useState } from "react";
import MediaPicker from "./MediaPicker";
import styles from "./CrudManager.module.css";

/*
 * One list-with-inline-editing widget, shared by every simple table in the
 * dashboard (navigation, CTA buttons, footer links, social links).
 *
 * It exists because those four screens are the same screen: a list of rows,
 * an edit form per row, a delete button, optional reordering, and an "add new"
 * form. Writing them four times would mean four places to fix the next bug.
 *
 * Server Actions are passed in as props — that works because a Server Action
 * is a serialisable reference, not a closure, so a Server Component can hand
 * one to a Client Component.
 *
 * `fields` describes the form:
 *   { name, label, type, options?, placeholder?, required?, hint?, accept? }
 * type is one of: text | url | tel | number | select | checkbox | textarea |
 *                 color | media
 */

const initialState = { ok: false, message: "" };

function Field({ field, row }) {
  const value = row?.[field.name];
  const id = `${field.name}-${row?.id || "new"}`;

  if (field.type === "media") {
    return (
      <MediaPicker
        name={field.name}
        label={field.label}
        defaultValue={value || ""}
        accept={field.accept || "image"}
        folder={field.folder || "kbs"}
        hint={field.hint}
        required={field.required}
      />
    );
  }

  if (field.type === "checkbox") {
    /* A named hidden input before the checkbox means an *unticked* box still
       submits a value ("off"), so the action can tell "unticked" apart from
       "field absent". Without it, unticking a box would leave the old value
       in place on update. */
    return (
      <label className={styles.checkboxLabel} htmlFor={id}>
        <input type="hidden" name={field.name} value="off" />
        <input
          type="checkbox"
          id={id}
          name={field.name}
          defaultChecked={value === undefined ? field.defaultChecked : Boolean(value)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label htmlFor={id}>
        {field.label}
        <select id={id} name={field.name} defaultValue={value ?? field.defaultValue ?? ""}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label htmlFor={id}>
        {field.label}
        <textarea
          id={id}
          name={field.name}
          rows={field.rows || 4}
          defaultValue={value || ""}
          placeholder={field.placeholder}
          required={field.required}
        />
      </label>
    );
  }

  return (
    <label htmlFor={id}>
      {field.label}
      <input
        id={id}
        type={field.type === "color" ? "text" : field.type || "text"}
        name={field.name}
        defaultValue={value ?? field.defaultValue ?? ""}
        placeholder={field.placeholder}
        required={field.required}
      />
      {field.hint && <span className={styles.hint}>{field.hint}</span>}
    </label>
  );
}

function EditForm({ fields, row, action, onDone }) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={row.id} />
      <div className={styles.fieldGrid}>
        {fields.map((field) => (
          <Field key={field.name} field={field} row={row} />
        ))}
      </div>

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryButton} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" className={styles.ghostButton} onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function CreateForm({ fields, action, addLabel }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className={styles.primaryButton} onClick={() => setOpen(true)}>
        {addLabel}
      </button>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.fieldGrid}>
        {fields.map((field) => (
          <Field key={field.name} field={field} row={undefined} />
        ))}
      </div>

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryButton} disabled={pending}>
          {pending ? "Adding…" : addLabel}
        </button>
        <button type="button" className={styles.ghostButton} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteForm({ id, action, confirmLabel }) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Native confirm() is the right tool here: it is synchronous, so it can
        // actually cancel the submit, and this is a single-admin dashboard
        // where a custom modal would be ceremony for no gain.
        if (!window.confirm(confirmLabel)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.dangerButton} disabled={pending} title={state.message}>
        {pending ? "…" : "Delete"}
      </button>
    </form>
  );
}

function MoveForm({ id, direction, action, disabled }) {
  const [, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        className={styles.moveButton}
        disabled={pending || disabled}
        aria-label={direction === "up" ? "Move up" : "Move down"}
        title={direction === "up" ? "Move up" : "Move down"}
      >
        {direction === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

export default function CrudManager({
  rows = [],
  fields,
  createAction,
  updateAction,
  deleteAction,
  moveAction,
  addLabel = "Add",
  emptyLabel = "Nothing here yet.",
  primaryKey = "label",
  secondaryKey = "href",
  confirmLabel = "Delete this permanently?",
  renderMeta,
}) {
  const [editingId, setEditingId] = useState(null);

  return (
    <div className={styles.wrap}>
      {rows.length === 0 && <p className={styles.empty}>{emptyLabel}</p>}

      <ul className={styles.list}>
        {rows.map((row, index) => {
          const isEditing = editingId === row.id;
          const inactive = row.is_active === false;

          return (
            <li key={row.id || row[primaryKey]} className={styles.item} data-inactive={inactive || undefined}>
              <div className={styles.itemHead}>
                <div className={styles.itemText}>
                  <strong>
                    {row[primaryKey]}
                    {inactive && <span className={styles.badge}>hidden</span>}
                  </strong>
                  <span className={styles.itemSub}>{row[secondaryKey]}</span>
                  {renderMeta && <span className={styles.itemMeta}>{renderMeta(row)}</span>}
                </div>

                <div className={styles.itemActions}>
                  {moveAction && row.id && (
                    <>
                      <MoveForm
                        id={row.id}
                        direction="up"
                        action={moveAction}
                        disabled={index === 0}
                      />
                      <MoveForm
                        id={row.id}
                        direction="down"
                        action={moveAction}
                        disabled={index === rows.length - 1}
                      />
                    </>
                  )}

                  {row.id ? (
                    <>
                      <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={() => setEditingId(isEditing ? null : row.id)}
                      >
                        {isEditing ? "Close" : "Edit"}
                      </button>
                      <DeleteForm id={row.id} action={deleteAction} confirmLabel={confirmLabel} />
                    </>
                  ) : (
                    /* Rows without an id come from the bundled fallback data,
                       not the database — there is nothing to edit or delete
                       until the migration has been run and the table seeded. */
                    <span className={styles.hint}>default</span>
                  )}
                </div>
              </div>

              {isEditing && (
                <EditForm
                  fields={fields}
                  row={row}
                  action={updateAction}
                  onDone={() => setEditingId(null)}
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className={styles.createArea}>
        <CreateForm fields={fields} action={createAction} addLabel={addLabel} />
      </div>
    </div>
  );
}
