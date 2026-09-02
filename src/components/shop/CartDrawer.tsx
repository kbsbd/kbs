"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content/seed";
import { formatPrice } from "@/lib/shop";
import { useCart } from "./cart";

export default function CartDrawer({ l, symbol }: { l: Locale; symbol: string }) {
  const { items, subtotal, count, drawerOpen, closeDrawer, setQty, remove } = useCart();
  const pathname = usePathname();

  // close on route change
  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  const t = {
    cart: l === "bn" ? "কার্ট" : "Cart",
    empty: l === "bn" ? "আপনার কার্ট খালি।" : "Your cart is empty.",
    browse: l === "bn" ? "পণ্য দেখুন" : "Browse products",
    subtotal: l === "bn" ? "সাবটোটাল" : "Subtotal",
    checkout: l === "bn" ? "চেকআউট" : "Checkout",
    view: l === "bn" ? "কার্ট দেখুন" : "View cart",
    shipNote: l === "bn" ? "ডেলিভারি চার্জ চেকআউটে যোগ হবে।" : "Delivery is calculated at checkout.",
  };

  return (
    <>
      <div className="drawer-scrim" data-open={drawerOpen} onClick={closeDrawer} aria-hidden="true" />
      <aside
        className="drawer"
        data-open={drawerOpen}
        role="dialog"
        aria-label={t.cart}
        aria-modal={drawerOpen}
      >
        <header className="flex items-center justify-between border-b border-[color:var(--panel-edge)] px-5 py-4">
          <span className="font-display text-lg">
            {t.cart} {count > 0 && <span className="text-[color:var(--text-quiet)]">({count})</span>}
          </span>
          <button type="button" onClick={closeDrawer} aria-label="Close" className="text-xl leading-none">
            ×
          </button>
        </header>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[color:var(--text-secondary)]">{t.empty}</p>
              <Link href={`/${l}/shop`} className="btn btn-ghost mt-5 text-sm" onClick={closeDrawer}>
                {t.browse}
              </Link>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="cart-line">
                {it.image ? (
                  <img src={it.image} alt="" />
                ) : (
                  <span className="media-slot h-14 w-14" />
                )}
                <div className="min-w-0">
                  <Link
                    href={`/${l}/shop/${it.slug}`}
                    className="block truncate text-sm font-medium hover:text-[color:var(--accent)]"
                  >
                    {it.name}
                  </Link>
                  <div className="mt-1 text-xs text-[color:var(--text-quiet)]">
                    {formatPrice(it.price, symbol)}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
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
                      className="text-xs text-[color:var(--clay)] hover:underline"
                    >
                      {l === "bn" ? "সরান" : "Remove"}
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {formatPrice(it.price * it.qty, symbol)}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="flex items-baseline justify-between">
              <span className="font-mono-label text-[color:var(--text-quiet)]">{t.subtotal}</span>
              <span className="text-lg font-bold tabular-nums">{formatPrice(subtotal, symbol)}</span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--text-quiet)]">{t.shipNote}</p>
            <div className="mt-4 grid gap-2">
              <Link href={`/${l}/shop/checkout`} className="btn btn-primary w-full" onClick={closeDrawer}>
                {t.checkout}
              </Link>
              <Link href={`/${l}/shop/cart`} className="btn btn-ghost w-full text-sm" onClick={closeDrawer}>
                {t.view}
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
