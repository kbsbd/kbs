import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import MediaSlot from "@/components/MediaSlot";

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

  return (
    <div className="page">
      <div className="page-wrap">
        <p className="chip font-mono-label">{t(k.kicker)}</p>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(k.head)}</h1>
        <p className="page-lede mt-5">
          {t(k.address)} — {t(k.addressNote)}
        </p>

        <MediaSlot
          name={k.gallery[0]?.image ?? ""}
          alt={t(k.head)}
          label="Hero image"
          ratio="16 / 9"
          className="mt-10"
          width={1600}
          priority
        />

        <div className="prose-block mt-10">
          {k.intro.map((p, i) => (
            <p key={i}>{t(p)}</p>
          ))}
        </div>

        <div className="mt-12">
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

        {k.gallery.length > 1 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {k.gallery.slice(1).map((g) => (
              <figure key={g.id}>
                <MediaSlot name={g.image} alt={t(g.caption)} label="Gallery image" ratio="4 / 3" />
                {t(g.caption) && (
                  <figcaption className="mt-2 text-sm text-[color:var(--text-quiet)]">
                    {t(g.caption)}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        <div className="card mt-14">
          <h2 className="font-mono-label text-[color:var(--text-quiet)]">
            {t(c.contact.addressHead)}
          </h2>
          <p className="mt-3 text-[color:var(--text-primary)]">{t(k.address)}</p>
          <p className="mt-1 text-sm text-[color:var(--text-quiet)]">{t(k.addressNote)}</p>
          {k.mapEmbed ? (
            <iframe
              src={k.mapEmbed}
              title="Map"
              loading="lazy"
              className="mt-4 aspect-[16/9] w-full rounded-lg border border-[color:var(--panel-edge)]"
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
