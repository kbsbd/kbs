/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import ReactDOM from "react-dom";
import { notFound } from "next/navigation";
import { LOCALES, clampAppearance, type Locale } from "@/content/seed";
import { getContent, getProjects } from "@/lib/content";
import { img, heroSources } from "@/lib/media";
import ScrubHero from "@/components/hero/ScrubHero";
import StructuredData from "@/components/StructuredData";
import { VideoSection } from "@/components/sections/VideoSection";
import BookForm from "@/components/sections/BookForm";
import {
  Premise,
  Building,
  Amenities,
  Faq,
  Projects,
} from "@/components/sections/Sections";

/* ISR so admin content and menu edits reach the landing page without a
   redeploy (the CMS menu also invalidates via its own cache tag). */
export const revalidate = 600;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;

  const [c, projectItems] = await Promise.all([getContent(), getProjects()]);
  const t = (v: Record<Locale, string>) => v[l] || v.en;
  const heroScale = clampAppearance("heroScale", c.appearance.heroScale);

  /* The two frames a visitor actually stops on — the first frame of the scrub
     and the frame it settles on — are served as stills straight from the
     2560x1440 master, not as video frames. `HERO_STILL_SIZES`: the stills are
     16:9 and object-fit:cover a full viewport, so on a portrait phone the
     rendered width is driven by the viewport HEIGHT (h * 16/9 = 177.8vh), not
     its width. Plain "100vw" understates that by ~4x on a phone and is what
     made the hero look soft. */
  const HERO_WIDTHS = [960, 1280, 1600, 1920, 2560];
  const HERO_STILL_SIZES = "max(100vw, 177.8vh)";
  const heroStill = (name: string) => ({
    url: img(name, 1920, "auto:good"),
    srcSet: HERO_WIDTHS.map((w) => `${img(name, w, "auto:good")} ${w}w`).join(", "),
  });

  const poster = heroStill("hero-poster");
  const ending = heroStill("hero-ending");

  /* The poster is the LCP — preload it ahead of the JS bundle. The ending
     still is not preloaded: it is only needed once the scrub has run its
     course, so it stays lazy and off the critical path. */
  ReactDOM.preload(poster.url, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: poster.srcSet,
    imageSizes: HERO_STILL_SIZES,
  });

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
        posterUrl={poster.url}
        posterSrcSet={poster.srcSet}
        endingUrl={ending.url}
        endingSrcSet={ending.srcSet}
        stillSizes={HERO_STILL_SIZES}
        ctaHref="#book"
        scrollLabel={l === "bn" ? "স্ক্রল করুন" : "Scroll"}
        heroScale={heroScale}
      />

      {/* The designed static hero. Only reduced-motion visitors get this
          instead of the scrub now, by the single gate in globals.css — for
          everyone else the section is display:none, so the image is left
          lazy and low priority and never competes with the scrub poster
          (the real LCP) for bandwidth. */}
      <section
        className="static-hero relative min-h-[100svh]"
        style={{ "--hero-scale": heroScale } as CSSProperties}
      >
        <img
          src={img(c.staticHero.image, 1400)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          fetchPriority="low"
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
          <h1
            className="font-display mt-6 max-w-[16ch]"
            style={{ fontSize: "calc(clamp(2.4rem, 9vw, 4rem) * var(--hero-scale, 1))" }}
          >
            {t(c.staticHero.head)}
          </h1>
          <p className="sub-line mt-5 max-w-[38ch] leading-relaxed">
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
      <VideoSection c={c} l={l} />
      <Amenities c={c} l={l} />
      <Faq c={c} l={l} />
      <Projects c={c} l={l} items={projectItems} />
      <BookForm c={c} l={l} />
    </>
  );
}
