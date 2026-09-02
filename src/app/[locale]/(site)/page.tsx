/* eslint-disable @next/next/no-img-element */
import ReactDOM from "react-dom";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent, getProjects } from "@/lib/content";
import { img, heroSources } from "@/lib/media";
import ScrubHero from "@/components/hero/ScrubHero";
import StructuredData from "@/components/StructuredData";
import BalconyHold from "@/components/sections/BalconyHold";
import BookForm from "@/components/sections/BookForm";
import {
  Premise,
  Building,
  Amenities,
  Trust,
  Faq,
  Projects,
} from "@/components/sections/Sections";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;

  const [c, projectItems] = await Promise.all([getContent(), getProjects()]);
  const t = (v: Record<Locale, string>) => v[l];

  /* The hero poster is painted by the client after hydration, so the preload
     scanner never sees it. Declaring it here makes it the LCP image the browser
     fetches first, in parallel with the JS bundle rather than after it. */
  const posterUrl = img("hero-poster", 1600);
  ReactDOM.preload(posterUrl, { as: "image", fetchPriority: "high" });

  return (
    <>
      <StructuredData c={c} l={l} />
      <ScrubHero
        bands={c.heroBands}
        locale={l}
        sources={{
          h264: { url: heroSources.h264.url(), bytes: heroSources.h264.bytes },
          vp9: { url: heroSources.vp9.url(), bytes: heroSources.vp9.bytes },
        }}
        posterUrl={posterUrl}
        ctaHref="#book"
        scrollLabel={l === "bn" ? "স্ক্রল করুন" : "Scroll"}
      />

      {/* The designed static hero. Only reduced-motion visitors get this
          instead of the scrub now, by the single gate in globals.css.
          It is a composition, not an apology. */}
      <section className="static-hero relative min-h-[100svh]">
        <img
          src={img(c.staticHero.image, 1400)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,16,26,.62) 0%, rgba(7,16,26,.34) 38%, rgba(7,16,26,.94) 100%)",
          }}
        />
        <div className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 sm:px-8">
          <p className="chip font-mono-label self-start">{t(c.staticHero.kicker)}</p>
          <h1 className="font-display mt-6 max-w-[16ch] text-[clamp(2.4rem,9vw,4rem)]">
            {t(c.staticHero.head)}
          </h1>
          <p className="mt-5 max-w-[38ch] leading-relaxed text-[color:var(--text-primary)]/90">
            {t(c.staticHero.sub)}
          </p>
          <div className="mt-8">
            <a href="#book" className="btn btn-primary">
              {t(c.staticHero.cta)}
            </a>
          </div>
        </div>
      </section>

      <Premise c={c} l={l} />
      <Building c={c} l={l} />
      <BalconyHold c={c} l={l} />
      <Amenities c={c} l={l} />
      <Trust c={c} l={l} />
      <Faq c={c} l={l} />
      <Projects c={c} l={l} items={projectItems} />
      <BookForm c={c} l={l} />
    </>
  );
}
