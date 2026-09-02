/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { img } from "@/lib/media";
import ClientCarousel from "@/components/ClientCarousel";

export const metadata: Metadata = {
  title: "Clients — KBS / Kanchan Builders",
  description:
    "Developers, institutions and industrial clients we have delivered sanitary, plumbing and water-treatment work for.",
};

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  const p = c.clientsPage;
  const t = (v: Record<Locale, string>) => v[l];

  return (
    <div className="page">
      <div className="page-wrap">
        <p className="chip font-mono-label">{t(p.kicker)}</p>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(p.head)}</h1>
        <p className="page-lede mt-5">{t(p.body)}</p>

        {p.projects.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-[clamp(1.4rem,3.5vw,2rem)]">{t(p.projectsHead)}</h2>
            <div className="mt-6">
              <ClientCarousel slides={p.projects} />
            </div>
          </section>
        )}

        {p.logos.length === 0 ? (
          <p className="mt-12 text-[color:var(--text-quiet)]">{t(p.empty)}</p>
        ) : (
          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {p.logos.map((logo) => {
              const inner = (
                <span className="media-slot grid aspect-[3/2] place-items-center p-4">
                  {img(logo.image) ? (
                    <img
                      src={img(logo.image, 480)}
                      alt={logo.name}
                      width={240}
                      height={160}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="media-slot-label font-mono-label text-center text-xs">
                      {logo.name || "Logo"}
                    </span>
                  )}
                </span>
              );
              return (
                <li key={logo.id}>
                  {logo.href ? (
                    <a href={logo.href} target="_blank" rel="noopener noreferrer">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
