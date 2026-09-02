/**
 * Shop data access.
 *
 * All reads go through the anon client under RLS, so only `status = 'active'`
 * products and `status = 'published'` reviews come back. Every function returns
 * an empty result rather than throwing when Supabase is not configured, so the
 * shop simply shows "nothing here yet" instead of a broken page.
 */

import { createServerClient, createAdminClient } from "./supabase/server";
import type { Locale } from "@/content/seed";

export type ProductImage = { url: string; alt: string };

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  name_bn: string;
  summary: string;
  summary_bn: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  trackStock: boolean;
  image: string | null;
  categorySlug: string | null;
};

export type Product = ProductCard & {
  description: string;
  description_bn: string;
  sku: string;
  featured: boolean;
  images: ProductImage[];
  category: { slug: string; name: string; name_bn: string } | null;
};

export type Category = { slug: string; name: string; name_bn: string };

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

const CARD_COLS =
  "id, slug, name, name_bn, summary, summary_bn, price, compare_at_price, stock, track_stock, product_images(url, alt, sort), product_categories(slug)";

type Row = Record<string, unknown>;

function toCard(p: Row): ProductCard {
  const imgs = ((p.product_images as Row[] | null) ?? [])
    .slice()
    .sort((a, b) => Number(a.sort) - Number(b.sort));
  const cat = p.product_categories as Row | null;
  return {
    id: String(p.id),
    slug: String(p.slug),
    name: String(p.name ?? ""),
    name_bn: String(p.name_bn ?? ""),
    summary: String(p.summary ?? ""),
    summary_bn: String(p.summary_bn ?? ""),
    price: Number(p.price ?? 0),
    compareAtPrice: p.compare_at_price == null ? null : Number(p.compare_at_price),
    stock: Number(p.stock ?? 0),
    trackStock: Boolean(p.track_stock),
    image: imgs[0] ? String(imgs[0].url) : null,
    categorySlug: cat ? String(cat.slug) : null,
  };
}

export async function getProducts(opts: {
  category?: string;
  featured?: boolean;
  limit?: number;
  exclude?: string;
} = {}): Promise<ProductCard[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  try {
    let q = supabase
      .from("products")
      .select(CARD_COLS)
      .eq("status", "active")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false });
    if (opts.featured) q = q.eq("featured", true);
    if (opts.limit) q = q.limit(opts.limit);
    if (opts.exclude) q = q.neq("id", opts.exclude);

    const { data, error } = await q;
    if (error || !data) return [];
    let cards = (data as Row[]).map(toCard);
    if (opts.category) cards = cards.filter((c) => c.categorySlug === opts.category);
    return cards;
  } catch {
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createServerClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, name_bn, summary, summary_bn, description, description_bn, price, compare_at_price, stock, track_stock, sku, featured, product_images(url, alt, sort), product_categories(slug, name, name_bn)"
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (error || !data) return null;
    const p = data as Row;
    const card = toCard(p);
    const cat = p.product_categories as Row | null;
    const images = ((p.product_images as Row[] | null) ?? [])
      .slice()
      .sort((a, b) => Number(a.sort) - Number(b.sort))
      .map((i) => ({ url: String(i.url), alt: String(i.alt ?? "") }));
    return {
      ...card,
      description: String(p.description ?? ""),
      description_bn: String(p.description_bn ?? ""),
      sku: String(p.sku ?? ""),
      featured: Boolean(p.featured),
      images,
      category: cat
        ? { slug: String(cat.slug), name: String(cat.name), name_bn: String(cat.name_bn) }
        : null,
    };
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select("slug, name, name_bn")
      .order("sort", { ascending: true });
    if (error || !data) return [];
    return (data as Row[]).map((c) => ({
      slug: String(c.slug),
      name: String(c.name ?? ""),
      name_bn: String(c.name_bn ?? ""),
    }));
  } catch {
    return [];
  }
}

export async function getReviews(productId: string): Promise<Review[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, author_name, rating, title, body, created_at")
      .eq("product_id", productId)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map((r) => ({
      id: String(r.id),
      authorName: String(r.author_name ?? "Anonymous"),
      rating: Number(r.rating ?? 0),
      title: String(r.title ?? ""),
      body: String(r.body ?? ""),
      createdAt: String(r.created_at ?? ""),
    }));
  } catch {
    return [];
  }
}

/**
 * The checkout methods the admin has switched on, in display order. Read with
 * the service-role client because `payment_gateways` is admin-only under RLS
 * (it holds merchant keys) — only the enabled ids, never the config, leave the
 * server. Falls back to quote + cod when the table is empty or unreachable.
 */
export async function getEnabledPaymentMethods(): Promise<string[]> {
  const order = ["quote", "cod", "bkash", "nagad", "sslcommerz"];
  const supabase = createAdminClient();
  if (!supabase) return ["quote", "cod"];
  try {
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("id, enabled")
      .eq("enabled", true);
    if (error) return ["quote", "cod"];
    const on = new Set((data ?? []).map((r) => String(r.id)));
    const list = order.filter((id) => on.has(id));
    return list.length ? list : ["quote", "cod"];
  } catch {
    return ["quote", "cod"];
  }
}

export function ratingSummary(reviews: Review[]): { avg: number; count: number } {
  if (!reviews.length) return { avg: 0, count: 0 };
  const sum = reviews.reduce((n, r) => n + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

/** "৳ 1,250" — BDT with thousands separators, no decimals unless there are paisa. */
export function formatPrice(amount: number, symbol = "৳"): string {
  const n = Number(amount) || 0;
  const s = Number.isInteger(n)
    ? n.toLocaleString("en-US")
    : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol} ${s}`;
}

export const pick = (en: string, bn: string, l: Locale) => (l === "bn" && bn ? bn : en);
