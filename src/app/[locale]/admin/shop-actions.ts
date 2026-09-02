"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient, getAdminSession } from "@/lib/supabase/auth";

/**
 * Shop admin writes. Every one re-checks the admin session and goes through the
 * cookie-bound client, so RLS ("writable by admins") is the real gate — a
 * server action is a public endpoint.
 */

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

async function guard() {
  const session = await getAdminSession();
  if (!session) return null;
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
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
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
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
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
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };

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
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
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
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
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

export async function setQuoteStatus(id: string, value: string): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
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
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
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
  id: "bkash" | "nagad" | "sslcommerz";
  enabled: boolean;
  mode: "sandbox" | "live";
  config: Record<string, string>;
}): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const { error } = await ctx.supabase
    .from("payment_gateways")
    .update({ enabled: input.enabled, mode: input.mode, config: input.config })
    .eq("id", input.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}
