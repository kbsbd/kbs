"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/content/seed";
import type { Product } from "@/lib/shop";
import { useCart } from "./cart";
import { useWishlist } from "./wishlist";
import { HeartIcon } from "@/components/icons/Icons";

type Labels = {
  addToCart: string;
  buyNow: string;
  outOfStock: string;
  inStock: string;
  lowStock: string;
  wishlist: string;
};

export default function AddToCart({
  product,
  l,
  labels,
}: {
  product: Product;
  l: Locale;
  labels: Labels;
}) {
  const cart = useCart();
  const wishlist = useWishlist();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const soldOut = product.trackStock && product.stock <= 0;
  const max = product.trackStock ? product.stock : 99;
  const low = product.trackStock && product.stock > 0 && product.stock <= 5;
  const saved = wishlist.has(product.id);

  const line = {
    id: product.id,
    slug: product.slug,
    name: l === "bn" && product.name_bn ? product.name_bn : product.name,
    price: product.price,
    image: product.images[0]?.url ?? null,
    stock: product.stock,
    trackStock: product.trackStock,
  };

  function add() {
    if (soldOut) return;
    cart.add(line, qty);
  }
  function buyNow() {
    if (soldOut) return;
    cart.add(line, qty);
    router.push(`/${l}/shop/checkout`);
  }

  return (
    <div className="space-y-4">
      <p
        className={`stock-line ${
          soldOut ? "stock-out" : low ? "stock-low" : "stock-in"
        }`}
      >
        {soldOut
          ? labels.outOfStock
          : low
            ? `${labels.lowStock} — ${product.stock}`
            : product.trackStock
              ? `${labels.inStock} — ${product.stock}`
              : labels.inStock}
      </p>

      {!soldOut && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="qty" aria-label="Quantity">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              disabled={qty >= max}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={add}
          disabled={soldOut}
        >
          {soldOut ? labels.outOfStock : labels.addToCart}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={buyNow}
          disabled={soldOut}
        >
          {labels.buyNow}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          aria-pressed={saved}
          onClick={() => wishlist.toggle(product.id)}
          style={saved ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
        >
          <HeartIcon className="h-[17px] w-[17px]" filled={saved} />
          {saved ? (l === "bn" ? "সেভ করা" : "Saved") : labels.wishlist}
        </button>
      </div>
    </div>
  );
}
