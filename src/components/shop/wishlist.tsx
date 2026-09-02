"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { browserClient } from "@/lib/supabase/browser";

/**
 * Wishlist. Anonymous visitors keep it in localStorage. Once signed in, the
 * local list is merged into the `wishlists` table and every toggle writes
 * through to the database, so it follows the account across devices.
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
  const userId = useRef<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const local = load();
    const sb = browserClient();

    async function init() {
      const { data } = (await sb?.auth.getUser()) ?? { data: { user: null } };
      if (sb && data.user) {
        userId.current = data.user.id;
        const { data: rows } = await sb.from("wishlists").select("product_id").eq("user_id", data.user.id);
        const remote = (rows ?? []).map((r) => String(r.product_id));
        const merged = Array.from(new Set([...remote, ...local]));
        // push anything that was only local
        const toAdd = local.filter((id) => !remote.includes(id));
        if (toAdd.length) {
          await sb.from("wishlists").insert(toAdd.map((id) => ({ user_id: data.user!.id, product_id: id })));
        }
        setIds(merged);
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
      } else {
        setIds(local);
      }
      hydrated.current = true;
    }
    init();
  }, []);

  useEffect(() => {
    if (!hydrated.current || userId.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const on = prev.includes(id);
      const next = on ? prev.filter((x) => x !== id) : [...prev, id];
      const sb = browserClient();
      const uid = userId.current;
      if (sb && uid) {
        if (on) sb.from("wishlists").delete().eq("user_id", uid).eq("product_id", id).then(() => {});
        else sb.from("wishlists").insert({ user_id: uid, product_id: id }).then(() => {});
      }
      return next;
    });
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
