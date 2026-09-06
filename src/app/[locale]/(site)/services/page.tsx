/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { img } from "@/lib/media";
import { siteUrl } from "@/lib/site-url";
import ChannelIcon from "@/components/ChannelIcon";
import JsonLd from "@/components/JsonLd";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Services — KBS / Kanchan Builders",
  description:
    "Real estate development and complete water-supply solutions: sanitary & plumbing, import & distribution, booster pumps, deep tube wells and water treatment plants.",
};

/** A translucent frosted button that sits on top of the hero photo, in the same
 *  spirit as the see-through header. */
const GLASS =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/20";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const c = await getContent();
  const s = c.servicesPage;
  const t = (v: Record<Locale, string>) => v[l] || v.en;
  const base = siteUrl();

  const resolve = (href: string) =>
    href.startsWith("/") || href.startsWith("#") ? `/${l}${href}` : href;

  const phone = c.site.phone;
  const whatsapp = c.site.whatsapp;

  const ld = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/${l}` },
        { "@type": "ListItem", position: 2, name: t(s.head) },
      ],
    },
  ];

  return (
    <div className="relative z-[2]">
      <JsonLd data={ld} />

      <section data-page-hero className="relative w-full overflow-hidden">
        <div className="relative min-h-[92svh] w-full">
          {s.heroImage && (
            <img
              src={img(s.heroImage, 2400)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,16,26,.62) 0%, rgba(7,16,26,.3) 32%, rgba(7,16,26,.46) 64%, rgba(7,16,26,.86) 100%)",
            }}
          />

          <div className="relative mx-auto flex min-h-[92svh] w-full max-w-[86rem] flex-col justify-between gap-14 px-[clamp(1.25rem,5vw,2.5rem)] pb-12 pt-32 sm:pt-36">
            {/* top-left: heading + sub-heading */}
            <div className="max-w-[44rem]">
              <p className="font-mono-label text-white/75">{t(s.kicker)}</p>
              <h1 className="font-display mt-3 text-[clamp(2.4rem,6.5vw,4rem)] leading-[1.05] text-white">
                {t(s.head)}
              </h1>
              {t(s.subhead) && (
                <p className="mt-6 max-w-[48ch] text-[clamp(1.05rem,1.8vw,1.35rem)] leading-relaxed text-white/85">
                  {t(s.subhead)}
                </p>
              )}
            </div>

            {/* centre: the two big glass CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              {s.ctas
                .filter((cta) => (t(cta.label) && cta.href))
                .map((cta) => (
                  <a
                    key={cta.id}
                    href={resolve(cta.href)}
                    className="group inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-[clamp(0.95rem,1.4vw,1.1rem)] font-medium text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/20 hover:shadow-[0_14px_50px_-10px_rgba(255,255,255,0.3)]"
                  >
                    {t(cta.label)}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </a>
                ))}
            </div>

            {/* bottom: inquiry (left) · call (centre) · whatsapp (right) */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a href={`/${l}/contact?topic=project`} className={GLASS}>
                {t(c.contact.fields.topicProject)}
              </a>

              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className={GLASS}>
                  <ChannelIcon name="phone" size={18} />
                  {phone}
                </a>
              )}

              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={GLASS}
                >
                  <ChannelIcon name="whatsapp" size={18} />
                  {l === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
