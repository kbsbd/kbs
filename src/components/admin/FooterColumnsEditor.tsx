"use client";

import { useState, useTransition } from "react";
import { saveContent } from "@/app/[locale]/admin/actions";

type L = { en: string; bn: string };
type Row = { id: string; label: L; href: string };
export type FooterColumn = { id: string; heading: L; rows: Row[] };
type Column = FooterColumn;

const rid = () => Math.random().toString(36).slice(2, 9);
const emptyL = (): L => ({ en: "", bn: "" });
const field =
  "w-full rounded-lg border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]";
const lbl = "font-mono-label text-[color:var(--text-quiet)]";

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = list.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function BiRow({ value, onChange }: { value: L; onChange: (v: L) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        className={field}
        placeholder="English"
        value={value.en}
        onChange={(e) => onChange({ ...value, en: e.target.value })}
      />
      <input
        className={field}
        placeholder="বাংলা"
        value={value.bn}
        onChange={(e) => onChange({ ...value, bn: e.target.value })}
      />
    </div>
  );
}

export default function FooterColumnsEditor({
  initial,
  notify,
}: {
  initial: Column[];
  notify: (s: string) => void;
}) {
  const [cols, setCols] = useState<Column[]>(() =>
    JSON.parse(JSON.stringify(initial ?? []))
  );
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  const mutate = (next: Column[]) => {
    setCols(next);
    setDirty(true);
  };

  const patchCol = (ci: number, patch: Partial<Column>) =>
    mutate(cols.map((c, i) => (i === ci ? { ...c, ...patch } : c)));

  const patchRow = (ci: number, ri: number, patch: Partial<Row>) =>
    patchCol(ci, {
      rows: cols[ci].rows.map((r, i) => (i === ri ? { ...r, ...patch } : r)),
    });

  const save = () =>
    start(async () => {
      const clean = cols
        .map((c) => ({ ...c, rows: c.rows.filter((r) => r.label.en || r.label.bn) }))
        .filter((c) => (c.heading.en || c.heading.bn) && c.rows.length);
      const r = await saveContent([{ root: "footer", path: "columns", value: clean }]);
      if (r.ok) {
        setDirty(false);
        notify("Footer columns saved. The public site is already showing it.");
      } else notify(r.error);
    });

  return (
    <section className="space-y-4 border-t border-[color:var(--panel-edge)] pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-lg">Footer columns</h3>
        <span className="text-xs text-[color:var(--text-quiet)]">
          Shown after the contact and office columns. A row with no link is plain text.
        </span>
        <button
          className="btn btn-primary ml-auto text-sm"
          onClick={save}
          disabled={!dirty || pending}
        >
          {pending ? "Saving" : dirty ? "Save footer columns" : "Saved"}
        </button>
      </div>

      {cols.map((col, ci) => (
        <div key={col.id} className="space-y-3 rounded-xl border border-[color:var(--panel-edge)] p-4">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {col.heading.en || `Column ${ci + 1}`}
            </span>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-[color:var(--text-quiet)]">
              <button className="rounded px-1.5 py-0.5 disabled:opacity-30" disabled={ci === 0} onClick={() => mutate(move(cols, ci, -1))} aria-label="Move column up">↑</button>
              <button className="rounded px-1.5 py-0.5 disabled:opacity-30" disabled={ci === cols.length - 1} onClick={() => mutate(move(cols, ci, 1))} aria-label="Move column down">↓</button>
              <button className="rounded px-1.5 py-0.5 text-[color:var(--clay)] hover:underline" onClick={() => mutate(cols.filter((_, i) => i !== ci))}>Delete column</button>
            </div>
          </div>

          <div>
            <span className={lbl}>Column heading</span>
            <div className="mt-1">
              <BiRow value={col.heading} onChange={(v) => patchCol(ci, { heading: v })} />
            </div>
          </div>

          <div className="space-y-2">
            {col.rows.map((row, ri) => (
              <div key={row.id} className="rounded-lg border border-[color:var(--panel-edge)] p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-[color:var(--text-quiet)]">
                  <span className="mr-auto">Row {ri + 1}</span>
                  <button className="rounded px-1.5 py-0.5 disabled:opacity-30" disabled={ri === 0} onClick={() => patchCol(ci, { rows: move(col.rows, ri, -1) })} aria-label="Move row up">↑</button>
                  <button className="rounded px-1.5 py-0.5 disabled:opacity-30" disabled={ri === col.rows.length - 1} onClick={() => patchCol(ci, { rows: move(col.rows, ri, 1) })} aria-label="Move row down">↓</button>
                  <button className="rounded px-1.5 py-0.5 text-[color:var(--clay)] hover:underline" onClick={() => patchCol(ci, { rows: col.rows.filter((_, i) => i !== ri) })}>Delete</button>
                </div>
                <BiRow value={row.label} onChange={(v) => patchRow(ci, ri, { label: v })} />
                <input
                  className={`${field} mt-2`}
                  placeholder="Link (optional) — /contact, https://…, tel:+880…"
                  value={row.href}
                  onChange={(e) => patchRow(ci, ri, { href: e.target.value })}
                />
              </div>
            ))}
            <button
              className="btn btn-ghost text-xs"
              onClick={() => patchCol(ci, { rows: [...col.rows, { id: rid(), label: emptyL(), href: "" }] })}
            >
              Add row
            </button>
          </div>
        </div>
      ))}

      <button
        className="btn btn-ghost text-sm"
        onClick={() => mutate([...cols, { id: rid(), heading: emptyL(), rows: [] }])}
      >
        Add column
      </button>
    </section>
  );
}
