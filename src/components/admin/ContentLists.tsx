"use client";

import { useState, useTransition } from "react";
import { saveContent } from "@/app/[locale]/admin/actions";

/**
 * Add / edit / delete for the repeatable lists in the site content — hero
 * caption bands, menu links, FAQ entries, amenities, services and so on.
 *
 * Every list is saved as a whole array back to its content key (the content
 * merge replaces arrays wholesale), so what you see here is the already-merged
 * array and a save writes all of it.
 */

type L = { en: string; bn: string };
const rid = () => Math.random().toString(36).slice(2, 9);
const emptyL = (): L => ({ en: "", bn: "" });
const isL = (v: unknown): v is L =>
  !!v && typeof v === "object" && "en" in (v as object) && "bn" in (v as object);

const field =
  "w-full rounded-lg border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3 py-2 text-sm outline-none transition-colors duration-300 focus:border-[color:var(--accent)]";
const lbl = "font-mono-label text-[color:var(--text-quiet)]";

type FieldSpec = {
  key: string;
  label: string;
  type: "bi" | "text" | "number" | "select";
  options?: string[];
  step?: number;
  placeholder?: string;
};

export type ListSpec = {
  root: string;
  /** dotted path to the array inside the key; "" means the key itself is the array */
  path: string;
  label: string;
  hint?: string;
  /** "scalar" — each item is one {en,bn}; "object" — each item has `fields` */
  shape: "scalar" | "object";
  fields?: FieldSpec[];
  /** field whose English value titles the row */
  summaryKey?: string;
  blank: () => Record<string, unknown> | L;
};

export const CONTENT_LISTS: Record<string, ListSpec[]> = {
  heroBands: [
    {
      root: "heroBands",
      path: "",
      label: "Hero caption bands",
      hint: "The captions that fade past as a visitor scrolls the landing hero. “Starts / ends” place each one along the scroll (0 = top, 1 = the end of the hero).",
      shape: "object",
      summaryKey: "head",
      fields: [
        { key: "kicker", label: "Small label above (optional)", type: "bi" },
        { key: "head", label: "Heading", type: "bi" },
        { key: "sub", label: "Sub-line (optional)", type: "bi" },
        { key: "cta", label: "Button text (optional)", type: "bi" },
        { key: "lane", label: "Text position", type: "select", options: ["left", "center", "right"] },
        {
          key: "entrance",
          label: "Entrance animation",
          type: "select",
          options: ["drift-down", "halves-parting", "grid-snap", "word-punch", "approach-depth", "staged-settle"],
        },
        { key: "scrim", label: "Backdrop darkness (0.4–0.9)", type: "number", step: 0.02 },
        { key: "from", label: "Starts at (0–1)", type: "number", step: 0.01 },
        { key: "to", label: "Ends at (0–1)", type: "number", step: 0.01 },
      ],
      blank: () => ({
        id: rid(),
        from: 0.4,
        to: 0.55,
        entrance: "drift-down",
        lane: "left",
        scrim: 0.7,
        head: emptyL(),
        sub: emptyL(),
      }),
    },
  ],
  nav: [
    {
      root: "nav",
      path: "links",
      label: "Menu links",
      hint: "The header navigation. Use /page for a page, or #section for a spot on the home page.",
      shape: "object",
      summaryKey: "label",
      fields: [
        { key: "label", label: "Label", type: "bi" },
        { key: "href", label: "Link", type: "text", placeholder: "/services or #book" },
      ],
      blank: () => ({ href: "/", label: emptyL() }),
    },
  ],
  faq: [
    {
      root: "faq",
      path: "items",
      label: "Questions & answers",
      shape: "object",
      summaryKey: "q",
      fields: [
        { key: "q", label: "Question", type: "bi" },
        { key: "a", label: "Answer", type: "bi" },
      ],
      blank: () => ({ id: rid(), q: emptyL(), a: emptyL() }),
    },
  ],
  trust: [
    {
      root: "trust",
      path: "items",
      label: "Documents to ask for",
      hint: "The checklist of papers a buyer should ask any developer for.",
      shape: "scalar",
      blank: () => emptyL(),
    },
  ],
  amenities: [
    {
      root: "amenities",
      path: "items",
      label: "Amenities with a photo",
      hint: "The photo for each is set on the Media tab.",
      shape: "object",
      summaryKey: "title",
      fields: [
        { key: "title", label: "Name", type: "bi" },
        { key: "body", label: "Description", type: "bi" },
      ],
      blank: () => ({ id: rid(), image: "", title: emptyL(), body: emptyL() }),
    },
    {
      root: "amenities",
      path: "listed",
      label: "Amenities, text only",
      shape: "object",
      summaryKey: "label",
      fields: [{ key: "label", label: "Name", type: "bi" }],
      blank: () => ({ id: rid(), label: emptyL() }),
    },
  ],
  kbHomes: [
    { root: "kbHomes", path: "intro", label: "Intro paragraphs", shape: "scalar", blank: () => emptyL() },
    { root: "kbHomes", path: "highlights", label: "Highlights", shape: "scalar", blank: () => emptyL() },
  ],
  servicesPage: [
    { root: "servicesPage", path: "intro", label: "Intro paragraphs", shape: "scalar", blank: () => emptyL() },
    {
      root: "servicesPage",
      path: "items",
      label: "Services",
      hint: "The photo for each is set on the Media tab.",
      shape: "object",
      summaryKey: "title",
      fields: [
        { key: "title", label: "Name", type: "bi" },
        { key: "body", label: "Description", type: "bi" },
      ],
      blank: () => ({ id: rid(), image: "", title: emptyL(), body: emptyL() }),
    },
    {
      root: "servicesPage",
      path: "sisterConcerns",
      label: "Sister concerns",
      shape: "object",
      summaryKey: "name",
      fields: [
        { key: "name", label: "Name", type: "text" },
        { key: "note", label: "Note", type: "bi" },
      ],
      blank: () => ({ id: rid(), name: "", note: emptyL() }),
    },
  ],
};

