"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { browserClient } from "@/lib/supabase/browser";

/**
 * Wishlist. Anonymous visitors keep it in localStorage. Once signed in — even
 * if they sign in *after* saving something — the local list is merged into the
 * `wishlists` table and every toggle writes through to the database, so it
 * follows the account across devices.
 */

const KEY = "kbs:wishlist:v1";

type WishlistCtx = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
};

const Ctx = createContext<WishlistCtx | null>(null);

function loadLocal(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function saveLocal(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* private mode / storage disabled */
  }
}
function clearLocal() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    const sb = browserClient();

    /* Pull the account's rows and fold in anything saved locally while signed
       out, so a save-then-login never loses the item. */
    async function syncForUser(uid: string) {
      if (!sb) return;
      userId.current = uid;
      const local = loadLocal();
      const { data: rows } = await sb.from("wishlists").select("product_id").eq("user_id", uid);
      const remote = (rows ?? []).map((r) => String(r.product_id));
      const toAdd = local.filter((id) => !remote.includes(id));
      if (toAdd.length) {
        const { error } = await sb
          .from("wishlists")
          .insert(toAdd.map((id) => ({ user_id: uid, product_id: id })));
        if (error) console.warn("[wishlist] sync failed:", error.message);
      }
      clearLocal();
      setIds(Array.from(new Set([...remote, ...local])));
    }

    if (!sb) {
      setIds(loadLocal());
      return;
    }

    sb.auth.getUser().then(({ data }) => {
      if (data.user) syncForUser(data.user.id);
      else setIds(loadLocal());
    });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        if (userId.current !== session.user.id) syncForUser(session.user.id);
      } else if (event === "SIGNED_OUT") {
        userId.current = null;
        setIds(loadLocal());
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const uid = userId.current;
      const sb = browserClient();
      const on = ids.includes(id);
      const next = on ? ids.filter((x) => x !== id) : [...ids, id];

      setIds(next);
      if (!uid) {
        saveLocal(next);
        return;
      }
      if (!sb) return;
      const run = on
        ? sb.from("wishlists").delete().eq("user_id", uid).eq("product_id", id)
        : sb
            .from("wishlists")
            .upsert({ user_id: uid, product_id: id }, { onConflict: "user_id,product_id" });
      run.then(({ error }) => {
        if (error) console.warn("[wishlist] write failed:", error.message);
      });
    },
    [ids]
  );

  return (
    <Ctx.Provider value={{ ids, has: (id) => ids.includes(id), toggle, count: ids.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist(): WishlistCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
