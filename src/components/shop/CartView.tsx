"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/content/seed";
import { formatPrice } from "@/lib/shop";
import { useCart } from "./cart";
import { shippingFor } from "./checkout-math";

export default function CartView({
  l,
  symbol,
  flatShipping,
  freeOver,
}: {
  l: Locale;
  symbol: string;
  flatShipping: number;
  freeOver: number;
}) {
  const { items, subtotal, setQty, remove } = useCart();
  const shipping = shippingFor(subtotal, flatShipping, freeOver);
  const total = subtotal + shipping;

  const t = {
    title: l === "bn" ? "কার্ট" : "Your cart",
    empty: l === "bn" ? "আপনার কার্ট খালি।" : "Your cart is empty.",
    browse: l === "bn" ? "পণ্য দেখুন" : "Browse products",
    subtotal: l === "bn" ? "সাবটোটাল" : "Subtotal",
    shipping: l === "bn" ? "ডেলিভারি" : "Delivery",
    free: l === "bn" ? "ফ্রি" : "Free",
    tbd: l === "bn" ? "চেকআউটে" : "At checkout",
    total: l === "bn" ? "মোট" : "Total",
    checkout: l === "bn" ? "চেকআউট" : "Proceed to checkout",
    remove: l === "bn" ? "সরান" : "Remove",
  };

  if (items.length === 0) {
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

  return (
    <>
      <h1 className="font-display text-[clamp(1.8rem,5vw,2.6rem)]">{t.title}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {items.map((it) => (
            <div key={it.id} className="cart-line">
              {it.image ? <img src={it.image} alt="" /> : <span className="media-slot h-14 w-14" />}
              <div className="min-w-0">
                <Link
                  href={`/${l}/shop/${it.slug}`}
                  className="font-medium hover:text-[color:var(--accent)]"
                >
                  {it.name}
                </Link>
                <div className="mt-1 text-sm text-[color:var(--text-quiet)]">
                  {formatPrice(it.price, symbol)}
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="qty scale-90 origin-left">
                    <button type="button" onClick={() => setQty(it.id, it.qty - 1)}>
                      −
                    </button>
                    <span>{it.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(it.id, it.qty + 1)}
                      disabled={it.trackStock && it.qty >= it.stock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="text-sm text-[color:var(--clay)] hover:underline"
                  >
                    {t.remove}
                  </button>
                </div>
              </div>
              <div className="font-semibold tabular-nums">
                {formatPrice(it.price * it.qty, symbol)}
              </div>
            </div>
          ))}
        </div>

        <div className="card h-fit">
          <div className="flex justify-between py-1 text-[color:var(--text-secondary)]">
            <span>{t.subtotal}</span>
            <span className="tabular-nums">{formatPrice(subtotal, symbol)}</span>
          </div>
          <div className="flex justify-between py-1 text-[color:var(--text-secondary)]">
            <span>{t.shipping}</span>
            <span className="tabular-nums">
              {flatShipping <= 0 ? t.tbd : shipping === 0 ? t.free : formatPrice(shipping, symbol)}
            </span>
          </div>
          <div className="mt-3 flex justify-between border-t border-[color:var(--panel-edge)] pt-3 text-lg font-bold">
            <span>{t.total}</span>
            <span className="tabular-nums">{formatPrice(total, symbol)}</span>
          </div>
          <Link href={`/${l}/shop/checkout`} className="btn btn-primary mt-5 w-full">
            {t.checkout}
          </Link>
        </div>
      </div>
    </>
  );
}
