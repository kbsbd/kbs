"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient, getAdminSession, can } from "@/lib/supabase/auth";

/**
 * Shop admin writes. Every one re-checks the session and goes through the
 * cookie-bound client, so RLS (`has_perm('key')`) is the real gate — a server
 * action is a public endpoint.
 */

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

const DENIED_MSG = "You do not have access to this.";
const DENIED = { ok: false as const, error: DENIED_MSG };
const NOT_SIGNED_IN = { ok: false as const, error: "Not signed in as staff." };

/** Requires a permission (a full admin always passes). */
async function guardPerm(key: string) {
  const session = await getAdminSession();
  if (!session) return null;
  if (!can(session, key)) return "denied" as const;
  const supabase = await createAuthClient();
  return supabase ? { session, supabase } : null;
}

function refreshShop(slug?: string) {
  for (const l of ["/en", "/bn"]) {
    revalidatePath(`${l}/shop`);
    if (slug) revalidatePath(`${l}/shop/${slug}`);
    revalidatePath(`${l}/admin`);
  }
  revalidatePath("/sitemap.xml");
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/* ---------------- categories ---------------- */

export async function saveCategory(input: {
  id?: string;
  name: string;
  name_bn: string;
  sort: number;
}): Promise<Result> {
  const ctx = await guardPerm("shop.products");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;
  const row = {
    name: input.name.trim(),
    name_bn: input.name_bn.trim(),
    slug: slugify(input.name),
    sort: input.sort | 0,
  };
  if (!row.name) return { ok: false, error: "Name is required." };
  const { error } = input.id
    ? await ctx.supabase.from("product_categories").update(row).eq("id", input.id)
    : await ctx.supabase.from("product_categories").insert(row);
  if (error) return { ok: false, error: error.message };
  refreshShop();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const ctx = await guardPerm("shop.products.delete");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;
  const { error } = await ctx.supabase.from("product_categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshShop();
  return { ok: true };
}

/* ---------------- products ---------------- */

export type ProductInput = {
  id?: string;
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

export async function saveProduct(p: ProductInput): Promise<Result<{ id: string }>> {
  const ctx = await guardPerm("shop.products");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;

  const name = p.name.trim();
  if (!name) return { ok: false, error: "Product name is required." };
  const slug = slugify(p.slug || p.name);
  if (!slug) return { ok: false, error: "Could not build a URL slug from the name." };

  const row = {
    slug,
    name,
    name_bn: p.name_bn.trim(),
    summary: p.summary.trim(),
    summary_bn: p.summary_bn.trim(),
    description: p.description.trim(),
    description_bn: p.description_bn.trim(),
    category_id: p.category_id || null,
    price: Math.max(0, Number(p.price) || 0),
    compare_at_price: p.compare_at_price ? Math.max(0, Number(p.compare_at_price)) : null,
    sku: p.sku.trim(),
    stock: Math.max(0, Math.round(Number(p.stock) || 0)),
    track_stock: p.track_stock,
    featured: p.featured,
    status: p.status,
    sort: p.sort | 0,
  };

  const { data, error } = p.id
    ? await ctx.supabase.from("products").update(row).eq("id", p.id).select("id").single()
    : await ctx.supabase.from("products").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: error?.message || "Save failed." };
  const productId = data.id as string;

  // images: replace the set wholesale (small lists, simplest correct approach)
  await ctx.supabase.from("product_images").delete().eq("product_id", productId);
  if (p.images.length) {
    const imgRows = p.images
      .filter((i) => i.url)
      .map((i, idx) => ({ product_id: productId, url: i.url, alt: i.alt || name, sort: idx }));
    if (imgRows.length) await ctx.supabase.from("product_images").insert(imgRows);
  }

  refreshShop(slug);
  return { ok: true, id: productId };
}

export async function deleteProductRow(id: string): Promise<Result> {
  const ctx = await guardPerm("shop.products.delete");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;
  const { error } = await ctx.supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshShop();
  return { ok: true };
}

/* ---------------- orders ---------------- */

export async function setOrderStatus(
  id: string,
  field: "status" | "payment_status",
  value: string
): Promise<Result> {
  const ctx = await guardPerm("shop.orders");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;
  const allowed = {
    status: ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"],
    payment_status: ["unpaid", "paid", "refunded", "failed"],
  };
  if (!allowed[field].includes(value)) return { ok: false, error: "Unknown value." };
  const { error } = await ctx.supabase.from("orders").update({ [field]: value }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}

export type OrderInput = {
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

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];
const PAY_STATUSES = ["unpaid", "paid", "refunded", "failed"];
const PAY_METHODS = ["cod", "quote", "bkash", "nagad", "sslcommerz"];

export async function saveOrder(input: OrderInput): Promise<Result<{ id: string }>> {
  const ctx = await guardPerm("shop.orders.manage");
  if (ctx === "denied") return { ok: false, error: "You cannot add or edit orders." };
  if (!ctx) return NOT_SIGNED_IN;
  if (input.customer_name.trim().length < 2)
    return { ok: false, error: "Customer name is required." };
  if (!ORDER_STATUSES.includes(input.status) || !PAY_STATUSES.includes(input.payment_status))
    return { ok: false, error: "Unknown status." };
  const method = PAY_METHODS.includes(input.payment_method) ? input.payment_method : "cod";

  const lines = input.items
    .map((i) => ({
      name: String(i.name).trim(),
      qty: Math.max(1, Math.round(Number(i.qty) || 1)),
      price: Math.max(0, Number(i.price) || 0),
    }))
    .filter((i) => i.name)
    .map((i) => ({ ...i, line_total: i.qty * i.price }));

  const subtotal = lines.reduce((n, l) => n + l.line_total, 0);
  const shipping = Math.max(0, Number(input.shipping) || 0);
  const row = {
    status: input.status,
    payment_status: input.payment_status,
    payment_method: method,
    customer_name: input.customer_name.trim(),
    customer_phone: input.customer_phone.trim(),
    customer_email: input.customer_email.trim(),
    shipping_address: input.shipping_address.trim(),
    notes: input.notes.trim(),
    currency: "BDT",
    subtotal,
    shipping,
    total: subtotal + shipping,
  };

  const { data, error } = input.id
    ? await ctx.supabase.from("orders").update(row).eq("id", input.id).select("id").single()
    : await ctx.supabase.from("orders").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: error?.message || "Save failed." };
  const orderId = data.id as string;

  await ctx.supabase.from("order_items").delete().eq("order_id", orderId);
  if (lines.length) {
    await ctx.supabase
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: orderId })));
  }

  revalidatePath("/en/admin");
  return { ok: true, id: orderId };
}

