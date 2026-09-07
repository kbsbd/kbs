import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { resolveMapEmbed } from "@/lib/mapEmbed";
import { siteUrl } from "@/lib/site-url";
import ContactForm from "@/components/sections/ContactForm";
import ChannelIcon from "@/components/ChannelIcon";
import JsonLd from "@/components/JsonLd";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Reach us — KBS / Kanchan Builders",
  description: "Contact KBS / Kanchan Builders about a project, a product or a general enquiry.",
};

const TOPICS = ["general", "project", "product"] as const;
type Topic = (typeof TOPICS)[number];

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const { topic } = await searchParams;
  const initialTopic: Topic = TOPICS.includes(topic as Topic) ? (topic as Topic) : "general";
  const c = await getContent();
  const ct = c.contact;
  const t = (v: Record<Locale, string>) => v[l] || v.en;
  const base = siteUrl();
  const mapSrc = await resolveMapEmbed(c.site.mapEmbed);

  const ld = [
    {
      "@type": "ContactPage",
      "@id": `${base}/${l}/contact#page`,
      name: t(ct.head),
      about: { "@id": `${base}/#org` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/${l}` },
        { "@type": "ListItem", position: 2, name: t(ct.head) },
      ],
    },
  ];

  return (
    <div className="page">
      <JsonLd data={ld} />
      <div className="page-wrap">
        <header className="max-w-[46rem]">
          <p className="chip font-mono-label">{t(ct.kicker)}</p>
          <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(ct.head)}</h1>
          <p className="page-lede mt-5">{t(ct.body)}</p>
        </header>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          <div className="flex flex-col gap-6">
          <aside className="card divide-y divide-[color:var(--panel-edge)]">
            <div className="pb-6">
              <h2 className="font-mono-label text-[color:var(--text-quiet)]">
                {t(ct.addressHead)}
              </h2>
              <p className="mt-3 leading-relaxed text-[color:var(--text-secondary)]">
                {t(ct.address)}
              </p>
            </div>

            <div className="py-6">
              <h2 className="font-mono-label text-[color:var(--text-quiet)]">
                {t(ct.emailHead)}
              </h2>
              <p className="mt-3">
                <a
                  href={`mailto:${c.site.email}`}
                  className="break-all transition-colors duration-300 hover:text-[color:var(--accent)]"
                >
                  {c.site.email}
                </a>
              </p>
            </div>

            {c.site.phone && (
              <div className="py-6">
                <h2 className="font-mono-label text-[color:var(--text-quiet)]">
                  {t(ct.phoneHead)}
                </h2>
                <p className="mt-3">
                  <a
                    href={`tel:${c.site.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2.5 transition-colors duration-300 hover:text-[color:var(--accent)]"
                  >
                    <ChannelIcon name="phone" size={18} />
                    {c.site.phone}
                  </a>
                </p>
              </div>
            )}

            {c.site.whatsapp && (
              <div className="pt-6">
                <h2 className="font-mono-label text-[color:var(--text-quiet)]">
                  {t(ct.whatsappHead)}
                </h2>
                <p className="mt-3">
                  <a
                    href={`https://wa.me/${c.site.whatsapp.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 transition-colors duration-300 hover:text-[color:var(--accent)]"
                  >
                    <ChannelIcon name="whatsapp" size={18} />
                    {c.site.whatsapp}
                  </a>
                </p>
              </div>
            )}
          </aside>

          {mapSrc ? (
            <iframe
              src={mapSrc}
              title="Map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full rounded-2xl border border-[color:var(--panel-edge)] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[240px] lg:flex-1"
            />
          ) : null}
          </div>

          <ContactForm c={c} l={l} initialTopic={initialTopic} />
        </div>
      </div>
    </div>
  );
}
