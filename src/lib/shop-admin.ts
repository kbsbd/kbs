/**
 * Assembles everything the Shop tab of the dashboard needs, in one place.
 * Uses the cookie-bound client so RLS ("admins see everything") applies.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminProduct,
  AdminCategory,
  AdminOrder,
  AdminQuote,
  AdminReview,
  AdminGateway,
} from "@/components/admin/ShopAdmin";

type Row = Record<string, unknown>;

export async function loadShopAdmin(supabase: SupabaseClient): Promise<{
  products: AdminProduct[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  quotes: AdminQuote[];
  reviews: AdminReview[];
  gateways: AdminGateway[];
}> {
  const [prodRes, catRes, orderRes, quoteRes, reviewRes, gwRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(url, alt, sort)")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("product_categories").select("*").order("sort", { ascending: true }),
    supabase
      .from("orders")
      .select("*, order_items(name, qty, price, line_total)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(200),
    supabase
      .from("product_reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("payment_gateways").select("*"),
  ]);

  const products: AdminProduct[] = ((prodRes.data as Row[]) ?? []).map((p) => ({
    id: String(p.id),
    slug: String(p.slug ?? ""),
    name: String(p.name ?? ""),
    name_bn: String(p.name_bn ?? ""),
    summary: String(p.summary ?? ""),
    summary_bn: String(p.summary_bn ?? ""),
    description: String(p.description ?? ""),
    description_bn: String(p.description_bn ?? ""),
    category_id: p.category_id ? String(p.category_id) : null,
    price: Number(p.price ?? 0),
    compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price),
    sku: String(p.sku ?? ""),
    stock: Number(p.stock ?? 0),
    track_stock: Boolean(p.track_stock),
    featured: Boolean(p.featured),
    status: (String(p.status ?? "draft") as AdminProduct["status"]),
    sort: Number(p.sort ?? 0),
    images: ((p.product_images as Row[] | null) ?? [])
      .slice()
      .sort((a, b) => Number(a.sort) - Number(b.sort))
      .map((i) => ({ url: String(i.url), alt: String(i.alt ?? "") })),
  }));

  const categories: AdminCategory[] = ((catRes.data as Row[]) ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name ?? ""),
    name_bn: String(c.name_bn ?? ""),
    sort: Number(c.sort ?? 0),
  }));

  const orders: AdminOrder[] = ((orderRes.data as Row[]) ?? []).map((o) => ({
    id: String(o.id),
    order_number: String(o.order_number ?? ""),
    status: String(o.status ?? ""),
    payment_status: String(o.payment_status ?? ""),
    payment_method: String(o.payment_method ?? ""),
    subtotal: Number(o.subtotal ?? 0),
    shipping: Number(o.shipping ?? 0),
    total: Number(o.total ?? 0),
    customer_name: String(o.customer_name ?? ""),
    customer_phone: String(o.customer_phone ?? ""),
    customer_email: String(o.customer_email ?? ""),
    shipping_address: String(o.shipping_address ?? ""),
    notes: String(o.notes ?? ""),
    created_at: String(o.created_at ?? ""),
    items: ((o.order_items as Row[] | null) ?? []).map((i) => ({
      name: String(i.name ?? ""),
      qty: Number(i.qty ?? 0),
      price: Number(i.price ?? 0),
      line_total: Number(i.line_total ?? 0),
    })),
  }));

  const quotes: AdminQuote[] = ((quoteRes.data as Row[]) ?? []).map((q) => ({
    id: String(q.id),
    name: String(q.name ?? ""),
    email: String(q.email ?? ""),
    phone: String(q.phone ?? ""),
    company: String(q.company ?? ""),
    address: String(q.address ?? ""),
    message: String(q.message ?? ""),
    status: String(q.status ?? "new"),
    created_at: String(q.created_at ?? ""),
    items: (Array.isArray(q.items) ? (q.items as Row[]) : []).map((i) => ({
      name: String(i.name ?? ""),
      qty: Number(i.qty ?? 0),
      price: Number(i.price ?? 0),
    })),
  }));

  const reviews: AdminReview[] = ((reviewRes.data as Row[]) ?? []).map((r) => ({
    id: String(r.id),
    product_name: String((r.products as Row | null)?.name ?? "—"),
    author_name: String(r.author_name ?? ""),
    rating: Number(r.rating ?? 0),
    title: String(r.title ?? ""),
    body: String(r.body ?? ""),
    status: String(r.status ?? "pending"),
    created_at: String(r.created_at ?? ""),
  }));

  const byId = new Map(((gwRes.data as Row[]) ?? []).map((g) => [String(g.id), g]));
  const gateways: AdminGateway[] = (
    ["quote", "cod", "bkash", "nagad", "sslcommerz"] as const
  ).map((id) => {
    const g = byId.get(id);
    return {
      id,
      // quote + cod default on; the online gateways default off
      enabled: g ? Boolean(g.enabled) : id === "quote" || id === "cod",
      mode: (String(g?.mode ?? "sandbox") as "sandbox" | "live"),
      config: (g?.config as Record<string, string>) ?? {},
    };
  });

  return { products, categories, orders, quotes, reviews, gateways };
}