export async function deleteOrderRow(id: string): Promise<Result> {
  const ctx = await guardPerm("shop.orders.manage");
  if (ctx === "denied") return { ok: false, error: "You cannot delete orders." };
  if (!ctx) return NOT_SIGNED_IN;
  const { error } = await ctx.supabase.from("orders").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}

export async function setQuoteStatus(id: string, value: string): Promise<Result> {
  const ctx = await guardPerm("shop.quotes");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;
  if (!["new", "quoted", "won", "lost"].includes(value))
    return { ok: false, error: "Unknown value." };
  const { error } = await ctx.supabase.from("quote_requests").update({ status: value }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}

/* ---------------- reviews ---------------- */

export async function moderateReview(
  id: string,
  action: "published" | "rejected" | "delete"
): Promise<Result> {
  const ctx = await guardPerm(action === "delete" ? "shop.reviews.delete" : "shop.reviews");
  if (ctx === "denied")
    return {
      ok: false,
      error:
        action === "delete"
          ? "You cannot delete reviews — reject it instead."
          : DENIED_MSG,
    };
  if (!ctx) return NOT_SIGNED_IN;
  const { error } =
    action === "delete"
      ? await ctx.supabase.from("product_reviews").delete().eq("id", id)
      : await ctx.supabase.from("product_reviews").update({ status: action }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshShop();
  return { ok: true };
}

/* ---------------- payment gateways ---------------- */

export async function saveGateway(input: {
  id: "cod" | "quote" | "bkash" | "nagad" | "sslcommerz";
  enabled: boolean;
  mode: "sandbox" | "live";
  config: Record<string, string>;
}): Promise<Result> {
  const ctx = await guardPerm("shop.payments");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;
  if (!["cod", "quote", "bkash", "nagad", "sslcommerz"].includes(input.id))
    return { ok: false, error: "Unknown payment method." };
  const { error } = await ctx.supabase
    .from("payment_gateways")
    .upsert(
      { id: input.id, enabled: input.enabled, mode: input.mode, config: input.config },
      { onConflict: "id" }
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}

/* ---------------- delivery partners ---------------- */

const DELIVERY_IDS = ["steadfast", "pathao", "redx", "sundarban", "sa-paribahan"];

export async function saveDeliveryPartner(input: {
  id: string;
  enabled: boolean;
  config: Record<string, string>;
}): Promise<Result> {
  const ctx = await guardPerm("shop.delivery");
  if (ctx === "denied") return DENIED;
  if (!ctx) return NOT_SIGNED_IN;
  if (!DELIVERY_IDS.includes(input.id))
    return { ok: false, error: "Unknown delivery partner." };
  const config = Object.fromEntries(
    Object.entries(input.config || {}).map(([k, v]) => [k, String(v).trim()])
  );
  const { error } = await ctx.supabase
    .from("delivery_partners")
    .upsert(
      { id: input.id, enabled: input.enabled, config, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}
