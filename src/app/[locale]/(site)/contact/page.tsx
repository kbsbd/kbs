import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import ContactForm from "@/components/sections/ContactForm";
import ChannelIcon from "@/components/ChannelIcon";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Reach us — KBS / Kanchan Builders",
  description: "Contact KBS / Kanchan Builders about a project, a product or a general enquiry.",
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  const ct = c.contact;
  const t = (v: Record<Locale, string>) => v[l];
  const base = siteUrl();

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
        <p className="chip font-mono-label">{t(ct.kicker)}</p>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(ct.head)}</h1>
        <p className="page-lede mt-5">{t(ct.body)}</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-8">
            <div>
              <h2 className="font-mono-label text-[color:var(--text-quiet)]">
                {t(ct.addressHead)}
              </h2>
              <p className="mt-3 leading-relaxed text-[color:var(--text-secondary)]">
                {t(ct.address)}
              </p>
            </div>

            <div>
              <h2 className="font-mono-label text-[color:var(--text-quiet)]">
                {t(ct.emailHead)}
              </h2>
              <p className="mt-3">
                <a
                  href={`mailto:${c.site.email}`}
                  className="transition-colors duration-300 hover:text-[color:var(--accent)]"
                >
                  {c.site.email}
                </a>
              </p>
            </div>

            {c.site.phone && (
              <div>
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
              <div>
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

            {c.site.mapEmbed ? (
              <iframe
                src={c.site.mapEmbed}
                title="Map"
                loading="lazy"
                className="aspect-[16/10] w-full rounded-lg border border-[color:var(--panel-edge)]"
              />
            ) : null}
          </div>

          <ContactForm c={c} l={l} />
        </div>
      </div>
    </div>
  );
}
