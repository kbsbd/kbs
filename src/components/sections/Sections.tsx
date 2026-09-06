/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale, SiteContent } from "@/content/seed";
import { img } from "@/lib/media";

/**
 * The page below the hero. No two adjacent sections share a layout skeleton,
 * which is what stops a long page reading as the same template stamped twice.
 */

type T = Record<Locale, string>;
/* fall back to English when a bilingual string has no Bengali yet, so a
   half-translated admin edit never renders as a blank line */
const pick = (v: T, l: Locale) => v[l] || v.en;

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-[86rem] px-5 sm:px-8">{children}</div>
);

/**
 * Makes a whole card clickable without wrapping it in an anchor. The cards are
 * grid children with an absolutely-positioned caption, so wrapping them in a
 * link changes the layout; a stretched overlay keeps the markup exactly as it
 * was, gives one large hit target, and — sitting inside the `group` — still
 * lets hover/focus drive the image zoom. Renders nothing when `href` is blank.
 */
const CardLink = ({ href, label }: { href?: string; label: string }) =>
  href ? (
    <Link
      href={href}
      aria-label={label}
      className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--clay)]"
    />
  ) : null;

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono-label text-[color:var(--clay)]">{children}</p>
);

/**
 * One gallery card in the old overlay style. The frame keeps a fixed shape so
 * the layout never collapses or shifts; the WHOLE photo shows inside it
 * (object-contain, never cropped); a blurred copy of the same photo fills
 * whatever the photo doesn't cover, so there is no empty edge; and the caption
 * sits over a bottom gradient. The whole card is one link.
 */
function GalleryCard({
  image,
  title,
  body,
  href,
  width,
  aspect,
  big = false,
}: {
  image: string;
  title: string;
  body?: string;
  href?: string;
  width: number;
  /** frame shape, e.g. "4 / 3" */
  aspect: string;
  big?: boolean;
}) {
  const src = img(image, width);
  return (
    <figure className="part group relative overflow-hidden rounded-2xl bg-[color:var(--panel)]">
      <CardLink href={href} label={title} />
      <div className="relative w-full" style={{ aspectRatio: aspect }}>
        {src && (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-125 bg-cover bg-center"
            style={{ backgroundImage: `url("${img(image, 500)}")`, filter: "blur(32px)" }}
          />
        )}
        <img
          src={src}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
        />
      </div>
      <figcaption
        className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white"
        style={{
          background: big
            ? "linear-gradient(0deg, rgba(7,16,26,.94) 0%, rgba(7,16,26,.72) 40%, rgba(7,16,26,.28) 70%, transparent 100%)"
            : "linear-gradient(0deg, rgba(7,16,26,.92) 0%, rgba(7,16,26,.5) 55%, transparent 100%)",
        }}
      >
        <h3 className={`font-display ${big ? "text-2xl" : "text-lg"}`}>{title}</h3>
        {body && (
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-white/85">{body}</p>
        )}
      </figcaption>
    </figure>
  );
}

/* 1. The one idea. Full-bleed image with the claim beside it. */
export function Premise({ c, l }: { c: SiteContent; l: Locale }) {
  return (
    <section className="sec reveal" id="idea">
      <Wrap>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div className="part relative overflow-hidden rounded-2xl bg-[color:var(--panel)]">
            <img
              src={img(c.premise.image, 1400)}
              alt=""
              loading="lazy"
              className="w-full"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(200deg, transparent 45%, rgba(11,22,34,.55) 100%)",
              }}
            />
          </div>
          <div>
            <div className="part">
              <Kicker>{pick(c.premise.kicker, l)}</Kicker>
            </div>
            <h2 className="part font-display mt-5 text-[clamp(2rem,4.2vw,3.5rem)]">
              {pick(c.premise.head, l)}
            </h2>
            <p className="part mt-7 max-w-[46ch] text-[clamp(1rem,1.35vw,1.19rem)] leading-relaxed text-[color:var(--text-secondary)]">
              {pick(c.premise.body, l)}
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/* 2. The building. The heading spans the full width at the top; below it the
   image sits left and the spec sheet right, stacking on a phone. The image and
   the "full details" link both open the standalone building page. */
