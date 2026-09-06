import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { img } from "@/lib/media";
import { siteUrl } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";

/* Same ISR window as the landing page: these read the identical content, so an
   admin edit reaching one and not the other would be the confusing outcome. */
export const revalidate = 600;

const pick = (v: Record<Locale, string>, l: Locale) => v[l] || v.en;

async function find(id: string) {
  const c = await getContent();
  const items = c.amenities.items;
  const i = items.findIndex((a) => a.id === id);
  return i === -1 ? null : { c, item: items[i], prev: items[i - 1], next: items[i + 1] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const l = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "en";
  const hit = await find(id);
  if (!hit) return { title: "Not found" };
  const title = pick(hit.item.title, l);
  const description = pick(hit.item.body, l);
  return {
    title: `${title} — KB Homes`,
    description,
    alternates: {
      canonical: `${siteUrl()}/${l}/amenities/${id}`,
      languages: Object.fromEntries(
        LOCALES.map((x) => [x, `${siteUrl()}/${x}/amenities/${id}`])
      ),
    },
    openGraph: { title, description, images: [{ url: img(hit.item.image, 1200) }] },
  };
}

export default async function AmenityDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const hit = await find(id);
  if (!hit) notFound();
  const { c, item, prev, next } = hit;
  const t = (v: Record<Locale, string>) => pick(v, l);
  const base = siteUrl();

  const back = l === "bn" ? "সব সুবিধা" : "All amenities";
  const cta = l === "bn" ? "সাইট ভিজিট বুক করুন" : "Book a site visit";

  return (
    <div className="relative z-[2]">
      <JsonLd
        data={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${base}/${l}` },
              {
                "@type": "ListItem",
                position: 2,
                name: t(c.amenities.head),
                item: `${base}/${l}#amenities`,
              },
              { "@type": "ListItem", position: 3, name: t(item.title) },
            ],
          },
        ]}
      />

      <PageHero
        image={item.image}
        title={t(item.title)}
        subtitle={t(item.body)}
        back={{ href: `/${l}#amenities`, label: back }}
      />

      <div className="page-wrap py-14">
        <Link href={`/${l}#book`} className="btn btn-primary">
          {cta}
        </Link>

        {(prev || next) && (
          <nav
            aria-label={back}
            className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-[color:var(--panel-edge)] pt-6 text-sm"
          >
            {prev && (
              <Link
                href={`/${l}/amenities/${prev.id}`}
                className="text-[color:var(--text-secondary)] hover:underline"
              >
                ← {pick(prev.title, l)}
              </Link>
            )}
            {next && (
              <Link
                href={`/${l}/amenities/${next.id}`}
                className="ml-auto text-[color:var(--text-secondary)] hover:underline"
              >
                {pick(next.title, l)} →
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
