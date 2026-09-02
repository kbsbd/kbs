import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import {
  getProduct,
  getReviews,
  getProducts,
  ratingSummary,
  formatPrice,
  pick,
} from "@/lib/shop";
import { siteUrl } from "@/lib/site-url";
import ProductGallery from "@/components/shop/ProductGallery";
import AddToCart from "@/components/shop/AddToCart";
import ProductCard from "@/components/shop/ProductCard";
import StarRating from "@/components/shop/StarRating";
import ReviewForm from "@/components/shop/ReviewForm";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} — KBS`,
    description: p.summary || p.description.slice(0, 155),
    openGraph: {
      title: p.name,
      description: p.summary,
      images: p.images[0] ? [p.images[0].url] : [],
      url: `${siteUrl()}/shop/${p.slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  if (!c.shop.enabled) notFound();

  const product = await getProduct(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getReviews(product.id),
    getProducts({ category: product.categorySlug ?? undefined, exclude: product.id, limit: 4 }),
  ]);
  const summary = ratingSummary(reviews);
  const s = c.shop;
  const t = (v: Record<Locale, string>) => v[l];
  const name = pick(product.name, product.name_bn, l);
  const description = pick(product.description, product.description_bn, l);
  const off =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="page">
      <div className="page-wrap">
        <nav className="mb-8 text-sm text-[color:var(--text-quiet)]">
          <Link href={`/${l}/shop`} className="hover:text-[color:var(--accent)]">
            {t(s.head)}
          </Link>
          {product.category && (
            <>
              {" / "}
              <Link
                href={`/${l}/shop?category=${product.category.slug}`}
                className="hover:text-[color:var(--accent)]"
              >
                {pick(product.category.name, product.category.name_bn, l)}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} alt={name} />

          <div>
            <h1 className="font-display text-[clamp(1.8rem,4.5vw,2.8rem)]">{name}</h1>

            {summary.count > 0 && (
              <a
                href="#reviews"
                className="mt-3 inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)]"
              >
                <StarRating value={summary.avg} />
                {summary.avg} ({summary.count})
              </a>
            )}

            <div className="price mt-5 text-xl">
              <b>{formatPrice(product.price, s.currencySymbol)}</b>
              {off > 0 && (
                <>
                  <s>{formatPrice(product.compareAtPrice!, s.currencySymbol)}</s>
                  <span className="rounded-full bg-[color:var(--accent-muted)] px-2 py-0.5 text-xs text-[color:var(--accent)]">
                    −{off}%
                  </span>
                </>
              )}
            </div>

            {product.summary && (
              <p className="mt-4 leading-relaxed text-[color:var(--text-secondary)]">
                {pick(product.summary, product.summary_bn, l)}
              </p>
            )}

            <div className="mt-7">
              <AddToCart
                product={product}
                l={l}
                labels={{
                  addToCart: t(s.labels.addToCart),
                  buyNow: t(s.labels.buyNow),
                  outOfStock: t(s.labels.outOfStock),
                  inStock: t(s.labels.inStock),
                  lowStock: t(s.labels.lowStock),
                  wishlist: t(s.labels.wishlist),
                }}
              />
            </div>

            {product.sku && (
              <p className="mt-6 text-xs text-[color:var(--text-quiet)]">SKU: {product.sku}</p>
            )}
          </div>
        </div>

        {description && (
          <div className="prose-block mt-16 max-w-[70ch]">
            <h2 className="font-mono-label text-[color:var(--text-quiet)]">
              {l === "bn" ? "বিবরণ" : "Details"}
            </h2>
            {description.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {/* reviews */}
        <div id="reviews" className="mt-16 border-t border-[color:var(--panel-edge)] pt-10">
          <div className="flex flex-wrap items-baseline gap-4">
            <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)]">{t(s.labels.reviews)}</h2>
            {summary.count > 0 && (
              <span className="flex items-center gap-2 text-[color:var(--text-secondary)]">
                <StarRating value={summary.avg} /> {summary.avg} / 5 · {summary.count}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-[color:var(--text-quiet)]">
                  {l === "bn" ? "এখনও কোনো রিভিউ নেই।" : "No reviews yet."}
                </p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="border-b border-[color:var(--panel-edge)] pb-6 last:border-0">
                    <StarRating value={r.rating} />
                    {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                    <p className="mt-2 leading-relaxed text-[color:var(--text-secondary)]">{r.body}</p>
                    <p className="mt-2 text-xs text-[color:var(--text-quiet)]">
                      {r.authorName} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <ReviewForm productId={product.id} l={l} label={t(s.labels.writeReview)} />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)]">{t(s.labels.relatedHead)}</h2>
            <div className="shop-grid mt-6">
              {related.map((p) => (
                <ProductCard key={p.id} p={p} l={l} symbol={s.currencySymbol} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
