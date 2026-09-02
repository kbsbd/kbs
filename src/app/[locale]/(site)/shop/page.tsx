import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { getProducts, getCategories, pick } from "@/lib/shop";
import ProductCard from "@/components/shop/ProductCard";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Shop — KBS / Kanchan Builders",
  description:
    "Sanitary ware, plumbing fittings, pumps, CPVC pipe and water-treatment equipment.",
};

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  if (!c.shop.enabled) notFound();
  const s = c.shop;
  const t = (v: Record<Locale, string>) => v[l];

  const [products, categories] = await Promise.all([
    getProducts({ category }),
    getCategories(),
  ]);

  return (
    <div className="page">
      <div className="page-wrap">
        <p className="chip font-mono-label">{t(s.kicker)}</p>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(s.head)}</h1>
        <p className="page-lede mt-5">{t(s.body)}</p>

        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href={`/${l}/shop`}
              className={`btn text-sm ${!category ? "btn-primary" : "btn-ghost"}`}
            >
              {l === "bn" ? "সব" : "All"}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${l}/shop?category=${cat.slug}`}
                className={`btn text-sm ${category === cat.slug ? "btn-primary" : "btn-ghost"}`}
              >
                {pick(cat.name, cat.name_bn, l)}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <p className="mt-14 text-[color:var(--text-quiet)]">{t(s.emptyNote)}</p>
        ) : (
          <div className="shop-grid mt-12">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} l={l} symbol={s.currencySymbol} priority={i < 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
