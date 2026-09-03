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
  placement: "header" | "footer";
  footerGroup: string;
  pageSlug: string;
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
        <MenuPanel menu={menu} pages={pages} notify={notify} />
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

type MenuDraft = {
  id?: string;
  source: "page" | "custom";
  pageSlug: string;
  label: string;
  label_bn: string;
  href: string;
  placement: "header" | "footer";
  footerGroup: string;
  visible: boolean;
  sort: number;
};

function MenuPanel({
  menu,
  pages,
  notify,
}: {
  menu: AdminMenuItem[];
  pages: AdminPage[];
  notify: (s: string) => void;
}) {
  /* `menu` is re-supplied by the server after every save / delete / reorder
     revalidates, so it is the single source of truth — no local mirror. */
  const items = menu;
  const [draft, setDraft] = useState<MenuDraft | null>(null);
  const [pending, start] = useTransition();

  const published = pages.filter((p) => p.status === "published");

  const toDraft = (m: AdminMenuItem): MenuDraft => ({
    id: m.id,
    source: m.pageSlug ? "page" : "custom",
    pageSlug: m.pageSlug,
    label: m.label,
    label_bn: m.label_bn,
    href: m.href,
    placement: m.placement,
    footerGroup: m.footerGroup,
    visible: m.visible,
    sort: m.sort,
  });

  function newDraft() {
    setDraft({
      source: published.length > 0 ? "page" : "custom",
      pageSlug: published[0]?.slug ?? "",
      label: published[0]?.title ?? "",
      label_bn: published[0]?.title_bn ?? "",
      href: published[0] ? `/p/${published[0].slug}` : "",
      placement: "header",
      footerGroup: "",
      visible: true,
      sort: items.length,
    });
  }

  function pickPage(slug: string) {
    const p = published.find((x) => x.slug === slug);
    if (!p || !draft) return;
    setDraft({
      ...draft,
      pageSlug: slug,
      label: p.title,
      label_bn: p.title_bn,
      href: `/p/${slug}`,
    });
  }

  async function save() {
    if (!draft) return;
    start(async () => {
      const r = await saveMenuItem({
        id: draft.id,
        label: draft.label,
        label_bn: draft.label_bn,
        href: draft.href,
        sort: draft.sort,
        visible: draft.visible,
        placement: draft.placement,
        footerGroup: draft.placement === "footer" ? draft.footerGroup : "",
        pageSlug: draft.source === "page" ? draft.pageSlug : "",
      });
      notify(r.ok ? "Menu updated." : r.error);
      if (r.ok) setDraft(null);
    });
  }

  function move(list: AdminMenuItem[], i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    start(async () => {
      const r = await reorderMenu(next.map((x) => x.id));
      notify(r.ok ? "Reordered." : r.error);
    });
  }

  const header = items.filter((m) => m.placement === "header").sort((a, b) => a.sort - b.sort);
  const footer = items.filter((m) => m.placement === "footer");
  const footerGroups = [...new Set(footer.map((m) => m.footerGroup))];

  const renderRow = (m: AdminMenuItem, list: AdminMenuItem[], i: number) => (
    <div
      key={m.id}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--panel-edge)] px-4 py-2.5"
    >
      <button onClick={() => move(list, i, -1)} aria-label="Up" className="text-[color:var(--text-quiet)] disabled:opacity-30" disabled={i === 0}>
        ↑
      </button>
      <button onClick={() => move(list, i, 1)} aria-label="Down" className="text-[color:var(--text-quiet)] disabled:opacity-30" disabled={i === list.length - 1}>
        ↓
      </button>
      <span className="font-medium">{m.label}</span>
      <code className="text-xs text-[color:var(--text-quiet)]">{m.href}</code>
      {m.pageSlug && <span className="text-[10px] uppercase text-[color:var(--text-quiet)]">page</span>}
      {!m.visible && <span className="text-xs text-[color:var(--text-quiet)]">hidden</span>}
      <div className="ml-auto flex gap-3 text-sm">
        <button className="hover:text-[color:var(--accent)]" onClick={() => setDraft(toDraft(m))}>
          Edit
        </button>
        <button
          className="text-[color:var(--clay)] hover:underline"
          onClick={() =>
            start(async () => {
              const r = await deleteMenuItem(m.id);
              notify(r.ok ? "Removed." : r.error);
            })
          }
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-[color:var(--text-secondary)]">
        Add links to the header navigation or the footer. Pick a published page and its
        title and link fill in automatically. Header links are added after the main menu
        (edit that on the Text tab); footer links are grouped into their own columns.
      </p>
      <button className="btn btn-primary text-sm" onClick={newDraft}>
        Add menu link
      </button>

      {draft && (
        <div className="space-y-3 rounded-xl border border-[color:var(--accent)] p-4">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={draft.source === "page"}
                disabled={published.length === 0}
                onChange={() => {
                  const p = published[0];
                  setDraft({
                    ...draft,
                    source: "page",
                    pageSlug: p?.slug ?? "",
                    label: p?.title ?? draft.label,
                    label_bn: p?.title_bn ?? draft.label_bn,
                    href: p ? `/p/${p.slug}` : draft.href,
                  });
                }}
              />
              A published page
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={draft.source === "custom"}
                onChange={() => setDraft({ ...draft, source: "custom", pageSlug: "" })}
              />
              A custom link
            </label>
          </div>

          {draft.source === "page" ? (
            <label className="block">
              <span className={lbl}>Page</span>
              {published.length === 0 ? (
                <p className="mt-1 text-sm text-[color:var(--text-quiet)]">
                  No published pages yet — publish one on the Pages tab first.
                </p>
              ) : (
                <select
                  className={`${field} mt-1`}
                  value={draft.pageSlug}
                  onChange={(e) => pickPage(e.target.value)}
                >
                  {published.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title} — /p/{p.slug}
                    </option>
                  ))}
                </select>
              )}
            </label>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={field}
                  placeholder="Label"
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="Label (বাংলা) — optional"
                  value={draft.label_bn}
                  onChange={(e) => setDraft({ ...draft, label_bn: e.target.value })}
                />
              </div>
              <input
                className={field}
                placeholder="Link — /shop, /p/warranty, #faq or a full URL"
                value={draft.href}
                onChange={(e) => setDraft({ ...draft, href: e.target.value })}
              />
            </>
          )}

          <label className="block">
            <span className={lbl}>Show in</span>
            <select
              className={`${field} mt-1`}
              value={draft.placement}
              onChange={(e) =>
                setDraft({ ...draft, placement: e.target.value as "header" | "footer" })
              }
            >
              <option value="header">Header navigation</option>
              <option value="footer">Footer</option>
            </select>
          </label>

          {draft.placement === "footer" && (
            <label className="block">
              <span className={lbl}>Footer column heading</span>
              <input
                className={`${field} mt-1`}
                placeholder="e.g. Company, Legal, Help — blank groups under “Links”"
                list="footer-groups"
                value={draft.footerGroup}
                onChange={(e) => setDraft({ ...draft, footerGroup: e.target.value })}
              />
              <datalist id="footer-groups">
                {footerGroups.filter(Boolean).map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.visible}
              onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
            />
            Visible
          </label>

          <div className="flex gap-3">
            <button className="btn btn-primary text-sm" disabled={pending || !draft.href} onClick={save}>
              {pending ? "Saving" : "Save"}
            </button>
            <button className="btn btn-ghost text-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className={lbl}>Header navigation</p>
          <div className="mt-2 grid gap-2">
            {header.length === 0 && (
              <p className="text-sm text-[color:var(--text-quiet)]">
                No extra header links yet.
              </p>
            )}
            {header.map((m, i) => renderRow(m, header, i))}
          </div>
        </div>

        {footerGroups.map((g) => {
          const list = footer
            .filter((m) => m.footerGroup === g)
            .sort((a, b) => a.sort - b.sort);
          return (
            <div key={g || "__none"}>
              <p className={lbl}>Footer · {g || "Links"}</p>
              <div className="mt-2 grid gap-2">
                {list.map((m, i) => renderRow(m, list, i))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
