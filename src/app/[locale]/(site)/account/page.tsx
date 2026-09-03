import { redirect, notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { createAuthClient } from "@/lib/supabase/auth";
import AccountView from "@/components/auth/AccountView";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account — KBS", robots: { index: false } };

type Row = Record<string, unknown>;

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;

  const supabase = await createAuthClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) redirect(`/${l}/login?next=/${l}/account`);

  const c = await getContent();

  const [profileRes, ordersRes, wishRes] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, address").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("order_number, status, payment_status, payment_method, total, created_at, order_items(name, qty, line_total)")
      .order("created_at", { ascending: false }),
    supabase
      .from("wishlists")
      .select("product_id, products(slug, name, name_bn, price, product_images(url, sort))")
      .order("created_at", { ascending: false }),
  ]);

  const orders = ((ordersRes.data as Row[]) ?? []).map((o) => ({
    orderNumber: String(o.order_number),
    status: String(o.status),
    paymentStatus: String(o.payment_status),
    paymentMethod: String(o.payment_method),
    total: Number(o.total),
    createdAt: String(o.created_at),
    items: ((o.order_items as Row[] | null) ?? []).map((i) => ({
      name: String(i.name),
      qty: Number(i.qty),
      lineTotal: Number(i.line_total),
    })),
  }));

  const wishlist = ((wishRes.data as Row[]) ?? [])
    .map((w) => {
      const p = w.products as Row | null;
      if (!p) return null;
      const imgs = ((p.product_images as Row[] | null) ?? []).slice().sort(
        (a, b) => Number(a.sort) - Number(b.sort)
      );
      return {
        productId: String(w.product_id),
        slug: String(p.slug),
        name: l === "bn" && p.name_bn ? String(p.name_bn) : String(p.name),
        price: Number(p.price),
        image: imgs[0] ? String(imgs[0].url) : null,
      };
    })
    .filter(Boolean) as Array<{ productId: string; slug: string; name: string; price: number; image: string | null }>;

  return (
    <div className="page">
      <div className="page-wrap">
        <AccountView
          l={l}
          symbol={c.shop.currencySymbol}
          email={user.email ?? ""}
          profile={{
            fullName: String((profileRes.data as Row | null)?.full_name ?? ""),
            phone: String((profileRes.data as Row | null)?.phone ?? ""),
            address: String((profileRes.data as Row | null)?.address ?? ""),
          }}
          orders={orders}
          wishlist={wishlist}
        />
      </div>
    </div>
  );
}
