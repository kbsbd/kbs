import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { img } from "@/lib/media";
import { siteUrl } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";

/* Same ISR window as the landing page: this reads the identical content, so an
   admin edit reaching one and not the other would be the confusing outcome. */
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
  const title = pick(c.building.head, l);
  const description = pick(c.building.body, l);
  return {
    title: `${title} — KB Homes`,
    description,
    alternates: {
      canonical: `${siteUrl()}/${l}/building`,
      languages: Object.fromEntries(
        LOCALES.map((x) => [x, `${siteUrl()}/${x}/building`])
      ),
    },
    openGraph: { title, description, images: [{ url: img(c.building.image, 1200) }] },
  };
}

export default async function BuildingDetail({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  const t = (v: Record<Locale, string>) => pick(v, l);
  const base = siteUrl();
  const b = c.building;

  const back = l === "bn" ? "হোমে ফিরুন" : "Back to home";
  const cta = l === "bn" ? "সাইট ভিজিট বুক করুন" : "Book a site visit";
  const specsLabel = l === "bn" ? "মূল তথ্য" : "Key figures";

  return (
    <div>
      <JsonLd
        data={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${base}/${l}` },
              { "@type": "ListItem", position: 2, name: t(b.head) },
            ],
          },
        ]}
      />

      <PageHero
        image={b.image}
        kicker={t(b.kicker)}
        title={t(b.head)}
        subtitle={t(b.body)}
        back={{ href: `/${l}#building`, label: back }}
      />

      <div className="page-wrap py-14">
        <h2 className="font-mono-label text-[color:var(--text-quiet)]">
          {specsLabel}
        </h2>
        <dl className="mt-4 grid gap-x-12 border-y border-[color:var(--panel-edge)] sm:grid-cols-2">
          {b.specs.map((s) => (
            <div
              key={s.id}
              className="flex items-baseline justify-between gap-6 border-b border-[color:var(--panel-edge)] py-4 last:border-b-0"
            >
              <dt className="font-mono-label text-[color:var(--text-quiet)]">
                {t(s.label)}
              </dt>
              <dd className="font-display text-right text-lg sm:text-xl">
                {t(s.value)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">
          <Link href={`/${l}#book`} className="btn btn-primary">
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
