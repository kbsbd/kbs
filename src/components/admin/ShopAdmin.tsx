"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { saveContent } from "@/app/[locale]/admin/actions";
import {
  saveProduct,
  deleteProductRow,
  saveCategory,
  deleteCategory,
  setOrderStatus,
  saveOrder,
  deleteOrderRow,
  setQuoteStatus,
  moderateReview,
  saveGateway,
  type ProductInput,
} from "@/app/[locale]/admin/shop-actions";

type L = { en: string; bn: string };
const rid = () => Math.random().toString(36).slice(2, 9);
const emptyL = (): L => ({ en: "", bn: "" });

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  name_bn: string;
  summary: string;
  summary_bn: string;
  description: string;
  description_bn: string;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock: number;
  track_stock: boolean;
  featured: boolean;
  status: "draft" | "active" | "archived";
  sort: number;
  images: Array<{ url: string; alt: string }>;
};
export type AdminCategory = { id: string; name: string; name_bn: string; sort: number };
export type AdminOrderItem = { name: string; qty: number; price: number; line_total: number };
export type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  notes: string;
  created_at: string;
  items: AdminOrderItem[];
};
export type AdminQuote = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  message: string;
  status: string;
  created_at: string;
  items: Array<{ name: string; qty: number; price: number }>;
};
export type AdminReview = {
  id: string;
  product_name: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  created_at: string;
};
export type GatewayId = "cod" | "quote" | "bkash" | "nagad" | "sslcommerz";
export type AdminGateway = {
  id: GatewayId;
  enabled: boolean;
  mode: "sandbox" | "live";
  config: Record<string, string>;
};

const field =
  "w-full rounded-lg border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]";
const lbl = "font-mono-label text-[color:var(--text-quiet)]";
const SUBTABS = ["Products", "Categories", "Orders", "Quotes", "Reviews", "Storefront", "Payments"] as const;

export type StorefrontContent = {
  enabled: boolean;
  hero: {
    enabled: boolean;
    eyebrow: L;
    title: L;
    subtitle: L;
    image: string;
    ctaLabel: L;
    ctaHref: string;
  };
  featured: {
    enabled: boolean;
    heading: L;
    slides: Array<{ id: string; image: string; title: L; subtitle: L; href: string }>;
  };
  search: { enabled: boolean; placeholder: L };
};

