"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Block } from "@/lib/cms";
import {
  savePage,
  deletePage,
  saveMenuItem,
  deleteMenuItem,
  reorderMenu,
} from "@/app/[locale]/admin/cms-actions";

export type AdminPage = {
  id: string;
  slug: string;
  title: string;
  title_bn: string;
  seo_description: string;
  status: "draft" | "published";
  blocks: Block[];
};
export type AdminMenuItem = {
  id: string;
  label: string;
  label_bn: string;
  href: string;
  sort: number;
  visible: boolean;
};

const field =
  "w-full rounded-lg border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]";
const lbl = "font-mono-label text-[color:var(--text-quiet)]";

export default function CmsAdmin({
  pages,
  menu,
  notify,
}: {
  pages: AdminPage[];
  menu: AdminMenuItem[];
  notify: (s: string) => void;
}) {
  const [sub, setSub] = useState<"Pages" | "Menu">("Pages");
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["Pages", "Menu"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              sub === s ? "bg-[color:var(--accent)] text-[#07101a]" : "text-[color:var(--text-secondary)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {sub === "Pages" ? (
        <PagesPanel pages={pages} notify={notify} />
      ) : (
        <MenuPanel menu={menu} notify={notify} />
      )}
    </div>
  );
}

/* ================= Pages ================= */

type PageDraft = Omit<AdminPage, "id"> & { id?: string };

const EMPTY_PAGE = (): PageDraft => ({
  slug: "",
  title: "",
  title_bn: "",
  seo_description: "",
  status: "draft",
  blocks: [],
});

const NEW_BLOCK: Record<Block["type"], () => Block> = {
  heading: () => ({ type: "heading", text: "" }),
  richtext: () => ({ type: "richtext", text: "" }),
  image: () => ({ type: "image", url: "", alt: "" }),
  button: () => ({ type: "button", label: "", href: "" }),
};

