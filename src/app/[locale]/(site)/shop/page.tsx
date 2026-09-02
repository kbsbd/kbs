import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { getProducts, getCategories, pick } from "@/lib/shop";
import ShopHero from "@/components/shop/ShopHero";
import FeaturedCarousel, { type FeaturedSlide } from "@/components/shop/FeaturedCarousel";
import ShopBrowser from "@/components/shop/ShopBrowser";

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

  const [products, featured, categories] = await Promise.all([
    getProducts(),
    getProducts({ featured: true, limit: 12 }),
    getCategories(),
  ]);

  // curated slides win; otherwise fall back to products flagged "featured"
  const curated = s.featured.slides.filter((x) => x.image);
  const slides: FeaturedSlide[] =
    curated.length > 0
      ? curated.map((x) => ({
          id: x.id,
          image: x.image,
          title: pick(x.title.en, x.title.bn, l),
          subtitle: pick(x.subtitle.en, x.subtitle.bn, l),
          href: x.href
            ? x.href.startsWith("http")
              ? x.href
              : `/${l}${x.href}`
            : `/${l}/shop`,
        }))
      : featured.map((p) => ({
          id: p.id,
          image: p.image ?? "",
          title: pick(p.name, p.name_bn, l),
          subtitle: pick(p.summary, p.summary_bn, l),
          href: `/${l}/shop/${p.slug}`,
        }));

  return (
    <div className="page">
      <div className="page-wrap">
        <p className="chip font-mono-label">{t(s.kicker)}</p>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(s.head)}</h1>
        <p className="page-lede mt-5">{t(s.body)}</p>

        <ShopHero hero={s.hero} l={l} />

        {s.featured.enabled && slides.length > 0 && (
          <FeaturedCarousel slides={slides} heading={t(s.featured.heading)} />
        )}

        <ShopBrowser
          products={products}
          categories={categories}
          l={l}
          symbol={s.currencySymbol}
          initialCategory={category}
          searchEnabled={s.search.enabled}
          searchPlaceholder={t(s.search.placeholder)}
          emptyNote={t(s.emptyNote)}
        />
      </div>
    </div>
  );
}
