"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * Wishlist. For now it lives in localStorage, keyed by product id. When accounts
 * land, a signed-in visitor's local list is merged into the `wishlists` table on
 * login and this provider reads from there instead.
 */

const KEY = "kbs:wishlist:v1";

type WishlistCtx = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
};

const Ctx = createContext<WishlistCtx | null>(null);

function load(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // one-time read of the persisted list after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, hydrated]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  return (
    <Ctx.Provider
      value={{ ids, has: (id) => ids.includes(id), toggle, count: ids.length }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist(): WishlistCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
