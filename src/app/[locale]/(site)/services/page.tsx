import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import MediaSlot from "@/components/MediaSlot";

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
  const t = (v: Record<Locale, string>) => v[l];

  return (
    <div className="page">
      <div className="page-wrap">
        <p className="chip font-mono-label">{t(s.kicker)}</p>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{t(s.head)}</h1>

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

        <div className="mt-16">
          <a href={`/${l}/contact`} className="btn btn-primary">
            {t(c.contact.fields.topicProject)}
          </a>
        </div>
      </div>
    </div>
  );
}
