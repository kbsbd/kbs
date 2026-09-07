import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import ServiceCards from "@/components/ServiceCards";

export const revalidate = 600;

const pick = (v: Record<Locale, string>, l: Locale) => v[l] || v.en;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "en";
  const c = await getContent();
  const re = c.realEstatePage;
  return {
    title: `${pick(re.head, l)} — KBS / Kanchan Builders`,
    description: pick(re.subhead, l).slice(0, 200),
    alternates: {
      canonical: `${siteUrl()}/${l}/real-estate-development`,
      languages: Object.fromEntries(
        LOCALES.map((x) => [x, `${siteUrl()}/${x}/real-estate-development`])
      ),
    },
  };
}

export default async function RealEstateDevelopmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  const re = c.realEstatePage;
  const t = (v: Record<Locale, string>) => v[l] || v.en;
  const base = siteUrl();

  const cards = c.servicesPage.items
    .filter((it) => t(it.title))
    .map((it) => ({ id: it.id, image: it.image, title: t(it.title), body: t(it.body) }));

  const ld = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/${l}` },
        { "@type": "ListItem", position: 2, name: t(re.head) },
      ],
    },
    ...cards.map((it) => ({
      "@type": "Service",
      name: it.title,
      description: it.body.slice(0, 500),
      provider: { "@id": `${base}/#org` },
      areaServed: "BD",
    })),
  ];

  return (
    <div className="relative z-[2]">
      <JsonLd data={ld} />

      <PageHero image={re.heroImage} kicker={t(re.kicker)} title={t(re.head)} />

      <div className="page-wrap py-14">
        <div className="prose-block max-w-[68ch]">
          <p>{t(re.subhead)}</p>
        </div>

        {cards.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)]">
              {t(re.servicesHead)}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[color:var(--text-secondary)]">
              {l === "bn"
                ? "যেকোনো কার্ডে ক্লিক করে বিস্তারিত দেখুন।"
                : "Tap any card for the full detail."}
            </p>
            <div className="mt-8">
              <ServiceCards
                items={cards}
                moreLabel={l === "bn" ? "বিস্তারিত" : "Read more"}
              />
            </div>
          </div>
        )}

        <div className="mt-16">
          <Link href={`/${l}/contact?topic=project`} className="btn btn-primary">
            {t(re.cta)}
          </Link>
        </div>
      </div>
    </div>
  );
}
