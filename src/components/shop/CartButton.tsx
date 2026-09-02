"use client";

import { useCart } from "./cart";

/** The header cart control — opens the drawer, shows the item count. */
export default function CartButton({ label }: { label: string }) {
  const { count, openDrawer } = useCart();
  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`${label}${count ? ` (${count})` : ""}`}
      className="relative text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--text-primary)]"
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 7h13l-1.2 9.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7zm0 0L5 3H3m6 8v3m6-3v3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && <span className="cart-badge">{count > 99 ? "99+" : count}</span>}
    </button>
  );
}
