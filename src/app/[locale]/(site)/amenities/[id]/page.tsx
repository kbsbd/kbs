/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { img } from "@/lib/media";
import { siteUrl } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";

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
    <div>
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

      {/* Full-bleed hero: the photo runs edge to edge and the heading and
          sub-heading sit on top of it. */}
      <header className="relative w-full overflow-hidden">
        <div className="relative min-h-[64svh] w-full sm:min-h-[72svh]">
          {item.image && (
            <img
              src={img(item.image, 2000)}
              alt={t(item.title)}
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,16,26,.55) 0%, rgba(7,16,26,.18) 34%, rgba(7,16,26,.42) 66%, rgba(7,16,26,.9) 100%)",
            }}
          />
          <div className="relative mx-auto flex min-h-[64svh] max-w-[72rem] flex-col justify-end px-[clamp(1.25rem,5vw,2.5rem)] pb-14 pt-32 sm:min-h-[72svh]">
            <Link
              href={`/${l}#amenities`}
              className="font-mono-label text-white/80 transition-colors hover:text-white"
            >
              ← {back}
            </Link>
            <h1 className="font-display mt-4 max-w-[20ch] text-[clamp(2.2rem,6vw,3.6rem)] text-white">
              {t(item.title)}
            </h1>
            {t(item.body) && (
              <p className="mt-4 max-w-[52ch] text-[clamp(1.05rem,1.7vw,1.3rem)] leading-relaxed text-white/85">
                {t(item.body)}
              </p>
            )}
          </div>
        </div>
      </header>

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
