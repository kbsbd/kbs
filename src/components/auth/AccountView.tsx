"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/content/seed";
import { formatPrice } from "@/lib/shop";
import { browserClient } from "@/lib/supabase/browser";

type Order = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  items: Array<{ name: string; qty: number; lineTotal: number }>;
};
type Wish = { productId: string; slug: string; name: string; price: number; image: string | null };

export default function AccountView({
  l,
  symbol,
  email,
  profile,
  orders,
  wishlist,
}: {
  l: Locale;
  symbol: string;
  email: string;
  profile: { fullName: string; phone: string };
  orders: Order[];
  wishlist: Wish[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "wishlist" | "profile">("orders");
  const [name, setName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [saved, setSaved] = useState("");
  const [wish, setWish] = useState(wishlist);

  const t = {
    title: l === "bn" ? "আমার অ্যাকাউন্ট" : "My account",
    orders: l === "bn" ? "অর্ডার" : "Orders",
    wishlist: l === "bn" ? "উইশলিস্ট" : "Wishlist",
    profile: l === "bn" ? "প্রোফাইল" : "Profile",
    signOut: l === "bn" ? "সাইন আউট" : "Sign out",
    noOrders: l === "bn" ? "এখনও কোনো অর্ডার নেই।" : "No orders yet.",
    noWish: l === "bn" ? "উইশলিস্ট খালি।" : "Nothing saved yet.",
    name: l === "bn" ? "পুরো নাম" : "Full name",
    phone: l === "bn" ? "ফোন" : "Phone",
    save: l === "bn" ? "সেভ করুন" : "Save",
    remove: l === "bn" ? "সরান" : "Remove",
    shop: l === "bn" ? "শপ" : "Shop",
  };

  async function signOut() {
    await browserClient()?.auth.signOut();
    router.push(`/${l}`);
    router.refresh();
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const sb = browserClient();
    const { data } = (await sb?.auth.getUser()) ?? { data: { user: null } };
    if (!sb || !data.user) return;
    await sb.from("profiles").upsert({ user_id: data.user.id, full_name: name, phone });
    await sb.auth.updateUser({ data: { full_name: name, phone } });
    setSaved(l === "bn" ? "সেভ হয়েছে।" : "Saved.");
  }

  async function removeWish(id: string) {
    const sb = browserClient();
    const { data } = (await sb?.auth.getUser()) ?? { data: { user: null } };
    if (!sb || !data.user) return;
    await sb.from("wishlists").delete().eq("user_id", data.user.id).eq("product_id", id);
    setWish((w) => w.filter((x) => x.productId !== id));
  }

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`rounded-full px-3 py-1.5 text-sm ${
        tab === id
          ? "bg-[color:var(--accent)] text-[#07101a]"
          : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-[clamp(1.8rem,5vw,2.6rem)]">{t.title}</h1>
        <button onClick={signOut} className="ml-auto text-sm text-[color:var(--text-quiet)] hover:text-[color:var(--clay)]">
          {t.signOut}
        </button>
      </div>
      <p className="mt-1 text-sm text-[color:var(--text-quiet)]">{email}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabBtn("orders", t.orders)}
        {tabBtn("wishlist", t.wishlist)}
        {tabBtn("profile", t.profile)}
      </div>

      <div className="mt-8">
        {tab === "orders" &&
          (orders.length === 0 ? (
            <p className="text-[color:var(--text-quiet)]">{t.noOrders}</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.orderNumber} className="card">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <b>{o.orderNumber}</b>
                    <span className="text-[color:var(--text-quiet)]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                    <span className="uppercase text-[color:var(--text-quiet)]">
                      {o.paymentMethod} · {o.status}
                    </span>
                    <span className="ml-auto font-semibold">{formatPrice(o.total, symbol)}</span>
                  </div>
                  <ul className="mt-3 border-t border-[color:var(--panel-edge)] pt-2 text-sm">
                    {o.items.map((it, i) => (
                      <li key={i} className="flex justify-between py-0.5 text-[color:var(--text-secondary)]">
                        <span>
                          {it.qty} × {it.name}
                        </span>
                        <span>{formatPrice(it.lineTotal, symbol)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}

        {tab === "wishlist" &&
          (wish.length === 0 ? (
            <p className="text-[color:var(--text-quiet)]">{t.noWish}</p>
          ) : (
            <div className="shop-grid">
              {wish.map((w) => (
                <div key={w.productId} className="pcard">
                  <Link href={`/${l}/shop/${w.slug}`}>
                    {w.image ? (
                      <img src={w.image} alt="" className="aspect-square w-full object-cover" />
                    ) : (
                      <span className="media-slot block aspect-square" />
                    )}
                  </Link>
                  <div className="pcard-body">
                    <Link href={`/${l}/shop/${w.slug}`} className="pcard-name">
                      {w.name}
                    </Link>
                    <span className="price">
                      <b>{formatPrice(w.price, symbol)}</b>
                    </span>
                    <button
                      onClick={() => removeWish(w.productId)}
                      className="mt-2 self-start text-xs text-[color:var(--clay)] hover:underline"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="card max-w-md space-y-4">
            <label className="block">
              <span className="font-mono-label text-[color:var(--text-quiet)]">{t.name}</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3 outline-none focus:border-[color:var(--accent)]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="font-mono-label text-[color:var(--text-quiet)]">{t.phone}</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3 outline-none focus:border-[color:var(--accent)]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            {saved && <p className="text-sm text-[color:var(--accent)]">{saved}</p>}
            <button className="btn btn-primary text-sm">{t.save}</button>
          </form>
        )}
      </div>
    </>
  );
}