type AnyItem = Record<string, unknown> | L;

function BiInput({
  value,
  onChange,
}: {
  value: L;
  onChange: (v: L) => void;
}) {
  const long = (value.en?.length ?? 0) > 70 || (value.bn?.length ?? 0) > 70;
  const Tag = long ? "textarea" : "input";
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Tag
        className={field}
        rows={long ? 3 : undefined}
        placeholder="English"
        value={value.en}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange({ ...value, en: e.target.value })
        }
      />
      <Tag
        className={field}
        rows={long ? 3 : undefined}
        placeholder="বাংলা"
        value={value.bn}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange({ ...value, bn: e.target.value })
        }
      />
    </div>
  );
}

export default function ListEditor({
  spec,
  initial,
  notify,
}: {
  spec: ListSpec;
  initial: AnyItem[];
  notify: (s: string) => void;
}) {
  const [items, setItems] = useState<AnyItem[]>(() =>
    JSON.parse(JSON.stringify(initial ?? []))
  );
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);

  const mutate = (next: AnyItem[]) => {
    setItems(next);
    setDirty(true);
  };

  const setItem = (i: number, patch: Record<string, unknown>) =>
    mutate(items.map((it, j) => (j === i ? { ...(it as object), ...patch } : it)));

  const setScalar = (i: number, v: L) => mutate(items.map((it, j) => (j === i ? v : it)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    mutate(next);
  };

  const remove = (i: number) => mutate(items.filter((_, j) => j !== i));

  const add = () => {
    let blank = spec.blank();
    // for a new hero band, slot it after the last one on the scroll
    if (spec.root === "heroBands" && items.length) {
      const last = items[items.length - 1] as Record<string, number>;
      const from = Math.min(0.9, (Number(last.to) || 0) + 0.02);
      blank = { ...(blank as object), from, to: Math.min(1, from + 0.13) };
    }
    mutate([...items, blank]);
  };

  const save = () => {
    start(async () => {
      const r = await saveContent([{ root: spec.root, path: spec.path, value: items }]);
      if (r.ok) {
        setDirty(false);
        notify(`${spec.label} saved.`);
      } else notify(r.error);
    });
  };

  const summary = (it: AnyItem, i: number) => {
    if (spec.shape === "scalar") return (it as L).en || `Item ${i + 1}`;
    const s = spec.summaryKey ? (it as Record<string, unknown>)[spec.summaryKey] : undefined;
    if (isL(s)) return s.en || `Item ${i + 1}`;
    if (typeof s === "string") return s || `Item ${i + 1}`;
    return `Item ${i + 1}`;
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[color:var(--panel-edge)] p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-lg">{spec.label}</h3>
        <span className="text-xs text-[color:var(--text-quiet)]">{items.length} item{items.length === 1 ? "" : "s"}</span>
        <button
          className="btn btn-primary ml-auto text-sm"
          onClick={save}
          disabled={!dirty || pending}
        >
          {pending ? "Saving" : dirty ? "Save list" : "Saved"}
        </button>
      </div>
      {spec.hint && (
        <p className="text-xs leading-relaxed text-[color:var(--text-quiet)]">{spec.hint}</p>
      )}

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-[color:var(--panel-edge)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="truncate text-sm font-medium">{summary(it, i)}</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-[color:var(--text-quiet)]">
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 hover:text-[color:var(--text-primary)] disabled:opacity-30"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 hover:text-[color:var(--text-primary)] disabled:opacity-30"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-[color:var(--clay)] hover:underline"
                  onClick={() => remove(i)}
                >
                  Delete
                </button>
              </div>
            </div>

            {spec.shape === "scalar" ? (
              <BiInput value={it as L} onChange={(v) => setScalar(i, v)} />
            ) : (
              <div className="space-y-3">
                {(spec.fields ?? []).map((f) => {
                  const raw = (it as Record<string, unknown>)[f.key];
                  if (f.type === "bi") {
                    return (
                      <div key={f.key}>
                        <span className={lbl}>{f.label}</span>
                        <div className="mt-1">
                          <BiInput
                            value={isL(raw) ? raw : emptyL()}
                            onChange={(v) => setItem(i, { [f.key]: v })}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (f.type === "select") {
                    return (
                      <label key={f.key} className="block">
                        <span className={lbl}>{f.label}</span>
                        <select
                          className={`${field} mt-1`}
                          value={String(raw ?? f.options?.[0] ?? "")}
                          onChange={(e) => setItem(i, { [f.key]: e.target.value })}
                        >
                          {(f.options ?? []).map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }
                  return (
                    <label key={f.key} className="block">
                      <span className={lbl}>{f.label}</span>
                      <input
                        className={`${field} mt-1`}
                        type={f.type === "number" ? "number" : "text"}
                        step={f.step}
                        placeholder={f.placeholder}
                        value={String(raw ?? "")}
                        onChange={(e) =>
                          setItem(i, {
                            [f.key]:
                              f.type === "number"
                                ? e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                                : e.target.value,
                          })
                        }
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[color:var(--text-quiet)]">Nothing here yet.</p>
        )}
      </div>

      <button className="btn btn-ghost text-sm" onClick={add}>
        Add {spec.label.toLowerCase().replace(/s$/, "")}
      </button>
    </section>
  );
}
