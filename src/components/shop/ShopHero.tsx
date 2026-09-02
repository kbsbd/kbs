/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/content/seed";
import { img } from "@/lib/media";
import { pick } from "@/lib/shop";

type L = { en: string; bn: string };

export type ShopHeroContent = {
  enabled: boolean;
  eyebrow: L;
  title: L;
  subtitle: L;
  image: string;
  ctaLabel: L;
  ctaHref: string;
};

export default function ShopHero({
  hero,
  l,
}: {
  hero: ShopHeroContent;
  l: Locale;
}) {
  const title = pick(hero.title.en, hero.title.bn, l);
  const subtitle = pick(hero.subtitle.en, hero.subtitle.bn, l);
  const eyebrow = pick(hero.eyebrow.en, hero.eyebrow.bn, l);
  const ctaLabel = pick(hero.ctaLabel.en, hero.ctaLabel.bn, l);
  if (!hero.enabled || (!title && !hero.image)) return null;

  return (
    <div className="shop-hero mt-8">
      {img(hero.image) && (
        <img
          src={img(hero.image, 1600)}
          alt=""
          width={1600}
          height={700}
          fetchPriority="high"
        />
      )}
      <div className="shop-hero-body">
        {eyebrow && <p className="font-mono-label text-white/80">{eyebrow}</p>}
        {title && (
          <h2 className="font-display mt-2 text-[clamp(1.8rem,5vw,3rem)]">{title}</h2>
        )}
        {subtitle && (
          <p className="mt-3 max-w-[46ch] leading-relaxed text-white/85">{subtitle}</p>
        )}
        {ctaLabel && hero.ctaHref && (
          <Link
            href={hero.ctaHref.startsWith("http") ? hero.ctaHref : `/${l}${hero.ctaHref}`}
            className="btn btn-primary mt-6 text-sm"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
