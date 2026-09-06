import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import MediaSlot from "@/components/MediaSlot";
import ChannelIcon from "@/components/ChannelIcon";
import JsonLd from "@/components/JsonLd";

export const revalidate = 600;

type Cta = {
  id: string;
  label: Record<Locale, string>;
  href: string;
  color: string;
  position: "hero" | "under-hero" | "bottom";
};

function CtaRow({
  ctas,
  at,
  l,
  className = "",
}: {
  ctas: Cta[];
  at: Cta["position"];
  l: Locale;
  className?: string;
}) {
  const here = ctas.filter((x) => x.position === at && (x.label[l] || x.label.en) && x.href);
  if (!here.length) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {here.map((cta) => (
        <a
          key={cta.id}
          href={cta.href}
          className="btn text-sm font-medium text-white"
          style={{
            backgroundColor: cta.color || "var(--accent)",
            borderColor: cta.color || "var(--accent)",
          }}
        >
          {cta.label[l] || cta.label.en}
        </a>
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: "Services — KBS / Kanchan Builders",
  description:
    "Sanitary & plumbing consultancy and works, import & distribution, booster pumps, core hole cutting, deep tube wells and water treatment plants.",
};

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
  /* fall back to English if a card was added with no Bengali yet, so a
     half-translated item never renders blank */
  const t = (v: Record<Locale, string>) => v[l] || v.en;
  const base = siteUrl();

  const ld = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/${l}` },
        { "@type": "ListItem", position: 2, name: t(s.head) },
      ],
    },
    ...s.items.map((it) => ({
      "@type": "Service",
      name: t(it.title),
      description: t(it.body).slice(0, 500),
      serviceType: t(it.title),
      provider: { "@id": `${base}/#org` },
      areaServed: "BD",
    })),
  ];

  return (
    <div className="page">
      <JsonLd data={ld} />
      <div className="page-wrap">
        <p className="chip font-mono-label">{t(s.kicker)}</p>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(s.head)}</h1>

        {s.heroImage && (
          <div className="relative mt-8">
            <MediaSlot
              name={s.heroImage}
              alt={t(s.head)}
              label="Services hero"
              ratio="16 / 9"
              width={1600}
              priority
            />
            <CtaRow
              ctas={s.ctas}
              at="hero"
              l={l}
              className="absolute inset-x-0 bottom-0 justify-center p-5"
            />
          </div>
        )}

        <CtaRow ctas={s.ctas} at="under-hero" l={l} className="mt-8" />

        <div className="prose-block mt-8">
          {s.intro.map((p, i) => (
            <p key={i}>{t(p)}</p>
          ))}
        </div>

        {s.sisterConcerns.length > 0 && (
          <div className="mt-10">
            <h2 className="font-mono-label text-[color:var(--text-quiet)]">
              {t(s.sisterHead)}
            </h2>
            <ul className="mt-4 space-y-1 text-[color:var(--text-secondary)]">
              {s.sisterConcerns.map((x) => (
                <li key={x.id}>
                  <span className="text-[color:var(--text-primary)]">{x.name}</span>
                  {t(x.note) ? ` — ${t(x.note)}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {s.items.map((item) => (
            <article key={item.id} className="card">
              <MediaSlot
                name={item.image}
                alt={t(item.title)}
                label="Service image"
                ratio="16 / 10"
                width={900}
              />
              <h2 className="font-display mt-5 text-[clamp(1.3rem,2.6vw,1.7rem)]">
                {t(item.title)}
              </h2>
              <p className="mt-3 leading-relaxed text-[color:var(--text-secondary)]">
                {t(item.body)}
              </p>
            </article>
          ))}
        </div>

        <CtaRow ctas={s.ctas} at="bottom" l={l} className="mt-16" />

        <div className="mt-16 flex flex-wrap items-center gap-3">
          <a href={`/${l}/contact`} className="btn btn-primary">
            {t(c.contact.fields.topicProject)}
          </a>
          {c.site.phone && (
            <a href={`tel:${c.site.phone.replace(/\s/g, "")}`} className="btn btn-ghost">
              <ChannelIcon name="phone" size={16} />
              {c.site.phone}
            </a>
          )}
          {c.site.whatsapp && (
            <a
              href={`https://wa.me/${c.site.whatsapp.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ borderColor: "#25D366" }}
            >
              <span style={{ color: "#25D366" }}>
                <ChannelIcon name="whatsapp" size={16} />
              </span>
              {c.site.whatsapp}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