function PagesPanel({ pages, notify }: { pages: AdminPage[]; notify: (s: string) => void }) {
  const [draft, setDraft] = useState<PageDraft | null>(null);
  const [pending, start] = useTransition();

  function setBlock(i: number, patch: Partial<Block>) {
    if (!draft) return;
    setDraft({
      ...draft,
      blocks: draft.blocks.map((b, j) => (j === i ? ({ ...b, ...patch } as Block) : b)),
    });
  }
  function moveBlock(i: number, dir: -1 | 1) {
    if (!draft) return;
    const j = i + dir;
    if (j < 0 || j >= draft.blocks.length) return;
    const b = [...draft.blocks];
    [b[i], b[j]] = [b[j], b[i]];
    setDraft({ ...draft, blocks: b });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Extra pages, served at <code>/en/p/&lt;slug&gt;</code>. Add a Menu item to link one.
        </p>
        <button className="btn btn-primary ml-auto text-sm" onClick={() => setDraft(EMPTY_PAGE())}>
          New page
        </button>
      </div>

      {draft && (
        <div className="max-w-3xl space-y-4 rounded-2xl border border-[color:var(--accent)] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={lbl}>Title</span>
              <input
                className={`${field} mt-1`}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label className="block">
              <span className={lbl}>URL slug — blank = from title</span>
              <input
                className={`${field} mt-1`}
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </label>
          </div>
          <label className="block">
            <span className={lbl}>SEO description</span>
            <input
              className={`${field} mt-1`}
              value={draft.seo_description}
              onChange={(e) => setDraft({ ...draft, seo_description: e.target.value })}
            />
          </label>

          <div className="space-y-3">
            <p className={lbl}>Content blocks</p>
            {draft.blocks.map((b, i) => (
              <div key={i} className="rounded-xl border border-[color:var(--panel-edge)] p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-[color:var(--text-quiet)]">
                  <span className="uppercase">{b.type}</span>
                  <button className="ml-auto" onClick={() => moveBlock(i, -1)} aria-label="Up">
                    ↑
                  </button>
                  <button onClick={() => moveBlock(i, 1)} aria-label="Down">
                    ↓
                  </button>
                  <button
                    className="text-[color:var(--clay)]"
                    onClick={() =>
                      setDraft({ ...draft, blocks: draft.blocks.filter((_, j) => j !== i) })
                    }
                  >
                    Remove
                  </button>
                </div>

                {b.type === "heading" && (
                  <input
                    className={field}
                    placeholder="Heading"
                    value={b.text}
                    onChange={(e) => setBlock(i, { text: e.target.value })}
                  />
                )}
                {b.type === "richtext" && (
                  <textarea
                    className={`${field} resize-y`}
                    rows={4}
                    placeholder="Paragraph text — blank line starts a new paragraph"
                    value={b.text}
                    onChange={(e) => setBlock(i, { text: e.target.value })}
                  />
                )}
                {b.type === "image" && (
                  <div className="space-y-2">
                    <ImageUpload
                      label="Image"
                      value={b.url}
                      onChange={(url) => setBlock(i, { url })}
                    />
                    <input
                      className={field}
                      placeholder="Caption (optional)"
                      value={b.caption ?? ""}
                      onChange={(e) => setBlock(i, { caption: e.target.value })}
                    />
                  </div>
                )}
                {b.type === "button" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className={field}
                      placeholder="Button label"
                      value={b.label}
                      onChange={(e) => setBlock(i, { label: e.target.value })}
                    />
                    <input
                      className={field}
                      placeholder="Link (/en/shop, https://…)"
                      value={b.href}
                      onChange={(e) => setBlock(i, { href: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(NEW_BLOCK) as Block["type"][]).map((tp) => (
                <button
                  key={tp}
                  className="btn btn-ghost text-xs"
                  onClick={() => setDraft({ ...draft, blocks: [...draft.blocks, NEW_BLOCK[tp]()] })}
                >
                  + {tp}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="block">
              <span className={lbl}>Status</span>
              <select
                className={`${field} mt-1`}
                value={draft.status}
                onChange={(e) =>
                  setDraft({ ...draft, status: e.target.value as "draft" | "published" })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              className="btn btn-primary text-sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await savePage(draft);
                  notify(r.ok ? "Page saved." : r.error);
                  if (r.ok) setDraft(null);
                })
              }
            >
              {pending ? "Saving" : "Save page"}
            </button>
            <button className="btn btn-ghost text-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {pages.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-[color:var(--panel-edge)] px-4 py-3"
          >
            <span className="font-medium">{p.title}</span>
            <code className="text-xs text-[color:var(--text-quiet)]">/p/{p.slug}</code>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                p.status === "published"
                  ? "bg-[color:var(--accent-muted)] text-[color:var(--accent)]"
                  : "text-[color:var(--text-quiet)]"
              }`}
            >
              {p.status}
            </span>
            <div className="ml-auto flex gap-3 text-sm">
              <button className="hover:text-[color:var(--accent)]" onClick={() => setDraft(p)}>
                Edit
              </button>
              <button
                className="text-[color:var(--clay)] hover:underline"
                onClick={() =>
                  start(async () => {
                    if (!confirm(`Delete "${p.title}"?`)) return;
                    const r = await deletePage(p.id);
                    notify(r.ok ? "Deleted." : r.error);
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <p className="text-sm text-[color:var(--text-quiet)]">No pages yet.</p>
        )}
      </div>
    </div>
  );
}

/* ================= Menu ================= */

function MenuPanel({ menu, notify }: { menu: AdminMenuItem[]; notify: (s: string) => void }) {
  const [items, setItems] = useState(menu);
  const [draft, setDraft] = useState<Partial<AdminMenuItem> | null>(null);
  const [pending, start] = useTransition();

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    start(async () => {
      const r = await reorderMenu(next.map((x) => x.id));
      notify(r.ok ? "Reordered." : r.error);
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-[color:var(--text-secondary)]">
        When this list has any items it <b>replaces</b> the built-in menu. Links can be{" "}
        <code>/en/shop</code>, <code>/en/p/warranty</code>, <code>#faq</code> or a full URL.
        Empty = the default menu stays.
      </p>
      <button
        className="btn btn-primary text-sm"
        onClick={() => setDraft({ label: "", label_bn: "", href: "", sort: items.length, visible: true })}
      >
        New menu item
      </button>

      {draft && (
        <div className="space-y-3 rounded-xl border border-[color:var(--accent)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={field}
              placeholder="Label"
              value={draft.label ?? ""}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
            <input
              className={field}
              placeholder="Label (বাংলা) — optional"
              value={draft.label_bn ?? ""}
              onChange={(e) => setDraft({ ...draft, label_bn: e.target.value })}
            />
          </div>
          <input
            className={field}
            placeholder="Link"
            value={draft.href ?? ""}
            onChange={(e) => setDraft({ ...draft, href: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.visible ?? true}
              onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
            />
            Visible
          </label>
          <div className="flex gap-3">
            <button
              className="btn btn-primary text-sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await saveMenuItem({
                    id: draft.id,
                    label: draft.label ?? "",
                    label_bn: draft.label_bn ?? "",
                    href: draft.href ?? "",
                    sort: draft.sort ?? items.length,
                    visible: draft.visible ?? true,
                  });
                  notify(r.ok ? "Saved." : r.error);
                  if (r.ok) setDraft(null);
                })
              }
            >
              Save
            </button>
            <button className="btn btn-ghost text-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {items.map((m, i) => (
          <div
            key={m.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--panel-edge)] px-4 py-2.5"
          >
            <button onClick={() => move(i, -1)} aria-label="Up" className="text-[color:var(--text-quiet)]">
              ↑
            </button>
            <button onClick={() => move(i, 1)} aria-label="Down" className="text-[color:var(--text-quiet)]">
              ↓
            </button>
            <span>{m.label}</span>
            <code className="text-xs text-[color:var(--text-quiet)]">{m.href}</code>
            {!m.visible && <span className="text-xs text-[color:var(--text-quiet)]">hidden</span>}
            <div className="ml-auto flex gap-3 text-sm">
              <button className="hover:text-[color:var(--accent)]" onClick={() => setDraft(m)}>
                Edit
              </button>
              <button
                className="text-[color:var(--clay)] hover:underline"
                onClick={() =>
                  start(async () => {
                    const r = await deleteMenuItem(m.id);
                    if (r.ok) setItems((x) => x.filter((y) => y.id !== m.id));
                    notify(r.ok ? "Deleted." : r.error);
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
