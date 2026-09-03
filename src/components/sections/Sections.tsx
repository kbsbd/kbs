/* eslint-disable @next/next/no-img-element */
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

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono-label text-[color:var(--clay)]">{children}</p>
);

/* 1. The one idea. Full-bleed image with the claim beside it. */
export function Premise({ c, l }: { c: SiteContent; l: Locale }) {
  return (
    <section className="sec reveal" id="idea">
      <Wrap>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div className="part relative overflow-hidden rounded-2xl">
            <img
              src={img(c.premise.image, 1400)}
              alt=""
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
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

/* 2. The building. A wide image band, then a spec table underneath. */
export function Building({ c, l }: { c: SiteContent; l: Locale }) {
  return (
    <section className="sec reveal" id="building">
      <Wrap>
        <div className="part relative overflow-hidden rounded-2xl">
          <img
            src={img(c.building.image, 1920)}
            alt=""
            loading="lazy"
            className="aspect-[21/9] w-full object-cover"
          />
        </div>

        <div className="part mt-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Kicker>{pick(c.building.kicker, l)}</Kicker>
            <h2 className="font-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">
              {pick(c.building.head, l)}
            </h2>
          </div>
        </div>

        <dl className="part mt-10 grid gap-px overflow-hidden rounded-2xl border border-[color:var(--panel-edge)] bg-[color:var(--panel-edge)] sm:grid-cols-2 lg:grid-cols-3">
          {c.building.specs.map((s) => (
            <div key={s.id} className="bg-[color:var(--panel)] px-7 py-8">
              <dt className="font-mono-label text-[color:var(--text-quiet)]">
                {pick(s.label, l)}
              </dt>
              <dd className="font-display mt-3 text-2xl">{pick(s.value, l)}</dd>
            </div>
          ))}
        </dl>
      </Wrap>
    </section>
  );
}

/* 4. Amenities. Deliberately asymmetric: one tall lead, then a run of cards. */
export function Amenities({ c, l }: { c: SiteContent; l: Locale }) {
  const [lead, ...rest] = c.amenities.items;
  return (
    <section className="sec reveal" id="amenities">
      <Wrap>
        <div className="part">
          <Kicker>{pick(c.amenities.kicker, l)}</Kicker>
          <h2 className="font-display mt-4 max-w-[18ch] text-[clamp(1.9rem,3.6vw,3rem)]">
            {pick(c.amenities.head, l)}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          {lead && (
            <figure className="part group relative overflow-hidden rounded-2xl">
              <img
                src={img(lead.image, 1600)}
                alt=""
                loading="lazy"
                className="h-full min-h-[22rem] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              />
              <figcaption
                className="absolute inset-x-0 bottom-0 p-8 text-white"
                style={{
                  // the lead card carries two lines of body copy over bright
                  // pergola and sky, so it needs a deeper, taller gradient than
                  // the title-only cards beside it. The gradient is dark in both
                  // themes, so the text is pinned light, not theme-following.
                  background:
                    "linear-gradient(0deg, rgba(7,16,26,.96) 0%, rgba(7,16,26,.82) 38%, rgba(7,16,26,.42) 68%, transparent 100%)",
                }}
              >
                <h3 className="font-display text-2xl">{pick(lead.title, l)}</h3>
                <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-white/80">
                  {pick(lead.body, l)}
                </p>
              </figcaption>
            </figure>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((a) => (
              <figure
                key={a.id}
                className="part group relative overflow-hidden rounded-2xl"
              >
                <img
                  src={img(a.image, 1000)}
                  alt=""
                  loading="lazy"
                  className="h-56 w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
                <figcaption
                  className="absolute inset-x-0 bottom-0 p-6 text-white"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(7,16,26,.94) 0%, rgba(7,16,26,.5) 55%, transparent 100%)",
                  }}
                >
                  <h3 className="font-display text-lg">{pick(a.title, l)}</h3>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {rest.slice(2).map((a) => (
            <figure
              key={a.id}
              className="part group relative overflow-hidden rounded-2xl"
            >
              <img
                src={img(a.image, 1200)}
                alt=""
                loading="lazy"
                className="h-64 w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              />
              <figcaption
                className="absolute inset-x-0 bottom-0 p-6 text-white"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(7,16,26,.96) 0%, rgba(7,16,26,.78) 42%, rgba(7,16,26,.36) 72%, transparent 100%)",
                }}
              >
                <h3 className="font-display text-lg">{pick(a.title, l)}</h3>
                <p className="mt-1.5 max-w-[40ch] text-sm leading-relaxed text-white/80">
                  {pick(a.body, l)}
                </p>
              </figcaption>
            </figure>
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

/* 5. The trust section. No image, no cards. Big type and a list, because the
   subject is a promise rather than a picture. */
export function Trust({ c, l }: { c: SiteContent; l: Locale }) {
  return (
    <section className="sec reveal" id="trust">
      <Wrap>
        <div className="pulse relative overflow-hidden rounded-3xl border border-[color:var(--panel-edge)] bg-[color:var(--panel)] px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
          <div className="part">
            <Kicker>{pick(c.trust.kicker, l)}</Kicker>
          </div>
          <h2 className="part font-display mt-5 max-w-[20ch] text-[clamp(1.9rem,4vw,3.3rem)]">
            {pick(c.trust.head, l)}
          </h2>

          <ul className="part mt-12 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {c.trust.items.map((item, i) => (
              <li
                key={i}
                className="flex items-baseline gap-4 border-b border-[color:var(--panel-edge)] pb-4"
              >
                <span className="font-mono-label shrink-0 text-[color:var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[color:var(--text-primary)]">{pick(item, l)}</span>
              </li>
            ))}
          </ul>

          <p className="part mt-12 max-w-[54ch] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-relaxed">
            {pick(c.trust.body, l)}
          </p>
          <p className="part mt-6 font-mono-label text-[color:var(--text-quiet)]">
            {pick(c.trust.since, l)}
          </p>
        </div>
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
  items: Array<{ id: string; image: string; title: T; location: T; status: T }>;
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
            <article key={p.id} className="part group">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={img(p.image, 1000)}
                  alt=""
                  loading="lazy"
                  className="h-60 w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
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