export function Building({ c, l }: { c: SiteContent; l: Locale }) {
  const to = `/${l}/building`;
  const more = l === "bn" ? "সম্পূর্ণ বিবরণ" : "Full building details";
  return (
    <section className="sec reveal" id="building">
      <Wrap>
        <div className="part flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <Kicker>{pick(c.building.kicker, l)}</Kicker>
            <h2 className="font-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">
              {pick(c.building.head, l)}
            </h2>
          </div>
          <Link
            href={to}
            className="font-mono-label group inline-flex items-center gap-2 text-[color:var(--clay)] hover:underline"
          >
            {more}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Link
            href={to}
            aria-label={more}
            className="part group relative block overflow-hidden rounded-2xl bg-[color:var(--panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--clay)]"
          >
            <img
              src={img(c.building.image, 1400)}
              alt=""
              loading="lazy"
              className="w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            />
          </Link>

          <dl className="part divide-y divide-[color:var(--panel-edge)] border-y border-[color:var(--panel-edge)]">
            {c.building.specs.map((s) => (
              <div
                key={s.id}
                className="flex items-baseline justify-between gap-6 py-4"
              >
                <dt className="font-mono-label text-[color:var(--text-quiet)]">
                  {pick(s.label, l)}
                </dt>
                <dd className="font-display text-right text-lg sm:text-xl">
                  {pick(s.value, l)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Wrap>
    </section>
  );
}

/* 4. Amenities. Asymmetric gallery: one tall lead, two stacked beside it, then a
   run of wider cards. Every frame shows the whole photo, blur-filled so there is
   no empty edge and no crop. */
export function Amenities({ c, l }: { c: SiteContent; l: Locale }) {
  const [lead, ...rest] = c.amenities.items;
  /* A card opens the page the admin picked, otherwise the detail view built
     from the card's own image and description — so every card is clickable out
     of the box and the picker is an override, not a requirement. */
  const href = (a: { id: string; link?: string }) =>
    a.link ? `/${l}/p/${a.link}` : `/${l}/amenities/${a.id}`;
  return (
    <section className="sec reveal" id="amenities">
      <Wrap>
        <div className="part">
          <Kicker>{pick(c.amenities.kicker, l)}</Kicker>
          <h2 className="font-display mt-4 max-w-[18ch] text-[clamp(1.9rem,3.6vw,3rem)]">
            {pick(c.amenities.head, l)}
          </h2>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          {lead && (
            <GalleryCard
              image={lead.image}
              title={pick(lead.title, l)}
              body={pick(lead.body, l)}
              href={href(lead)}
              width={1600}
              aspect="1 / 1"
              big
            />
          )}

          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((a) => (
              <GalleryCard
                key={a.id}
                image={a.image}
                title={pick(a.title, l)}
                href={href(a)}
                width={1100}
                aspect="16 / 10"
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 sm:grid-cols-2">
          {rest.slice(2).map((a) => (
            <GalleryCard
              key={a.id}
              image={a.image}
              title={pick(a.title, l)}
              body={pick(a.body, l)}
              href={href(a)}
              width={1200}
              aspect="16 / 10"
            />
          ))}
        </div>

        <ul className="part mt-10 flex flex-wrap gap-3">
          {c.amenities.listed.map((x) => (
            <li
              key={x.id}
              className="rounded-full border border-[color:var(--panel-edge)] px-4 py-2 text-sm text-[color:var(--text-secondary)]"
            >
              {pick(x.label, l)}
            </li>
          ))}
        </ul>
      </Wrap>
    </section>
  );
}

/* 6. FAQ. A quiet two-column read, using the details element so it works with
   no JavaScript at all. */
export function Faq({ c, l }: { c: SiteContent; l: Locale }) {
  return (
    <section className="sec reveal" id="faq">
      <Wrap>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
          <div className="part lg:sticky lg:top-28 lg:self-start">
            <Kicker>{pick(c.faq.kicker, l)}</Kicker>
            <h2 className="font-display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)]">
              {pick(c.faq.head, l)}
            </h2>
          </div>

          <div className="part">
            {c.faq.items.map((item) => (
              <details
                key={item.id}
                className="group border-b border-[color:var(--panel-edge)] py-6"
              >
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-[clamp(1.02rem,1.4vw,1.18rem)] font-medium">
                  {pick(item.q, l)}
                  <span
                    className="shrink-0 text-[color:var(--accent)] transition-transform duration-300 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-[62ch] leading-relaxed text-[color:var(--text-secondary)]">
                  {pick(item.a, l)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/* 7. Projects. Renders only when the client has added one, so the live page
   never shows an empty shelf. */
export function Projects({
  c,
  l,
  items,
}: {
  c: SiteContent;
  l: Locale;
  items: Array<{
    id: string;
    image: string;
    title: T;
    location: T;
    status: T;
    link?: string;
  }>;
}) {
  if (!items.length) return null;
  return (
    <section className="sec reveal" id="projects">
      <Wrap>
        <div className="part">
          <Kicker>{pick(c.projects.kicker, l)}</Kicker>
          <h2 className="font-display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            {pick(c.projects.head, l)}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <article key={p.id} className="part group relative">
              <CardLink
                href={p.link ? `/${l}/p/${p.link}` : undefined}
                label={pick(p.title, l)}
              />
              <div className="overflow-hidden rounded-2xl bg-[color:var(--panel)]">
                <img
                  src={img(p.image, 1000)}
                  alt=""
                  loading="lazy"
                  className="w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <h3 className="font-display mt-5 text-xl">{pick(p.title, l)}</h3>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                {pick(p.location, l)} · {pick(p.status, l)}
              </p>
            </article>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
