"use client";

import { useCart } from "./cart";
import { CartIcon } from "@/components/icons/Icons";

/** The header cart control — opens the drawer, shows the item count. */
export default function CartButton({ label }: { label: string }) {
  const { count, openDrawer } = useCart();
  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`${label}${count ? ` (${count})` : ""}`}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--text-primary)]"
    >
      <CartIcon className="h-[22px] w-[22px]" />
      {count > 0 && <span className="cart-badge">{count > 99 ? "99+" : count}</span>}
    </button>
  );
}
