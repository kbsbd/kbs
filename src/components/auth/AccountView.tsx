"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/content/seed";
import { formatPrice } from "@/lib/shop";
import { browserClient } from "@/lib/supabase/browser";
import { HeartIcon, MenuIcon, CloseIcon, CartIcon, UserIcon } from "@/components/icons/Icons";

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
type Tab = "orders" | "wishlist" | "profile";

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
  const [tab, setTab] = useState<Tab>("orders");
  const [drawer, setDrawer] = useState(false);
  const [removed, setRemoved] = useState<string[]>([]);
  const wish = useMemo(
    () => wishlist.filter((w) => !removed.includes(w.productId)),
    [wishlist, removed]
  );

  const t = {
    title: l === "bn" ? "আমার অ্যাকাউন্ট" : "My account",
    orders: l === "bn" ? "অর্ডার" : "Orders",
    wishlist: l === "bn" ? "উইশলিস্ট" : "Wishlist",
    profile: l === "bn" ? "প্রোফাইল" : "Profile",
    signOut: l === "bn" ? "সাইন আউট" : "Sign out",
    viewSite: l === "bn" ? "সাইটে ফিরুন" : "Back to site",
    noOrders: l === "bn" ? "এখনও কোনো অর্ডার নেই।" : "No orders yet.",
    noWish: l === "bn" ? "উইশলিস্টে কিছু নেই।" : "Nothing saved yet.",
    startShopping: l === "bn" ? "শপিং শুরু করুন" : "Start shopping",
    remove: l === "bn" ? "সরান" : "Remove",
    menu: l === "bn" ? "মেনু" : "Menu",
  };

  const NAV: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: "orders", label: t.orders, icon: <CartIcon className="h-[18px] w-[18px]" /> },
    { id: "wishlist", label: t.wishlist, icon: <HeartIcon className="h-[18px] w-[18px]" /> },
    { id: "profile", label: t.profile, icon: <UserIcon className="h-[18px] w-[18px]" /> },
  ];
  const current = NAV.find((n) => n.id === tab)!;

  async function signOut() {
    await browserClient()?.auth.signOut();
    router.push(`/${l}`);
    router.refresh();
  }

  async function removeWish(id: string) {
    const sb = browserClient();
    const { data } = (await sb?.auth.getUser()) ?? { data: { user: null } };
    if (!sb || !data.user) return;
    await sb.from("wishlists").delete().eq("user_id", data.user.id).eq("product_id", id);
    setRemoved((r) => [...r, id]);
  }

  const pick = (id: Tab) => {
    setTab(id);
    setDrawer(false);
  };

  return (
    <div className="acct-shell">
      {/* mobile scrim */}
      <div
        className={`acct-scrim ${drawer ? "acct-scrim-open" : ""}`}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />

      <aside className={`acct-nav ${drawer ? "acct-nav-open" : ""}`}>
        <div className="acct-nav-head">
          <span className="font-display text-lg">{t.title}</span>
          <button
            type="button"
            className="lg:hidden text-[color:var(--text-quiet)] hover:text-[color:var(--text-primary)]"
            onClick={() => setDrawer(false)}
            aria-label={l === "bn" ? "বন্ধ করুন" : "Close"}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="acct-nav-email">{email}</p>

        <nav className="acct-nav-list">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => pick(n.id)}
              aria-current={tab === n.id}
              className={`acct-nav-item ${tab === n.id ? "acct-nav-item-on" : ""}`}
            >
              {n.icon}
              {n.label}
              {n.id === "wishlist" && wish.length > 0 && (
                <span className="acct-nav-badge">{wish.length}</span>
              )}
              {n.id === "orders" && orders.length > 0 && (
                <span className="acct-nav-badge">{orders.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="acct-nav-foot">
          <Link href={`/${l}`} className="text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--accent)]">
            {t.viewSite}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="ml-auto text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--clay)]"
          >
            {t.signOut}
          </button>
        </div>
      </aside>

      <div className="acct-main">
        <div className="acct-topbar lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label={t.menu}
            className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <span className="font-display text-base">{current.label}</span>
        </div>

        <div className="acct-content">
          <h1 className="hidden font-display text-[clamp(1.6rem,4vw,2.2rem)] lg:block">
            {current.label}
          </h1>

          <div className="lg:mt-6">
            {tab === "orders" && <Orders l={l} symbol={symbol} orders={orders} t={t} />}
            {tab === "wishlist" && (
              <Wishlist l={l} symbol={symbol} wish={wish} onRemove={removeWish} t={t} />
            )}
            {tab === "profile" && <Profile l={l} email={email} profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- sections ---------------- */

function Orders({
  l,
  symbol,
  orders,
  t,
}: {
  l: Locale;
  symbol: string;
  orders: Order[];
  t: Record<string, string>;
}) {
  if (orders.length === 0)
    return (
      <div className="acct-empty">
        <p className="text-[color:var(--text-quiet)]">{t.noOrders}</p>
        <Link href={`/${l}/shop`} className="btn btn-primary mt-4 text-sm">
          {t.startShopping}
        </Link>
      </div>
    );
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.orderNumber} className="card">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <b>{o.orderNumber}</b>
            <span className="text-[color:var(--text-quiet)]">
              {new Date(o.createdAt).toLocaleDateString()}
            </span>
            <span className="rounded-full bg-[color:var(--panel)] px-2 py-0.5 text-xs uppercase text-[color:var(--text-secondary)]">
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
  );
}

function Wishlist({
  l,
  symbol,
  wish,
  onRemove,
  t,
}: {
  l: Locale;
  symbol: string;
  wish: Wish[];
  onRemove: (id: string) => void;
  t: Record<string, string>;
}) {
  if (wish.length === 0)
    return (
      <div className="acct-empty">
        <p className="text-[color:var(--text-quiet)]">{t.noWish}</p>
        <Link href={`/${l}/shop`} className="btn btn-primary mt-4 text-sm">
          {t.startShopping}
        </Link>
      </div>
    );
  return (
    <div className="shop-grid">
      {wish.map((w) => (
        <div key={w.productId} className="pcard">
          <Link href={`/${l}/shop/${w.slug}`} className="block">
            {w.image ? (
              <img src={w.image} alt="" className="aspect-square w-full object-cover" loading="lazy" />
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
              onClick={() => onRemove(w.productId)}
              className="mt-2 self-start text-xs text-[color:var(--clay)] hover:underline"
            >
              {t.remove}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Profile({
  l,
  email,
  profile,
}: {
  l: Locale;
  email: string;
  profile: { fullName: string; phone: string };
}) {
  const [name, setName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState<"" | "profile" | "pw">("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const c = {
    name: l === "bn" ? "পুরো নাম" : "Full name",
    phone: l === "bn" ? "ফোন" : "Phone",
    email: l === "bn" ? "ইমেইল" : "Email",
    emailNote: l === "bn" ? "ইমেইল পরিবর্তন করতে সহায়তার সাথে যোগাযোগ করুন।" : "Contact us to change your email.",
    save: l === "bn" ? "সেভ করুন" : "Save changes",
    saving: l === "bn" ? "সেভ হচ্ছে…" : "Saving…",
    saved: l === "bn" ? "সেভ হয়েছে।" : "Saved.",
    pwHead: l === "bn" ? "পাসওয়ার্ড পরিবর্তন" : "Change password",
    newPw: l === "bn" ? "নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" : "New password (min 8 characters)",
    update: l === "bn" ? "পাসওয়ার্ড আপডেট" : "Update password",
    pwSaved: l === "bn" ? "পাসওয়ার্ড আপডেট হয়েছে।" : "Password updated.",
    fail: l === "bn" ? "কাজ করেনি। আবার চেষ্টা করুন।" : "That didn't work. Try again.",
  };

  const field =
    "mt-1.5 w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3 outline-none focus:border-[color:var(--accent)]";
  const lbl = "font-mono-label text-[color:var(--text-quiet)]";

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy("profile");
    setMsg("");
    setErr("");
    try {
      const sb = browserClient();
      const { data } = (await sb?.auth.getUser()) ?? { data: { user: null } };
      if (!sb || !data.user) throw new Error();
      const { error } = await sb
        .from("profiles")
        .upsert({ user_id: data.user.id, full_name: name.trim(), phone: phone.trim() });
      if (error) throw error;
      await sb.auth.updateUser({ data: { full_name: name.trim(), phone: phone.trim() } });
      setMsg(c.saved);
    } catch {
      setErr(c.fail);
    } finally {
      setBusy("");
    }
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return;
    setBusy("pw");
    setMsg("");
    setErr("");
    try {
      const sb = browserClient();
      if (!sb) throw new Error();
      const { error } = await sb.auth.updateUser({ password: pw });
      if (error) throw error;
      setPw("");
      setMsg(c.pwSaved);
    } catch {
      setErr(c.fail);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="max-w-md space-y-8">
      <form onSubmit={saveProfile} className="card space-y-4">
        <label className="block">
          <span className={lbl}>{c.name}</span>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className={lbl}>{c.phone}</span>
          <input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="block">
          <span className={lbl}>{c.email}</span>
          <input className={`${field} opacity-60`} value={email} disabled />
          <span className="mt-1 block text-xs text-[color:var(--text-quiet)]">{c.emailNote}</span>
        </label>
        <button className="btn btn-primary text-sm" disabled={busy === "profile"}>
          {busy === "profile" ? c.saving : c.save}
        </button>
      </form>

      <form onSubmit={changePw} className="card space-y-4">
        <h2 className="font-display text-lg">{c.pwHead}</h2>
        <label className="block">
          <span className={lbl}>{c.newPw}</span>
          <input
            className={field}
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        <button className="btn btn-ghost text-sm" disabled={busy === "pw" || pw.length < 8}>
          {busy === "pw" ? c.saving : c.update}
        </button>
      </form>

      {msg && <p className="text-sm text-[color:var(--accent)]">{msg}</p>}
      {err && <p className="text-sm text-[color:var(--clay)]">{err}</p>}
    </div>
  );
}
