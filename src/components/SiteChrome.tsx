"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, SiteContent } from "@/content/seed";
import FixedActions from "@/components/FixedActions";
import CartButton from "@/components/shop/CartButton";

/**
 * Everything that wraps the page: the nav, the footer, the living line, the
 * drifting motes, the section entrance observer, and the animation pause
 * manager. All motion here is transform and opacity only, and all of it is
 * pinned to final states under reduced motion.
 */

const LEAF_STOPS = [0.16, 0.31, 0.46, 0.6, 0.74, 0.88];

export default function SiteChrome({
  content,
  locale,
  children,
}: {
  content: SiteContent;
  locale: Locale;
  children: React.ReactNode;
}) {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const spineRef = useRef<SVGSVGElement>(null);
  const pathname = usePathname();
  const other: Locale = locale === "en" ? "bn" : "en";
  const otherPath = pathname.replace(/^\/(en|bn)/, `/${other}`) || `/${other}`;
  const shopOn = content.shop.enabled;
  const navLinks = content.nav.links.filter((x) => x.href !== "/shop" || shopOn);
  const closeMenu = () => setMenuOpen(false);

  /* section entrances, and retiring the stagger when they finish */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("in");
          window.setTimeout(() => el.classList.add("done"), 1400);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [children]);

  /* the living line draws with page progress and lights its leaves */
  useEffect(() => {
    const svg = spineRef.current;
    if (!svg) return;
    const stem = svg.querySelector<SVGPathElement>(".stem");
    if (stem) {
      const len = stem.getTotalLength();
      stem.style.setProperty("--len", String(len));
    }

    let raf: number | null = null;
    let last = -1;

    const write = () => {
      raf = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      svg.style.setProperty("--draw", String(p));
      LEAF_STOPS.forEach((stop, i) => {
        const lit = p >= stop ? 1 : Math.max(0, 1 - (stop - p) * 26);
        const leaf = svg.querySelector<SVGGElement>(`[data-leaf="${i}"]`);
        leaf?.style.setProperty("--lit", lit.toFixed(3));
      });
    };
    const onScroll = () => {
      setNavSolid(window.scrollY > window.innerHeight * 0.9);
      if (raf === null) raf = requestAnimationFrame(write);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  /* pause every animation on a hidden tab. animation-play-state does not
     inherit, so the CSS rule targets elements and pseudo-elements alike. */
  useEffect(() => {
    const onVis = () => document.body.classList.toggle("paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const t = (v: Record<Locale, string>) => v[locale];
  /* "/path" and "#section" are both site-internal and get the locale prefix;
     a "#section" link resolves against the home page from anywhere. */
  const navHref = (href: string) =>
    href.startsWith("/") || href.startsWith("#") ? `/${locale}${href}` : href;

  return (
    <>
      <div className="motes" aria-hidden="true">
        {[
          [8, 0], [22, -7], [37, -14], [54, -3], [69, -19], [83, -9], [93, -24],
          [15, -30], [46, -26], [76, -34],
        ].map(([left, delay], i) => (
          <span
            key={i}
            className="mote"
            style={{ left: `${left}%`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <div className="spine" aria-hidden="true">
        <svg ref={spineRef} viewBox="0 0 44 800" preserveAspectRatio="none">
          <path className="stem" d="M22 0 C 22 200, 22 400, 22 800" />
          {LEAF_STOPS.map((stop, i) => (
            <g key={i} data-leaf={i} className="leaf" transform={`translate(22 ${stop * 800})`}>
              <path
                d={
                  i % 2 === 0
                    ? "M0 0 C 11 -6, 19 -1, 19 5 C 19 11, 10 13, 0 7 Z"
                    : "M0 0 C -11 -6, -19 -1, -19 5 C -19 11, -10 13, 0 7 Z"
                }
              />
            </g>
          ))}
        </svg>
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          navSolid
            ? "border-b border-[color:var(--panel-edge)] bg-[color:var(--canvas)]/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        {/* over live footage the nav needs its own scrim, or the links sit on
            bright concrete. It fades out once the page has a solid background. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 transition-opacity duration-500"
          style={{
            opacity: navSolid ? 0 : 1,
            background:
              "linear-gradient(180deg, rgba(7,16,26,.72) 0%, rgba(7,16,26,.38) 52%, transparent 100%)",
          }}
        />
        <nav className="relative mx-auto flex max-w-[86rem] items-center gap-6 px-5 py-4 sm:px-8">
          <Link href={`/${locale}`} className="flex items-center gap-2.5" aria-label="KBS">
            <Mark />
            <span className="font-display text-lg tracking-tight">KBS</span>
          </Link>

          <div className="ml-auto hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={navHref(link.href)}
                className="text-sm text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--text-primary)]"
              >
                {t(link.label)}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-5 lg:ml-0 lg:gap-6">
            <Link
              href={otherPath}
              className="text-sm text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--accent)]"
              hrefLang={other}
            >
              {t(content.nav.langLabel)}
            </Link>

            {shopOn && <CartButton label={t(content.shop.labels.cart)} />}

            <a
              href={`/${locale}#book`}
              className="btn btn-primary hidden text-sm sm:inline-flex"
            >
              {t(content.nav.cta)}
            </a>

            <button
              type="button"
              className="lg:hidden text-[color:var(--text-secondary)]"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="relative border-t border-[color:var(--panel-edge)] bg-[color:var(--canvas)]/95 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-[86rem] flex-col px-5 py-3 sm:px-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={navHref(link.href)}
                  onClick={closeMenu}
                  className="border-b border-[color:var(--panel-edge)] py-3 text-[color:var(--text-secondary)] last:border-0 hover:text-[color:var(--text-primary)]"
                >
                  {t(link.label)}
                </a>
              ))}
              <a
                href={`/${locale}#book`}
                onClick={closeMenu}
                className="btn btn-primary mt-3 self-start text-sm"
              >
                {t(content.nav.cta)}
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="relative z-[2] border-t border-[color:var(--panel-edge)] bg-[color:var(--canvas-deep)]">
        <div className="mx-auto grid max-w-[86rem] gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <Mark />
              <span className="font-display text-xl">KBS</span>
            </div>
            <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-[color:var(--text-secondary)]">
              {t(content.site.tagline)}
            </p>
          </div>

          <div>
            <h2 className="font-mono-label text-[color:var(--text-quiet)]">
              {t(content.footer.contactHead)}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {content.site.phone && (
                <li>
                  <a
                    href={`tel:${content.site.phone.replace(/\s/g, "")}`}
                    className="transition-colors duration-300 hover:text-[color:var(--accent)]"
                  >
                    {content.site.phone}
                  </a>
                </li>
              )}
              {content.site.email && (
                <li>
                  <a
                    href={`mailto:${content.site.email}`}
                    className="transition-colors duration-300 hover:text-[color:var(--accent)]"
                  >
                    {content.site.email}
                  </a>
                </li>
              )}
              {content.site.socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    className="transition-colors duration-300 hover:text-[color:var(--accent)]"
                    rel="noopener"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono-label text-[color:var(--text-quiet)]">
              {t(content.footer.visitHead)}
            </h2>
            <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-[color:var(--text-secondary)]">
              {t(content.site.address) || t(content.footer.addressMissing)}
            </p>
          </div>
        </div>

        <div className="border-t border-[color:var(--panel-edge)]">
          <div className="mx-auto flex max-w-[86rem] flex-wrap items-baseline justify-between gap-3 px-5 py-6 text-xs text-[color:var(--text-quiet)] sm:px-8">
            <span>
              © {new Date().getFullYear()} {content.site.name}. {t(content.footer.rights)}
            </span>
            <span className="font-mono-label">SINCE {content.site.founded}</span>
          </div>
        </div>
      </footer>

      <FixedActions
        locale={locale}
        phone={content.site.phone}
        whatsapp={content.site.whatsapp}
      />
    </>
  );
}

/** The pinwheel from the KBS mark, redrawn as vector so it stays crisp. */
function Mark({ spin = false }: { spin?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`h-7 w-7 ${spin ? "pinwheel" : ""}`}
      aria-hidden="true"
      fill="var(--accent)"
    >
      <path d="M5 5h10L9.5 17z" />
      <path d="M5 27h10L9.5 15z" />
      <path d="M17 5h4.5a6 6 0 0 1 0 12H17z" />
      <path d="M17 15h5a6 6 0 0 1 0 12h-5z" />
    </svg>
  );
}

export { Mark };