export default function ShopAdmin({
  products,
  categories,
  orders,
  quotes,
  reviews,
  gateways,
  storefront,
  isAdmin = true,
  notify,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  quotes: AdminQuote[];
  reviews: AdminReview[];
  gateways: AdminGateway[];
  storefront: StorefrontContent;
  isAdmin?: boolean;
  notify: (s: string) => void;
}) {
  const subtabs = isAdmin
    ? SUBTABS
    : SUBTABS.filter((s) => s !== "Payments" && s !== "Storefront");
  const [sub, setSub] = useState<(typeof SUBTABS)[number]>("Products");
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {subtabs.map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              sub === s
                ? "bg-[color:var(--accent)] text-[#07101a]"
                : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            }`}
          >
            {s}
            {s === "Reviews" && pendingReviews > 0 && ` (${pendingReviews})`}
          </button>
        ))}
      </div>

      {sub === "Products" && (
        <ProductsPanel
          products={products}
          categories={categories}
          isAdmin={isAdmin}
          notify={notify}
        />
      )}
      {sub === "Categories" && (
        <CategoriesPanel categories={categories} isAdmin={isAdmin} notify={notify} />
      )}
      {sub === "Orders" && (
        <OrdersPanel orders={orders} products={products} isAdmin={isAdmin} notify={notify} />
      )}
      {sub === "Quotes" && <QuotesPanel quotes={quotes} notify={notify} />}
      {sub === "Reviews" && <ReviewsPanel reviews={reviews} isAdmin={isAdmin} notify={notify} />}
      {sub === "Storefront" && isAdmin && (
        <StorefrontPanel data={storefront} notify={notify} />
      )}
      {sub === "Payments" && isAdmin && <PaymentsPanel gateways={gateways} notify={notify} />}
    </div>
  );
}

/* ================= Storefront ================= */

function BiInput({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: L;
  onChange: (v: L) => void;
  textarea?: boolean;
}) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div>
      <span className={lbl}>{label}</span>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        <Tag
          className={field}
          rows={textarea ? 2 : undefined}
          placeholder="English"
          value={value.en}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...value, en: e.target.value })
          }
        />
        <Tag
          className={field}
          rows={textarea ? 2 : undefined}
          placeholder="বাংলা"
          value={value.bn}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...value, bn: e.target.value })
          }
        />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

function StorefrontPanel({
  data,
  notify,
}: {
  data: StorefrontContent;
  notify: (s: string) => void;
}) {
  const [shopOn, setShopOn] = useState(data.enabled);
  const [hero, setHero] = useState(data.hero);
  const [featured, setFeatured] = useState(data.featured);
  const [search, setSearch] = useState(data.search);
  const [pending, start] = useTransition();

  const save = (edits: Array<{ path: string; value: unknown }>, msg: string) =>
    start(async () => {
      const r = await saveContent(edits.map((e) => ({ root: "shop", ...e })));
      notify(r.ok ? msg : r.error);
    });

  const setSlide = (i: number, patch: Partial<StorefrontContent["featured"]["slides"][number]>) =>
    setFeatured((f) => ({
      ...f,
      slides: f.slides.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    }));
  const moveSlide = (i: number, dir: -1 | 1) =>
    setFeatured((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.slides.length) return f;
      const next = f.slides.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, slides: next };
    });

  return (
    <div className="max-w-3xl space-y-10">
      {/* visibility */}
      <section className="rounded-2xl border border-[color:var(--panel-edge)] p-5">
        <h3 className="font-display text-lg">Shop page</h3>
        <p className="mt-1 text-xs text-[color:var(--text-quiet)]">
          Off hides the Shop nav link and makes every /shop URL return “not found”.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Toggle checked={shopOn} onChange={setShopOn}>
            {shopOn ? "Shop is visible to the public" : "Shop is hidden"}
          </Toggle>
          <button
            className="btn btn-primary ml-auto text-sm"
            disabled={pending}
            onClick={() => save([{ path: "enabled", value: shopOn }], shopOn ? "Shop is now live." : "Shop hidden.")}
          >
            {pending ? "Saving" : "Save"}
          </button>
        </div>
      </section>

      {/* hero */}
      <section className="space-y-4 rounded-2xl border border-[color:var(--panel-edge)] p-5">
        <div className="flex items-center">
          <h3 className="font-display text-lg">Hero banner</h3>
          <button
            className="btn btn-primary ml-auto text-sm"
            disabled={pending}
            onClick={() => save([{ path: "hero", value: hero }], "Hero saved.")}
          >
            {pending ? "Saving" : "Save hero"}
          </button>
        </div>
        <Toggle checked={hero.enabled} onChange={(v) => setHero({ ...hero, enabled: v })}>
          Show the hero on /shop
        </Toggle>
        <ImageUpload
          label="Background image"
          value={hero.image}
          onChange={(url) => setHero({ ...hero, image: url })}
        />
        <BiInput label="Eyebrow (small line above)" value={hero.eyebrow} onChange={(v) => setHero({ ...hero, eyebrow: v })} />
        <BiInput label="Title" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
        <BiInput label="Subtitle" value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} textarea />
        <div className="grid gap-3 sm:grid-cols-2">
          <BiInput label="Button label" value={hero.ctaLabel} onChange={(v) => setHero({ ...hero, ctaLabel: v })} />
          <label className="block">
            <span className={lbl}>Button link</span>
            <input
              className={`${field} mt-1`}
              placeholder="/contact or #book or https://…"
              value={hero.ctaHref}
              onChange={(e) => setHero({ ...hero, ctaHref: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* featured carousel */}
      <section className="space-y-4 rounded-2xl border border-[color:var(--panel-edge)] p-5">
        <div className="flex items-center">
          <h3 className="font-display text-lg">Featured carousel</h3>
          <button
            className="btn btn-primary ml-auto text-sm"
            disabled={pending}
            onClick={() => save([{ path: "featured", value: featured }], "Featured carousel saved.")}
          >
            {pending ? "Saving" : "Save carousel"}
          </button>
        </div>
        <p className="text-xs text-[color:var(--text-quiet)]">
          An auto-scrolling strip under the hero. Add slides below; with none it
          falls back to products you tick “Featured” on the Products tab.
        </p>
        <Toggle
          checked={featured.enabled}
          onChange={(v) => setFeatured({ ...featured, enabled: v })}
        >
          Show the carousel
        </Toggle>
        <BiInput
          label="Heading"
          value={featured.heading}
          onChange={(v) => setFeatured({ ...featured, heading: v })}
        />

        <div className="space-y-3">
          {featured.slides.map((sl, i) => (
            <div key={sl.id} className="rounded-xl border border-[color:var(--panel-edge)] p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-[color:var(--text-quiet)]">
                <span>Slide {i + 1}</span>
                <div className="ml-auto flex gap-1.5">
                  <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} aria-label="Move up" className="px-1 disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === featured.slides.length - 1} aria-label="Move down" className="px-1 disabled:opacity-30">↓</button>
                  <button
                    type="button"
                    className="text-[color:var(--clay)] hover:underline"
                    onClick={() =>
                      setFeatured((f) => ({ ...f, slides: f.slides.filter((_, j) => j !== i) }))
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ImageUpload label="Image" value={sl.image} onChange={(url) => setSlide(i, { image: url })} />
              <div className="mt-2 space-y-2">
                <BiInput label="Title" value={sl.title} onChange={(v) => setSlide(i, { title: v })} />
                <BiInput label="Subtitle" value={sl.subtitle} onChange={(v) => setSlide(i, { subtitle: v })} />
                <label className="block">
                  <span className={lbl}>Link</span>
                  <input
                    className={`${field} mt-1`}
                    placeholder="/shop/some-product"
                    value={sl.href}
                    onChange={(e) => setSlide(i, { href: e.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn btn-ghost text-sm"
          onClick={() =>
            setFeatured((f) => ({
              ...f,
              slides: [...f.slides, { id: rid(), image: "", title: emptyL(), subtitle: emptyL(), href: "" }],
            }))
          }
        >
          Add slide
        </button>
      </section>

      {/* search */}
      <section className="space-y-4 rounded-2xl border border-[color:var(--panel-edge)] p-5">
        <div className="flex items-center">
          <h3 className="font-display text-lg">Search box</h3>
          <button
            className="btn btn-primary ml-auto text-sm"
            disabled={pending}
            onClick={() => save([{ path: "search", value: search }], "Search settings saved.")}
          >
            {pending ? "Saving" : "Save search"}
          </button>
        </div>
        <Toggle checked={search.enabled} onChange={(v) => setSearch({ ...search, enabled: v })}>
          Show the search box on /shop
        </Toggle>
        <BiInput
          label="Placeholder text"
          value={search.placeholder}
          onChange={(v) => setSearch({ ...search, placeholder: v })}
        />
      </section>
    </div>
  );
}

/* ================= Products ================= */

const EMPTY_PRODUCT = (): ProductInput => ({
  slug: "",
  name: "",
  name_bn: "",
  summary: "",
  summary_bn: "",
  description: "",
  description_bn: "",
  category_id: null,
  price: 0,
  compare_at_price: null,
  sku: "",
  stock: 0,
  track_stock: true,
  featured: false,
  status: "draft",
  sort: 0,
  images: [],
});

function ProductsPanel({
  products,
  categories,
  isAdmin,
  notify,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  isAdmin: boolean;
  notify: (s: string) => void;
}) {
  const [draft, setDraft] = useState<ProductInput | null>(null);
  const [pending, start] = useTransition();

  function edit(p: AdminProduct) {
    setDraft({ ...p, id: p.id, images: p.images.length ? p.images : [] });
  }
  function save() {
    if (!draft) return;
    start(async () => {
      const r = await saveProduct(draft);
      notify(r.ok ? "Product saved." : r.error);
      if (r.ok) setDraft(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Only <b>active</b> products show on the site.
        </p>
        <button className="btn btn-primary ml-auto text-sm" onClick={() => setDraft(EMPTY_PRODUCT())}>
          New product
        </button>
      </div>

      {draft && (
        <div className="max-w-3xl space-y-4 rounded-2xl border border-[color:var(--accent)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <L label="Name">
              <input
                className={field}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </L>
            <L label="Name (বাংলা) — optional">
              <input
                className={field}
                value={draft.name_bn}
                onChange={(e) => setDraft({ ...draft, name_bn: e.target.value })}
              />
            </L>
            <L label="URL slug — blank = from name">
              <input
                className={field}
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </L>
            <L label="Category">
              <select
                className={field}
                value={draft.category_id ?? ""}
                onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}
              >
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </L>
            <L label="Price (৳)">
              <input
                type="number"
                className={field}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              />
            </L>
            <L label='"Was" price (৳) — optional'>
              <input
                type="number"
                className={field}
                value={draft.compare_at_price ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    compare_at_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </L>
            <L label="SKU">
              <input
                className={field}
                value={draft.sku}
                onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
              />
            </L>
            <L label="Stock">
              <input
                type="number"
                className={field}
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
              />
            </L>
          </div>

          <L label="Summary — one line under the name">
            <input
              className={field}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            />
          </L>
          <L label="Description">
            <textarea
              rows={4}
              className={`${field} resize-y`}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </L>

          <div className="space-y-3">
            <p className={lbl}>Images</p>
            {draft.images.map((img, i) => (
              <div key={i} className="flex items-start gap-3">
                <ImageUpload
                  label={`Image ${i + 1}`}
                  value={img.url}
                  onChange={(url) =>
                    setDraft({
                      ...draft,
                      images: url
                        ? draft.images.map((x, j) => (j === i ? { ...x, url } : x))
                        : draft.images.filter((_, j) => j !== i),
                    })
                  }
                />
              </div>
            ))}
            <button
              className="btn btn-ghost text-xs"
              onClick={() => setDraft({ ...draft, images: [...draft.images, { url: "", alt: "" }] })}
            >
              Add an image
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-1">
            <L label="Status" inline>
              <select
                className={field}
                value={draft.status}
                onChange={(e) =>
                  setDraft({ ...draft, status: e.target.value as ProductInput["status"] })
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </L>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.track_stock}
                onChange={(e) => setDraft({ ...draft, track_stock: e.target.checked })}
              />
              Track stock
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              />
              Featured
            </label>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary text-sm" onClick={save} disabled={pending}>
              {pending ? "Saving" : "Save product"}
            </button>
            <button className="btn btn-ghost text-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-[color:var(--panel-edge)] px-4 py-3"
          >
            {p.images[0] ? (
              <img src={p.images[0].url} alt="" className="h-10 w-10 rounded object-cover" />
            ) : (
              <span className="media-slot h-10 w-10" />
            )}
            <span className="font-medium">{p.name}</span>
            <span className="text-sm text-[color:var(--text-quiet)]">৳ {p.price}</span>
            <span className="text-xs text-[color:var(--text-quiet)]">
              {p.track_stock ? `stock ${p.stock}` : "no stock limit"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                p.status === "active"
                  ? "bg-[color:var(--accent-muted)] text-[color:var(--accent)]"
                  : "text-[color:var(--text-quiet)]"
              }`}
            >
              {p.status}
            </span>
            <div className="ml-auto flex gap-3 text-sm">
              <button className="hover:text-[color:var(--accent)]" onClick={() => edit(p)}>
                Edit
              </button>
              {isAdmin && (
                <button
                  className="text-[color:var(--clay)] hover:underline"
                  onClick={() =>
                    start(async () => {
                      if (!confirm(`Delete "${p.name}"?`)) return;
                      const r = await deleteProductRow(p.id);
                      notify(r.ok ? "Deleted." : r.error);
                    })
                  }
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-[color:var(--text-quiet)]">No products yet.</p>
        )}
      </div>
    </div>
  );
}

