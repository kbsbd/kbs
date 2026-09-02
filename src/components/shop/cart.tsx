"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * The cart. Lives entirely in the browser (localStorage) until checkout, when
 * it is posted to /api/shop/checkout as an order or a quote request. Nothing
 * here needs an account.
 */

const KEY = "kbs:cart:v1";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
  /** stock at the time it was added; 0 with trackStock=false means unlimited */
  stock: number;
  trackStock: boolean;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

function load(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((x) => x && typeof x.id === "string" && typeof x.qty === "number");
  } catch {
    return [];
  }
}

function cap(item: CartItem): CartItem {
  const max = item.trackStock ? Math.max(0, item.stock) : Infinity;
  return { ...item, qty: Math.min(Math.max(1, Math.round(item.qty)), max || 1) };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // one-time read of the persisted cart after mount (SSR renders an empty cart)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage full / disabled — cart just won't persist */
    }
  }, [items, hydrated]);

  // keep two tabs roughly in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback<CartCtx["add"]>((item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? cap({ ...p, ...item, qty: p.qty + qty }) : p
        );
      }
      return [...prev, cap({ ...item, qty })];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback<CartCtx["setQty"]>((id, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => p.id !== id)
        : prev.map((p) => (p.id === id ? cap({ ...p, qty }) : p))
    );
  }, []);

  const remove = useCallback<CartCtx["remove"]>((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    return {
      items,
      count,
      subtotal,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, drawerOpen, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
