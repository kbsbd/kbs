"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/content/seed";
import type { ProductCard as P, Category } from "@/lib/shop";
import { pick } from "@/lib/shop";
import ProductCard from "@/components/shop/ProductCard";
import { SearchIcon, CloseIcon } from "@/components/icons/Icons";

/**
 * The shop storefront: a search field, the category filter, and the grid.
 * Filtering is done here on the already-loaded catalogue, so a search or a
 * category switch is instant and there is a single cached /shop page rather
 * than one per category.
 */
export default function ShopBrowser({
  products,
  categories,
  l,
  symbol,
  initialCategory,
  searchEnabled,
  searchPlaceholder,
  emptyNote,
}: {
  products: P[];
  categories: Category[];
  l: Locale;
  symbol: string;
  initialCategory?: string;
  searchEnabled: boolean;
  searchPlaceholder: string;
  emptyNote: string;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(initialCategory ?? "");

  const chooseCat = (slug: string) => {
    setCat(slug);
    const url = slug ? `?category=${slug}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat && p.categorySlug !== cat) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.name_bn.toLowerCase().includes(needle) ||
        p.summary.toLowerCase().includes(needle) ||
        p.summary_bn.toLowerCase().includes(needle)
      );
    });
  }, [products, q, cat]);

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {searchEnabled && (
          <div className="shop-search">
            <SearchIcon className="h-[18px] w-[18px] shrink-0 text-[color:var(--text-quiet)]" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label={l === "bn" ? "মুছুন" : "Clear"}
                className="shrink-0 text-[color:var(--text-quiet)] hover:text-[color:var(--text-primary)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => chooseCat("")}
              className={`btn text-sm ${!cat ? "btn-primary" : "btn-ghost"}`}
              aria-pressed={!cat}
            >
              {l === "bn" ? "সব" : "All"}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => chooseCat(c.slug)}
                className={`btn text-sm ${cat === c.slug ? "btn-primary" : "btn-ghost"}`}
                aria-pressed={cat === c.slug}
              >
                {pick(c.name, c.name_bn, l)}
              </button>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <p className="mt-14 text-[color:var(--text-quiet)]">
          {q.trim()
            ? l === "bn"
              ? `“${q.trim()}” এর জন্য কিছু পাওয়া যায়নি।`
              : `Nothing matches “${q.trim()}”.`
            : emptyNote}
        </p>
      ) : (
        <div className="shop-grid mt-8">
          {results.map((p, i) => (
            <ProductCard key={p.id} p={p} l={l} symbol={symbol} priority={i < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
