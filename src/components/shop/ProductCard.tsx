import Link from "next/link";
import type { Locale } from "@/content/seed";
import { formatPrice, pick, type ProductCard as P } from "@/lib/shop";
import MediaSlot from "@/components/MediaSlot";

export default function ProductCard({
  p,
  l,
  symbol,
  priority = false,
}: {
  p: P;
  l: Locale;
  symbol: string;
  /** The first card is above the fold and is usually the LCP — load it eagerly. */
  priority?: boolean;
}) {
  const name = pick(p.name, p.name_bn, l);
  const sub = pick(p.summary, p.summary_bn, l);
  const soldOut = p.trackStock && p.stock <= 0;

  return (
    <Link href={`/${l}/shop/${p.slug}`} className="pcard">
      <MediaSlot name={p.image ?? ""} alt={name} label="Product" ratio="1 / 1" width={600} priority={priority} />
      <div className="pcard-body">
        <span className="pcard-name">{name}</span>
        {sub && <span className="pcard-sub">{sub}</span>}
        <span className="price">
          <b>{formatPrice(p.price, symbol)}</b>
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <s>{formatPrice(p.compareAtPrice, symbol)}</s>
          )}
          {soldOut && (
            <span className="stock-line stock-out ml-auto">
              {l === "bn" ? "স্টক নেই" : "Sold out"}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}
