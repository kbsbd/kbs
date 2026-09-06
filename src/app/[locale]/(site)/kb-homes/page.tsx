import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { resolveMapEmbed } from "@/lib/mapEmbed";
import PageHero from "@/components/PageHero";
import KbGallery from "@/components/KbGallery";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "KB Homes — KBS / Kanchan Builders",
  description:
    "KB Homes, Faidabad, Dokhinkhan, Dhaka - 1230: contemporary architecture and natural living, close to Hazrat Shahjalal International Airport.",
};

export default async function KbHomesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  const k = c.kbHomes;
  const t = (v: Record<Locale, string>) => v[l] || v.en;
  const mapSrc = await resolveMapEmbed(k.mapEmbed || c.site.mapEmbed);

  const [lead, ...more] = k.intro;
  const galleryItems = k.gallery
    .filter((g) => g.image)
    .map((g) => ({ image: g.image, title: t(g.caption) }));

  return (
    <div className="relative z-[2]">
      <PageHero
        image={k.gallery[0]?.image}
        kicker={t(k.kicker)}
        title={t(k.head)}
        subtitle={`${t(k.address)} — ${t(k.addressNote)}`}
      />

      <div className="page-wrap pt-14">
        <div className="prose-block">{lead && <p>{t(lead)}</p>}</div>

        {more.length > 0 && (
          <details className="group mt-3">
            <summary className="font-mono-label inline-flex cursor-pointer list-none items-center gap-2 text-[color:var(--accent)] [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">
                {l === "bn" ? "সম্পূর্ণ বিবরণ পড়ুন" : "Read the full overview"}
              </span>
              <span className="hidden group-open:inline">
                {l === "bn" ? "সংক্ষিপ্ত করুন" : "Show less"}
              </span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-open:rotate-180"
              >
                ↓
              </span>
            </summary>
            <div className="prose-block mt-4">
              {more.map((p, i) => (
                <p key={i}>{t(p)}</p>
              ))}
            </div>
          </details>
        )}
      </div>

      {galleryItems.length > 0 && (
        <div className="my-14">
          <KbGallery items={galleryItems} label={t(k.head)} />
        </div>
      )}

      <div className="page-wrap pb-14 pt-12">
        <div>
          <h2 className="font-mono-label text-[color:var(--text-quiet)]">
            {l === "bn" ? "Highlights" : "Highlights"}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {k.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-baseline gap-2 text-[color:var(--text-secondary)]"
              >
                <span aria-hidden="true" className="text-[color:var(--accent)]">
                  —
                </span>
                {t(h)}
              </li>
            ))}
          </ul>
        </div>

        <div className="card mt-14">
          <h2 className="font-mono-label text-[color:var(--text-quiet)]">
            {t(c.contact.addressHead)}
          </h2>
          <p className="mt-3 text-[color:var(--text-primary)]">{t(k.address)}</p>
          <p className="mt-1 text-sm text-[color:var(--text-quiet)]">{t(k.addressNote)}</p>
          {mapSrc ? (
            <iframe
              src={mapSrc}
              title="Map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-4 aspect-[16/10] w-full rounded-lg border border-[color:var(--panel-edge)]"
            />
          ) : null}
          <div className="mt-6">
            <a href={`/${l}#book`} className="btn btn-primary">
              {t(k.cta)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
