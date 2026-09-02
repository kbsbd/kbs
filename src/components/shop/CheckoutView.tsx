"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/content/seed";
import { formatPrice } from "@/lib/shop";
import { browserClient } from "@/lib/supabase/browser";
import { useCart } from "./cart";
import { shippingFor, type CheckoutMode } from "./checkout-math";

const MODE_META: Record<CheckoutMode, { en: string; bn: string; soon?: boolean }> = {
  quote: { en: "Request a quote", bn: "কোটেশন চান" },
  cod: { en: "Cash on delivery", bn: "ক্যাশ অন ডেলিভারি" },
  bkash: { en: "bKash", bn: "বিকাশ", soon: true },
  nagad: { en: "Nagad", bn: "নগদ", soon: true },
  sslcommerz: { en: "Card / SSLCommerz", bn: "কার্ড / SSLCommerz", soon: true },
};

export default function CheckoutView({
  l,
  symbol,
  flatShipping,
  freeOver,
  modes,
}: {
  l: Locale;
  symbol: string;
  flatShipping: number;
  freeOver: number;
  modes: CheckoutMode[];
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [mode, setMode] = useState<CheckoutMode>(modes[0] ?? "quote");
  const [f, setF] = useState({ name: "", email: "", phone: "", company: "", address: "", notes: "" });
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = browserClient();
    sb?.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setF((p) => ({
        ...p,
        email: data.user!.email ?? p.email,
        name: (data.user!.user_metadata?.full_name as string) || p.name,
        phone: (data.user!.user_metadata?.phone as string) || p.phone,
      }));
    });
  }, []);

  const shipping = mode === "cod" ? shippingFor(subtotal, flatShipping, freeOver) : 0;
  const total = subtotal + shipping;
  const isQuote = mode === "quote";

  const t = {
    title: l === "bn" ? "চেকআউট" : "Checkout",
    empty: l === "bn" ? "আপনার কার্ট খালি।" : "Your cart is empty.",
    browse: l === "bn" ? "পণ্য দেখুন" : "Browse products",
    how: l === "bn" ? "কীভাবে এগোবেন" : "How to proceed",
    name: l === "bn" ? "নাম" : "Full name",
    email: l === "bn" ? "ইমেইল" : "Email",
    phone: l === "bn" ? "ফোন" : "Phone",
    company: l === "bn" ? "প্রতিষ্ঠান (ঐচ্ছিক)" : "Company (optional)",
    address: l === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery address",
    notes: l === "bn" ? "নোট (ঐচ্ছিক)" : "Notes (optional)",
    place: isQuote
      ? l === "bn" ? "কোটেশন রিকোয়েস্ট পাঠান" : "Send quote request"
      : l === "bn" ? "অর্ডার কনফার্ম করুন" : "Place order",
    sending: l === "bn" ? "পাঠানো হচ্ছে…" : "Sending…",
    subtotal: l === "bn" ? "সাবটোটাল" : "Subtotal",
    delivery: l === "bn" ? "ডেলিভারি" : "Delivery",
    tbd: l === "bn" ? "পরে জানানো হবে" : "We'll confirm",
    total: l === "bn" ? "মোট" : "Total",
    quoteNote:
      l === "bn"
        ? "আমরা দাম ও স্টক যাচাই করে ইমেইল/ফোনে কোটেশন পাঠাব।"
        : "We'll check pricing and stock and send you a quote by email or phone.",
  };

  const field =
    "w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3 text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)]";
  const lbl = "font-mono-label text-[color:var(--text-quiet)]";

  if (items.length === 0 && state === "idle") {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-[clamp(1.8rem,5vw,2.6rem)]">{t.title}</h1>
        <p className="mt-4 text-[color:var(--text-secondary)]">{t.empty}</p>
        <Link href={`/${l}/shop`} className="btn btn-primary mt-6">
          {t.browse}
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          customer: f,
          notes: f.notes,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong.");
      clear();
      const ref = json.orderNumber || json.ref || "";
      router.push(`/${l}/shop/checkout/done?kind=${json.kind}&ref=${encodeURIComponent(ref)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <>
      <h1 className="font-display text-[clamp(1.8rem,5vw,2.6rem)]">{t.title}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="space-y-6">
          <fieldset>
            <legend className={lbl}>{t.how}</legend>
            <div className="mt-3 grid gap-2">
              {modes.map((m) => {
                const meta = MODE_META[m];
                return (
                  <label
                    key={m}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      mode === m
                        ? "border-[color:var(--accent)]"
                        : "border-[color:var(--panel-edge)]"
                    } ${meta.soon ? "opacity-50" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={m}
                      checked={mode === m}
                      disabled={meta.soon}
                      onChange={() => setMode(m)}
                    />
                    <span>{l === "bn" ? meta.bn : meta.en}</span>
                    {meta.soon && (
                      <span className="ml-auto text-xs text-[color:var(--text-quiet)]">
                        {l === "bn" ? "শীঘ্রই" : "soon"}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {isQuote && (
              <p className="mt-2 text-xs text-[color:var(--text-quiet)]">{t.quoteNote}</p>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl} htmlFor="co-name">{t.name}</label>
              <input
                id="co-name"
                className={`${field} mt-2`}
                required
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </div>
            <div>
              <label className={lbl} htmlFor="co-phone">{t.phone}</label>
              <input
                id="co-phone"
                type="tel"
                className={`${field} mt-2`}
                required
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={lbl} htmlFor="co-email">{t.email}</label>
              <input
                id="co-email"
                type="email"
                className={`${field} mt-2`}
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
              />
            </div>
            <div>
              <label className={lbl} htmlFor="co-company">{t.company}</label>
              <input
                id="co-company"
                className={`${field} mt-2`}
                value={f.company}
                onChange={(e) => setF({ ...f, company: e.target.value })}
              />
            </div>
          </div>

          {mode === "cod" && (
            <div>
              <label className={lbl} htmlFor="co-address">{t.address}</label>
              <textarea
                id="co-address"
                rows={3}
                className={`${field} mt-2 resize-y`}
                required
                value={f.address}
                onChange={(e) => setF({ ...f, address: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className={lbl} htmlFor="co-notes">{t.notes}</label>
            <textarea
              id="co-notes"
              rows={2}
              className={`${field} mt-2 resize-y`}
              value={f.notes}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-[color:var(--clay)]">
              {error}
            </p>
          )}

          <button className="btn btn-primary w-full" disabled={state === "sending"}>
            {state === "sending" ? t.sending : t.place}
          </button>
        </form>

        <div className="card h-fit">
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3">
                {it.image ? (
                  <img src={it.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                ) : (
                  <span className="media-slot h-12 w-12" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{it.name}</p>
                  <p className="text-xs text-[color:var(--text-quiet)]">
                    {it.qty} × {formatPrice(it.price, symbol)}
                  </p>
                </div>
                <span className="text-sm tabular-nums">
                  {formatPrice(it.price * it.qty, symbol)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-[color:var(--panel-edge)] pt-4 text-sm">
            <div className="flex justify-between py-1 text-[color:var(--text-secondary)]">
              <span>{t.subtotal}</span>
              <span className="tabular-nums">{formatPrice(subtotal, symbol)}</span>
            </div>
            {!isQuote && (
              <div className="flex justify-between py-1 text-[color:var(--text-secondary)]">
                <span>{t.delivery}</span>
                <span className="tabular-nums">
                  {flatShipping <= 0 ? t.tbd : formatPrice(shipping, symbol)}
                </span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-[color:var(--panel-edge)] pt-2 text-base font-bold">
              <span>{isQuote ? t.subtotal : t.total}</span>
              <span className="tabular-nums">{formatPrice(isQuote ? subtotal : total, symbol)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
