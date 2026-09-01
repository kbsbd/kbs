/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Checklist from "@/components/Checklist";
import {
  LegacySplit,
  MarqueeSection,
  TimelineSection,
  FeatureSplit,
  ServicesSection,
  TwoColumnChecklist,
  VideoSplit,
  ReviewSlider,
  ContactBlock,
  FaqSection,
} from "./BespokeSections";
import styles from "./PageSections.module.css";

/*
 * Renders the content blocks of an admin-built page.
 *
 * There are two families of block:
 *
 *   GENERIC   text, text-with-image, ticked list, card grid, call to action.
 *             These get a plain wrapper from this file and are the ones you
 *             reach for on an ordinary page.
 *
 *   BESPOKE   the ones lifted from About, NRB and Landowner — the legacy
 *             collage, the marquee, the timeline, the service grid, the video
 *             block, the review sliders, the contact band. Each of those
 *             renders its OWN full-width section using the original page's
 *             stylesheet, so this file must not wrap them in a second one.
 *             They live in BespokeSections.jsx.
 *
 * Body text is plain text, not HTML. It is split on blank lines into
 * paragraphs and rendered as React children, so an admin can never
 * accidentally (or deliberately) inject markup into a public page. That is a
 * deliberate trade: no rich formatting, no XSS surface, no broken layout from
 * a stray unclosed tag.
 */

/* Blocks that bring their own <section> and background. */
const FULL_BLEED = {
  legacy_split: LegacySplit,
  marquee: MarqueeSection,
  timeline: TimelineSection,
  feature_split: FeatureSplit,
  services: ServicesSection,
  video_split: VideoSplit,
  review_slider: ReviewSlider,
  contact_block: ContactBlock,
  faq: FaqSection,
};

function Paragraphs({ text, className }) {
  if (!text) return null;

  const paragraphs = String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={className}>
          {/* Single newlines inside a paragraph become line breaks, so an
              address or a short list reads the way it was typed. */}
          {paragraph.split("\n").map((line, j, all) => (
            <span key={j}>
              {line}
              {j < all.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function SectionHead({ heading, subheading }) {
  if (!heading && !subheading) return null;
  return (
    <div className={styles.head}>
      {heading && <h2 className={styles.title}>{heading}</h2>}
      {subheading && <p className={styles.subtitle}>{subheading}</p>}
    </div>
  );
}

function RichText({ section }) {
  return (
    <>
      <SectionHead heading={section.heading} subheading={section.subheading} />
      <div className={styles.prose}>
        <Paragraphs text={section.body} />
      </div>
    </>
  );
}

function ImageText({ section }) {
  const imageFirst = section.image_side === "left";

  return (
    <>
      <SectionHead heading={section.heading} subheading={section.subheading} />
      <div className={styles.split} data-image-first={imageFirst || undefined}>
        {section.image_url && (
          <div className={styles.splitMedia}>
            <img src={section.image_url} alt={section.heading || ""} loading="lazy" />
          </div>
        )}
        <div className={styles.prose}>
          <Paragraphs text={section.body} />
        </div>
      </div>
    </>
  );
}

function ChecklistBlock({ section, dark }) {
  const items = Array.isArray(section.items) ? section.items.filter(Boolean) : [];

  return (
    <>
      <SectionHead heading={section.heading} subheading={section.subheading} />
      {section.body && (
        <div className={styles.prose}>
          <Paragraphs text={section.body} />
        </div>
      )}
      {items.length > 0 && (
        <div className={styles.checklistWrap}>
          {/* Checklist's `light` prop means "dark text for a light background",
              which is the opposite of this section's own naming — hence the
              inversion rather than passing `dark` straight through. */}
          <Checklist items={items} light={!dark} />
        </div>
      )}
    </>
  );
}

function Cards({ section }) {
  const items = (Array.isArray(section.items) ? section.items : []).filter(
    (i) => i && i.title
  );

  return (
    <>
      <SectionHead heading={section.heading} subheading={section.subheading} />
      {items.length > 0 && (
        <ul className={styles.cards}>
          {items.map((item, i) => (
            <li key={i} className={styles.card}>
              <span className={styles.cardIndex}>{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              {item.body && <p>{item.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Cta({ section }) {
  const external = /^https?:\/\//.test(section.cta_href || "");

  return (
    <div className={styles.cta}>
      <div>
        {section.heading && <h2 className={styles.ctaTitle}>{section.heading}</h2>}
        {section.body && <p className={styles.ctaText}>{section.body}</p>}
      </div>
      {section.cta_label &&
        section.cta_href &&
        (external ? (
          <a
            href={section.cta_href}
            className={styles.ctaButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            {section.cta_label}
          </a>
        ) : (
          <Link href={section.cta_href} className={styles.ctaButton}>
            {section.cta_label}
          </Link>
        ))}
    </div>
  );
}

const GENERIC = {
  richtext: RichText,
  image_text: ImageText,
  checklist: ChecklistBlock,
  cards: Cards,
  cta: Cta,
};

export default function PageSections({ sections = [], narrow = false, timeline = [] }) {
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        // A ticked list set to two columns is NRB's band, which brings its own
        // section — so it routes to the bespoke renderer, not the generic one.
        if (section.kind === "checklist" && section.variant === "two-column") {
          return <TwoColumnChecklist key={section.id} section={section} />;
        }

        const Bespoke = FULL_BLEED[section.kind];
        if (Bespoke) {
          return <Bespoke key={section.id} section={section} timeline={timeline} />;
        }

        const Block = GENERIC[section.kind] || RichText;
        const dark = section.background === "dark";

        return (
          <section
            key={section.id}
            className={styles.section}
            data-tone={dark ? "dark" : "light"}
          >
            <div className={narrow ? styles.containerNarrow : styles.container}>
              <Block section={section} dark={dark} />
            </div>
          </section>
        );
      })}
    </>
  );
}
