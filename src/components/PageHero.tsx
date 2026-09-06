/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { img } from "@/lib/media";

/**
 * The full-bleed page hero shared by every standalone page that has one. The
 * photo runs the full width of the device; an optional back link, the kicker,
 * the heading and the sub-heading all sit on top of it over a legibility
 * gradient. When no image is set it falls back to a plain header band so the
 * page still has its title.
 *
 * The text column lines up with `.page-wrap` (max-width 72rem) so it sits
 * directly above the body content.
 */
export default function PageHero({
  image,
  width = 2000,
  kicker,
  title,
  subtitle,
  back,
  children,
}: {
  image?: string;
  width?: number;
  kicker?: string;
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  /** extra content under the sub-heading, e.g. a row of call-to-action buttons */
  children?: React.ReactNode;
}) {
  const src = image ? img(image, width) : "";

  if (!src) {
    return (
      <header className="page-wrap pb-6 pt-32">
        {back && (
          <Link
            href={back.href}
            className="font-mono-label text-[color:var(--clay)] hover:underline"
          >
            ← {back.label}
          </Link>
        )}
        {kicker && <p className="chip font-mono-label mt-6">{kicker}</p>}
        <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,3.6rem)]">{title}</h1>
        {subtitle && <p className="page-lede mt-5">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </header>
    );
  }

  return (
    <header className="relative w-full overflow-hidden">
      <div className="relative min-h-[62svh] w-full sm:min-h-[70svh]">
        <img
          src={src}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,16,26,.55) 0%, rgba(7,16,26,.18) 34%, rgba(7,16,26,.44) 66%, rgba(7,16,26,.9) 100%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[62svh] max-w-[72rem] flex-col justify-end px-[clamp(1.25rem,5vw,2.5rem)] pb-14 pt-32 sm:min-h-[70svh]">
          {back && (
            <Link
              href={back.href}
              className="font-mono-label text-white/80 transition-colors hover:text-white"
            >
              ← {back.label}
            </Link>
          )}
          {kicker && <p className="font-mono-label mt-4 text-white/75">{kicker}</p>}
          <h1 className="font-display mt-3 max-w-[20ch] text-[clamp(2.2rem,6vw,3.6rem)] text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-[54ch] text-[clamp(1.05rem,1.7vw,1.3rem)] leading-relaxed text-white/85">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </header>
  );
}