function L({
  label,
  children,
  inline,
}: {
  label: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <label className={inline ? "block" : "block"}>
      <span className={lbl}>{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/* ================= Categories ================= */

function CategoriesPanel({
  categories,
  isAdmin,
  notify,
}: {
  categories: AdminCategory[];
  isAdmin: boolean;
  notify: (s: string) => void;
}) {
  const [draft, setDraft] = useState<{ id?: string; name: string; name_bn: string; sort: number } | null>(
    null
  );
  const [pending, start] = useTransition();

  return (
    <div className="max-w-xl space-y-4">
      <button
        className="btn btn-primary text-sm"
        onClick={() => setDraft({ name: "", name_bn: "", sort: categories.length })}
      >
        New category
      </button>

      {draft && (
        <div className="space-y-3 rounded-xl border border-[color:var(--accent)] p-4">
          <L label="Name">
            <input
              className={field}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </L>
          <L label="Name (বাংলা) — optional">
            <input
              className={field}
              value={draft.name_bn}
              onChange={(e) => setDraft({ ...draft, name_bn: e.target.value })}
            />
          </L>
          <div className="flex gap-3">
            <button
              className="btn btn-primary text-sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await saveCategory(draft);
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
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 rounded-xl border border-[color:var(--panel-edge)] px-4 py-2.5"
          >
            <span>{c.name}</span>
            <div className="ml-auto flex gap-3 text-sm">
              <button
                className="hover:text-[color:var(--accent)]"
                onClick={() => setDraft({ id: c.id, name: c.name, name_bn: c.name_bn, sort: c.sort })}
              >
                Edit
              </button>
              {isAdmin && (
              <button
                className="text-[color:var(--clay)] hover:underline"
                onClick={() =>
                  start(async () => {
                    const r = await deleteCategory(c.id);
                    notify(r.ok ? "Deleted." : r.error);
                  })
                }
              >
                Delete
              </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= Orders ================= */

const ORDER_STATUS = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];
const PAY_STATUS = ["unpaid", "paid", "refunded", "failed"];
const PAY_METHOD = ["cod", "quote", "bkash", "nagad", "sslcommerz"];

type OrderDraft = {
  id?: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  notes: string;
  shipping: number;
  items: Array<{ name: string; qty: number; price: number }>;
};

const emptyOrder = (): OrderDraft => ({
  status: "pending",
  payment_status: "unpaid",
  payment_method: "cod",
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  shipping_address: "",
  notes: "",
  shipping: 0,
  items: [{ name: "", qty: 1, price: 0 }],
});

function OrdersPanel({
  orders,
  products,
  isAdmin,
  notify,
}: {
  orders: AdminOrder[];
  products: AdminProduct[];
  isAdmin: boolean;
  notify: (s: string) => void;
}) {
  const [, start] = useTransition();
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [pending, startSave] = useTransition();

  const subtotal = draft ? draft.items.reduce((n, i) => n + i.qty * i.price, 0) : 0;

  function editOrder(o: AdminOrder) {
    setDraft({
      id: o.id,
      status: o.status,
      payment_status: o.payment_status,
      payment_method: o.payment_method,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      customer_email: o.customer_email,
      shipping_address: o.shipping_address,
      notes: o.notes,
      shipping: o.shipping,
      items: o.items.length
        ? o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price }))
        : [{ name: "", qty: 1, price: 0 }],
    });
  }
  const setItem = (i: number, patch: Partial<OrderDraft["items"][0]>) =>
    setDraft((d) => (d ? { ...d, items: d.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) } : d));

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Every order with its full customer and delivery details.
          {!isAdmin && " You can change the status; only an admin can edit or delete an order."}
        </p>
        {isAdmin && (
          <button className="btn btn-primary ml-auto text-sm" onClick={() => setDraft(emptyOrder())}>
            New order
          </button>
        )}
      </div>

      {isAdmin && draft && (
        <div className="max-w-3xl space-y-4 rounded-2xl border border-[color:var(--accent)] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <L label="Customer name">
              <input className={field} value={draft.customer_name}
                onChange={(e) => setDraft({ ...draft, customer_name: e.target.value })} />
            </L>
            <L label="Phone">
              <input className={field} value={draft.customer_phone}
                onChange={(e) => setDraft({ ...draft, customer_phone: e.target.value })} />
            </L>
            <L label="Email">
              <input className={field} value={draft.customer_email}
                onChange={(e) => setDraft({ ...draft, customer_email: e.target.value })} />
            </L>
            <L label="Payment method">
              <select className={field} value={draft.payment_method}
                onChange={(e) => setDraft({ ...draft, payment_method: e.target.value })}>
                {PAY_METHOD.map((m) => <option key={m}>{m}</option>)}
              </select>
            </L>
          </div>
          <L label="Delivery address">
            <textarea rows={2} className={`${field} resize-y`} value={draft.shipping_address}
              onChange={(e) => setDraft({ ...draft, shipping_address: e.target.value })} />
          </L>
          <L label="Internal note">
            <input className={field} value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </L>

          <div className="space-y-2">
            <p className={lbl}>Items</p>
            {draft.items.map((it, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input
                  className={`${field} min-w-[10rem] flex-1`}
                  placeholder="Item name"
                  list="admin-products"
                  value={it.name}
                  onChange={(e) => {
                    const p = products.find((x) => x.name === e.target.value);
                    setItem(i, p ? { name: p.name, price: p.price } : { name: e.target.value });
                  }}
                />
                <input type="number" className={`${field} w-16`} value={it.qty}
                  onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                <input type="number" className={`${field} w-24`} value={it.price}
                  placeholder="৳" onChange={(e) => setItem(i, { price: Number(e.target.value) })} />
                <span className="w-20 text-right text-sm tabular-nums">৳ {it.qty * it.price}</span>
                <button className="text-xs text-[color:var(--clay)]"
                  onClick={() => setDraft({ ...draft, items: draft.items.filter((_, j) => j !== i) })}>
                  ✕
                </button>
              </div>
            ))}
            <datalist id="admin-products">
              {products.map((p) => <option key={p.id} value={p.name} />)}
            </datalist>
            <button className="btn btn-ghost text-xs"
              onClick={() => setDraft({ ...draft, items: [...draft.items, { name: "", qty: 1, price: 0 }] })}>
              Add item
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <L label="Order status">
              <select className={field} value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                {ORDER_STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </L>
            <L label="Payment status">
              <select className={field} value={draft.payment_status}
                onChange={(e) => setDraft({ ...draft, payment_status: e.target.value })}>
                {PAY_STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </L>
            <L label="Delivery charge (৳)">
              <input type="number" className={field} value={draft.shipping}
                onChange={(e) => setDraft({ ...draft, shipping: Number(e.target.value) })} />
            </L>
            <p className="ml-auto text-sm">
              Total <b className="tabular-nums">৳ {subtotal + Number(draft.shipping || 0)}</b>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className="btn btn-primary text-sm"
              disabled={pending}
              onClick={() =>
                startSave(async () => {
                  const r = await saveOrder(draft);
                  notify(r.ok ? "Order saved." : r.error);
                  if (r.ok) setDraft(null);
                })
              }
            >
              {pending ? "Saving" : "Save order"}
            </button>
            <button className="btn btn-ghost text-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-sm text-[color:var(--text-quiet)]">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <details key={o.id} className="rounded-xl border border-[color:var(--panel-edge)] px-4 py-3">
              <summary className="flex flex-wrap items-center gap-3">
                <b>{o.order_number}</b>
                <span className="text-sm">{o.customer_name}</span>
                <span className="text-sm text-[color:var(--text-quiet)]">৳ {o.total}</span>
                <span className="text-xs uppercase text-[color:var(--text-quiet)]">
                  {o.payment_method} · {o.status} · {o.payment_status}
                </span>
                <span className="ml-auto text-xs text-[color:var(--text-quiet)]">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </summary>
              <div className="mt-3 space-y-1.5 text-sm">
                <p className="font-medium">Customer</p>
                <p className="text-[color:var(--text-secondary)]">
                  {o.customer_name}
                  {o.customer_phone && <> · {o.customer_phone}</>}
                  {o.customer_email && <> · {o.customer_email}</>}
                </p>
                <p className="font-medium pt-1">Delivery address</p>
                <p className="whitespace-pre-line text-[color:var(--text-secondary)]">
                  {o.shipping_address || "—"}
                </p>
                {o.notes && <p className="text-[color:var(--text-quiet)]">Note: {o.notes}</p>}
                <ul className="mt-2 border-t border-[color:var(--panel-edge)] pt-2">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex justify-between py-0.5">
                      <span>{it.qty} × {it.name}</span>
                      <span>৳ {it.line_total}</span>
                    </li>
                  ))}
                  <li className="flex justify-between pt-1 text-[color:var(--text-quiet)]">
                    <span>Subtotal / delivery</span>
                    <span>৳ {o.subtotal} / ৳ {o.shipping}</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-3 pt-2">
                  <label className="flex items-center gap-2">
                    Order
                    <select className={field} defaultValue={o.status}
                      onChange={(e) => start(async () => {
                        const r = await setOrderStatus(o.id, "status", e.target.value);
                        notify(r.ok ? "Updated." : r.error);
                      })}>
                      {ORDER_STATUS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    Payment
                    <select className={field} defaultValue={o.payment_status}
                      onChange={(e) => start(async () => {
                        const r = await setOrderStatus(o.id, "payment_status", e.target.value);
                        notify(r.ok ? "Updated." : r.error);
                      })}>
                      {PAY_STATUS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  {isAdmin && (
                    <>
                      <button className="text-sm hover:text-[color:var(--accent)]" onClick={() => editOrder(o)}>
                        Edit
                      </button>
                      <button
                        className="text-sm text-[color:var(--clay)] hover:underline"
                        onClick={() => start(async () => {
                          if (!confirm(`Delete order ${o.order_number}?`)) return;
                          const r = await deleteOrderRow(o.id);
                          notify(r.ok ? "Order deleted." : r.error);
                        })}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= Quotes ================= */

function QuotesPanel({ quotes, notify }: { quotes: AdminQuote[]; notify: (s: string) => void }) {
  const [, start] = useTransition();
  if (quotes.length === 0)
    return <p className="text-sm text-[color:var(--text-quiet)]">No quote requests yet.</p>;
  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <details key={q.id} className="rounded-xl border border-[color:var(--panel-edge)] px-4 py-3">
          <summary className="flex flex-wrap items-center gap-3">
            <b>{q.name}</b>
            {q.company && <span className="text-sm text-[color:var(--text-quiet)]">{q.company}</span>}
            <span className="text-xs uppercase text-[color:var(--text-quiet)]">{q.status}</span>
            <span className="ml-auto text-xs text-[color:var(--text-quiet)]">
              {new Date(q.created_at).toLocaleDateString()}
            </span>
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              {q.phone} · {q.email || "no email"}
            </p>
            {q.address && (
              <p className="whitespace-pre-line">
                <span className={lbl}>Address</span>
                <br />
                {q.address}
              </p>
            )}
            {q.message && <p className="text-[color:var(--text-quiet)]">{q.message}</p>}
            <ul className="border-t border-[color:var(--panel-edge)] pt-2">
              {q.items.map((it, i) => (
                <li key={i}>
                  {it.qty} × {it.name} (৳ {it.price})
                </li>
              ))}
            </ul>
            <label className="flex items-center gap-2 pt-1">
              Status
              <select
                className={field}
                defaultValue={q.status}
                onChange={(e) =>
                  start(async () => {
                    const r = await setQuoteStatus(q.id, e.target.value);
                    notify(r.ok ? "Updated." : r.error);
                  })
                }
              >
                {["new", "quoted", "won", "lost"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </details>
      ))}
    </div>
  );
}

/* ================= Reviews ================= */

function ReviewsPanel({
  reviews,
  isAdmin,
  notify,
}: {
  reviews: AdminReview[];
  isAdmin: boolean;
  notify: (s: string) => void;
}) {
  const [, start] = useTransition();
  if (reviews.length === 0)
    return <p className="text-sm text-[color:var(--text-quiet)]">No reviews yet.</p>;
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-[color:var(--panel-edge)] px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-[color:var(--accent)]">{"★".repeat(r.rating)}</span>
            <b>{r.product_name}</b>
            <span className="text-[color:var(--text-quiet)]">{r.author_name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                r.status === "published"
                  ? "bg-[color:var(--accent-muted)] text-[color:var(--accent)]"
                  : r.status === "pending"
                    ? "text-[color:var(--clay)]"
                    : "text-[color:var(--text-quiet)]"
              }`}
            >
              {r.status}
            </span>
          </div>
          {r.title && <p className="mt-1.5 text-sm font-medium">{r.title}</p>}
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{r.body}</p>
          <div className="mt-2 flex gap-3 text-sm">
            {r.status !== "published" && (
              <button
                className="text-[color:var(--accent)] hover:underline"
                onClick={() =>
                  start(async () => {
                    const res = await moderateReview(r.id, "published");
                    notify(res.ok ? "Published." : res.error);
                  })
                }
              >
                Publish
              </button>
            )}
            {r.status !== "rejected" && (
              <button
                className="hover:underline"
                onClick={() =>
                  start(async () => {
                    const res = await moderateReview(r.id, "rejected");
                    notify(res.ok ? "Hidden." : res.error);
                  })
                }
              >
                Reject
              </button>
            )}
            {isAdmin && (
              <button
                className="text-[color:var(--clay)] hover:underline"
                onClick={() =>
                  start(async () => {
                    const res = await moderateReview(r.id, "delete");
                    notify(res.ok ? "Deleted." : res.error);
                  })
                }
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= Payments ================= */

const GATEWAY_META: Record<GatewayId, { label: string; desc: string; keys: boolean }> = {
  quote: {
    label: "Request a quote",
    desc: "The cart becomes a quote request — no payment. Good for large / project orders.",
    keys: false,
  },
  cod: {
    label: "Cash on delivery",
    desc: "Customer places the order and pays on delivery.",
    keys: false,
  },
  bkash: {
    label: "bKash",
    desc: "Shows at checkout. Until the keys below are live the order is placed unpaid and you follow up for payment.",
    keys: true,
  },
  nagad: {
    label: "Nagad",
    desc: "Shows at checkout. Until the keys below are live the order is placed unpaid and you follow up for payment.",
    keys: true,
  },
  sslcommerz: {
    label: "Card / mobile banking (SSLCommerz)",
    desc: "Shows at checkout. Until the keys below are live the order is placed unpaid and you follow up for payment.",
    keys: true,
  },
};

const GATEWAY_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
  bkash: [
    { key: "app_key", label: "App Key" },
    { key: "app_secret", label: "App Secret" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ],
  nagad: [
    { key: "merchant_id", label: "Merchant ID" },
    { key: "merchant_number", label: "Merchant Number" },
    { key: "public_key", label: "Nagad Public Key" },
    { key: "private_key", label: "Merchant Private Key" },
  ],
  sslcommerz: [
    { key: "store_id", label: "Store ID" },
    { key: "store_passwd", label: "Store Password" },
  ],
};

function PaymentsPanel({
  gateways,
  notify,
}: {
  gateways: AdminGateway[];
  notify: (s: string) => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
        Tick <b>Show at checkout</b> to make a method appear to customers; untick it and it
        disappears from the checkout. Merchant keys are stored server-side and never sent to the
        browser.
      </p>
      {gateways.map((g) => (
        <GatewayForm key={g.id} gateway={g} notify={notify} />
      ))}
    </div>
  );
}

function GatewayForm({ gateway, notify }: { gateway: AdminGateway; notify: (s: string) => void }) {
  const [enabled, setEnabled] = useState(gateway.enabled);
  const [mode, setMode] = useState<"sandbox" | "live">(gateway.mode);
  const [config, setConfig] = useState<Record<string, string>>(gateway.config ?? {});
  const [pending, start] = useTransition();
  const meta = GATEWAY_META[gateway.id];
  const fields = meta.keys ? GATEWAY_FIELDS[gateway.id] ?? [] : [];

  return (
    <div className="rounded-xl border border-[color:var(--panel-edge)] p-4">
      <div className="flex items-center gap-4">
        <span className="font-medium">{meta.label}</span>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Show at checkout
        </label>
        {meta.keys && (
          <select
            className={`${field} ml-auto w-auto`}
            value={mode}
            onChange={(e) => setMode(e.target.value as "sandbox" | "live")}
          >
            <option value="sandbox">Sandbox</option>
            <option value="live">Live</option>
          </select>
        )}
      </div>
      <p className="mt-1.5 text-xs text-[color:var(--text-quiet)]">{meta.desc}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className={lbl}>{f.label}</span>
            <input
              className={`${field} mt-1 font-mono`}
              value={config[f.key] ?? ""}
              onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <button
        className="btn btn-primary mt-4 text-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await saveGateway({ id: gateway.id, enabled, mode, config });
            notify(r.ok ? "Saved." : r.error);
          })
        }
      >
        {pending ? "Saving" : "Save"}
      </button>
    </div>
  );
}
