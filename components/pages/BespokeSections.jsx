/* eslint-disable @next/next/no-img-element */
import Marquee from "@/components/Marquee";
import CircleTitleAnime from "@/components/CircleTitleAnime";
import AboutTimeline from "@/components/AboutTimeline";
import AboutReviewSlider from "@/components/AboutReviewSlider";
import Carousel from "@/components/Carousel";
import Accordion from "@/components/Accordion";
import Checklist from "@/components/Checklist";
import Fancybox from "@/components/Fancybox";
import ServiceFinder from "@/app/nrb/ServiceFinder";
import LandownerContactForm from "@/app/landowner/LandownerContactForm";

/* The three pages this file reproduces brought their own stylesheets. Rather
   than copy those rules into a new file — where they would immediately start
   drifting from the originals — the sections import them directly.

   about.css is a plain global sheet (it carries .img-box6, .about-tag,
   .nm-timeline, .nm-marquee and the rotating .about-experience-tag ring); the
   other two are CSS modules, whose class names are hashed, so the fact that
   both declare .section and .container causes no collision. */
import "@/app/about/about.css";
import nrb from "@/app/nrb/nrb.module.css";
import land from "@/app/landowner/landowner.module.css";

/*
 * The bespoke section types — the ones that reproduce a specific layout from
 * the About, NRB or Landowner pages.
 *
 * The guiding rule: NO animation is reimplemented here. Every moving part
 * mounts the component that already drove it — Marquee, AboutTimeline,
 * CircleTitleAnime, AboutReviewSlider, Carousel, Accordion — so the marquee
 * cloning, the timeline rail, the letter ring and the sliders behave exactly
 * as they did when the content was hardcoded. What changed is only where the
 * words and pictures come from.
 */

/** Paragraphs from plain text. Blank line = new paragraph, single = <br>. */
function Paras({ text, className }) {
  if (!text) return null;
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((paragraph, i) => (
      <p key={i} className={className}>
        {paragraph.split("\n").map((line, j, all) => (
          <span key={j}>
            {line}
            {j < all.length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
}

/** Pulls the id out of any YouTube URL form, for the lightbox thumbnail. */
function youTubeId(url) {
  if (!url) return null;
  const match = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? match[1] : null;
}

/* ======================================================== legacy_split ====
 * The About page's opening block: a tall image with a smaller one offset over
 * it (the `.jump` float), the ring of rotating letters around a play button,
 * and the heading/body alongside. Markup mirrors `.about-area-6 > .img-box6`.
 * ========================================================================= */
export function LegacySplit({ section }) {
  return (
    <div className="about-area-6 z-index-common position-relative" id="about-sec">
      <Fancybox selector=".popup-video" options={{ dragToClose: false }} />
      <div className="container">
        <div className="row gx-80 justify-content-between">
          <div className="col-xl-6 mb-50 mb-xl-0">
            <div className="img-box6">
              {section.image_url && (
                <div className="img1">
                  <img width="640" height="830" src={section.image_url} alt="" />
                </div>
              )}
              {section.image_url_2 && (
                <div className="img2 d-none d-md-block jump">
                  <img width="400" height="330" src={section.image_url_2} alt="" />
                </div>
              )}
              {(section.badge_text || section.video_url) && (
                <div className="about-tag">
                  {section.badge_text && (
                    <div className="about-experience-tag">
                      <CircleTitleAnime text={section.badge_text} className="text-light" />
                    </div>
                  )}
                  {section.video_url && (
                    <a href={section.video_url} className="play-btn popup-video">
                      <i className="fa-sharp fa-solid fa-play" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="col-xl-6">
            <div className="title-area mb-32">
              <div className="nm-about-line" />
              {section.heading && <h2 className="sec-title text-light">{section.heading}</h2>}
              <div className="sec-text text-light">
                <Paras text={section.body} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= marquee ====
 * The scrolling stroked text. Marquee handles its own cloning and duration
 * maths; passing the text is all that changes.
 * ========================================================================= */
export function MarqueeSection({ section }) {
  if (!section.body) return null;
  return <Marquee text={section.body} className="nm-marquee-between-sections" />;
}

/* ============================================================ timeline ====
 * The interactive company history. Entries come from timeline_entries and are
 * mapped back to the shape AboutTimeline already expects, so its rail
 * scrolling and arrow states are untouched.
 * ========================================================================= */
export function TimelineSection({ section, timeline = [] }) {
  const entries = timeline.map((row) => ({
    date: row.date_label,
    title: row.title,
    text: row.body,
    image: row.image_url,
    imagePosition: row.image_position,
    linkLabel: row.link_label,
    link: row.link_url,
  }));

  return (
    <div className="bg-theme space">
      <div className="container">
        <div className="row">
          <div className="col-auto">
            {section.heading && (
              <h3 className="sec-title text-light mt-30 mb-30 nm-timeline-heading">
                {section.heading}
              </h3>
            )}
            <AboutTimeline entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================== feature_split ====
 * Text beside a picture, where the text column can hold several heading +
 * paragraph groups (`blocks`) and then a ticked list (`subheading` + `items`).
 * The About mission/vision block is exactly that shape; so is NRB's pull-quote
 * intro and Landowner's opening split.
 * ========================================================================= */
export function FeatureSplit({ section }) {
  const imageLeft = section.image_side === "left";
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  const items = Array.isArray(section.items) ? section.items : [];
  const dark = section.background === "dark";

  const media = section.image_url ? (
    <div className="col-lg-6">
      <div className="img-box3">
        <div className="img1">
          <img width="507" height="410" src={section.image_url} alt={section.heading || ""} />
        </div>
        {(section.badge_text || section.video_url) && (
          <div className="about-tag">
            {section.badge_text && (
              <div className="about-experience-tag">
                <CircleTitleAnime text={section.badge_text} />
              </div>
            )}
            {section.video_url && (
              <a href={section.video_url} className="play-btn popup-video">
                <i className="fa-sharp fa-solid fa-play" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;

  const textColor = dark ? "text-light" : "text-theme";

  const body = (
    <div className="col-lg-6">
      <div className="title-area mb-0">
        {section.heading && (
          <h2 className={`sec-title ${textColor} mb-2`}>{section.heading}</h2>
        )}

        {/* NRB opens with a two-line couplet set as a pull quote. */}
        {section.variant === "quote" && section.subheading && (
          <p className={nrb.quote}>
            {section.subheading.split("\n").map((line, i, all) => (
              <span key={i}>
                {line}
                {i < all.length - 1 && <br />}
              </span>
            ))}
          </p>
        )}

        <div className={textColor}>
          <Paras text={section.body} />
        </div>

        {blocks.map((block, i) => (
          <div key={i}>
            {block.title && (
              <h2 className={`sec-title ${textColor} mb-2 ${i > 0 ? "mt-10" : ""}`}>
                {block.title}
              </h2>
            )}
            {block.body && <p className={textColor}>{block.body}</p>}
          </div>
        ))}

        {section.variant !== "quote" && section.subheading && (
          <h2 className={`sec-title ${textColor} mb-2 mt-10`}>{section.subheading}</h2>
        )}

        {items.length > 0 && (
          <div className="checklist style1 mb-5">
            <Checklist items={items} light={!dark} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`overflow-hidden space ${dark ? "bg-theme" : "bg-light"}`}>
      {section.video_url && (
        <Fancybox selector=".popup-video" options={{ dragToClose: false }} />
      )}
      <div className="container">
        <div className="row gy-40 justify-content-between align-items-center">
          {imageLeft ? (
            <>
              {media}
              {body}
            </>
          ) : (
            <>
              {body}
              {media}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================ services ====
 * NRB's icon grid. The icons stay in code as SVG path data carried on each
 * block, so editing a card's words never risks breaking its glyph — and a
 * card added without one falls back to the first icon rather than rendering
 * an empty box.
 * ========================================================================= */
const FALLBACK_ICON =
  "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6";

export function ServicesSection({ section }) {
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];

  return (
    <section className={`${nrb.section} ${section.background === "dark" ? nrb.dark : ""}`}>
      <div className={nrb.container}>
        {section.subheading && <span className={nrb.subTitle}>{section.subheading}</span>}
        {section.heading && <h2 className={nrb.heading}>{section.heading}</h2>}
        {section.body && <p className={nrb.note}>{section.body}</p>}

        <div className={nrb.serviceGrid}>
          {blocks.map((block, i) => (
            <div key={i} className={nrb.serviceCard}>
              <span className={nrb.serviceIcon}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={block.icon || FALLBACK_ICON} />
                </svg>
              </span>
              <h3>{block.title}</h3>
              {block.body && <p>{block.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================== checklist (2-column) ===
 * NRB's "what makes us unique" band: an eyebrow, heading and paragraph beside
 * a ticked list split into two columns.
 * ========================================================================= */
export function TwoColumnChecklist({ section }) {
  const items = Array.isArray(section.items) ? section.items : [];
  const half = Math.ceil(items.length / 2);
  const dark = section.background === "dark";

  return (
    <section className={`${nrb.section} ${dark ? nrb.dark : ""}`}>
      <div className={nrb.container}>
        <div className={nrb.uniqueGrid}>
          <div>
            {section.subheading && <span className={nrb.subTitle}>{section.subheading}</span>}
            {section.heading && <h2 className={nrb.heading}>{section.heading}</h2>}
            <Paras text={section.body} />
          </div>
          <div className={nrb.uniqueLists}>
            <Checklist items={items.slice(0, half)} light={!dark} />
            <Checklist items={items.slice(half)} light={!dark} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================== video_split ====
 * Landowner's video block: a YouTube still with a play badge that opens the
 * Fancybox lightbox in place — deliberately NOT a link that navigates away —
 * beside the text. The thumbnail is derived from the video id, as before.
 * ========================================================================= */
export function VideoSplit({ section }) {
  const id = youTubeId(section.video_url);
  const dark = section.background === "dark";

  return (
    <section className={`${land.section} ${dark ? land.dark : ""}`}>
      <div className={land.container}>
        <div className={`${land.infoGrid} ${section.image_side === "left" ? land.reverse : ""}`}>
          <Fancybox selector=".popup-video" options={{ dragToClose: false }} />
          {section.video_url && (
            <a
              className={`${land.videoThumb} popup-video`}
              href={section.video_url}
              aria-label={section.heading ? `Watch: ${section.heading}` : "Watch video"}
            >
              <img
                src={
                  section.image_url ||
                  (id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "")
                }
                alt=""
              />
              <span>
                <i className="fa-solid fa-play" />
              </span>
            </a>
          )}
          <div>
            {section.heading && <h2 className={land.heading}>{section.heading}</h2>}
            <Paras text={section.body} className={land.text} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================= review_slider ====
 * Two variants, because the site has two review treatments and both should
 * survive: About's autoplaying swiper, and Landowner's scroll carousel.
 * ========================================================================= */
export function ReviewSlider({ section }) {
  const blocks = (Array.isArray(section.blocks) ? section.blocks : []).filter((b) => b?.text);
  if (blocks.length === 0) return null;

  if (section.variant === "carousel") {
    return (
      <section className={`${land.section} ${section.background === "dark" ? land.dark : ""}`}>
        <div className={land.container}>
          {section.heading && <h2 className={land.headingCenter}>{section.heading}</h2>}
          <Carousel ariaLabel={section.heading || "Reviews"}>
            {blocks.map((review, i) => (
              <div key={i} className={land.reviewCard}>
                <div className={land.stars}>★★★★★</div>
                <p>&ldquo;{review.text}&rdquo;</p>
                <div className={land.reviewProfile}>
                  <div className={land.avatar}>{(review.name || "?").charAt(0)}</div>
                  <div>
                    <strong>{review.name}</strong>
                    <span>{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
    );
  }

  return (
    <div className="bti-landowner-page bti-about-customer-reviews">
      <section className="space" id="about-customer-reviews-sec">
        <div className="container">
          {section.heading && (
            <div className="row justify-content-center text-center">
              <div className="col-xl-7 col-lg-8">
                <div className="title-area">
                  <h2 className="sec-title">{section.heading}</h2>
                </div>
              </div>
            </div>
          )}
          <AboutReviewSlider reviews={blocks} />
        </div>
      </section>
    </div>
  );
}

/* ======================================================== contact_block ====
 * The closing band on NRB and Landowner: heading, text, a couple of contact
 * cards, and optionally one of the two interactive forms.
 * ========================================================================= */
const CONTACT_ICONS = {
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z",
  chat: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z",
  map: "M21 10c0 6.5-9 12-9 12s-9-5.5-9-12a9 9 0 0 1 18 0Z",
  mail: "M2 4h20v16H2V4Zm2 2v.5l8 5.5 8-5.5V6H4Z",
};

export function ContactBlock({ section }) {
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  const dark = section.background === "dark";
  /* The two pages use different stylesheets for this band; the embedded form
     is what tells them apart. */
  const st = section.embed === "landowner_contact" ? land : nrb;

  const cards = blocks.map((block, i) => {
    const inner = (
      <>
        <span className={st.contactIcon} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={CONTACT_ICONS[block.icon] || CONTACT_ICONS.phone} />
          </svg>
        </span>
        <div>
          <strong>{block.title}</strong>
          <span>{block.body}</span>
        </div>
      </>
    );

    // Only render a link when there is somewhere to go; the Landowner cards
    // are deliberately plain text.
    if (!block.href) {
      return (
        <div key={i} className={st.contactCard}>
          {inner}
        </div>
      );
    }
    const external = /^https?:\/\//.test(block.href);
    return (
      <a
        key={i}
        className={st.contactCard}
        href={block.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  });

  return (
    <section className={`${st.section} ${dark ? st.dark : ""}`}>
      <div className={st.container}>
        <div className={st.contactGrid}>
          <div>
            {section.subheading && <span className={st.subTitle}>{section.subheading}</span>}
            {section.heading && <h2 className={st.heading}>{section.heading}</h2>}
            <Paras text={section.body} className={st.text} />
            {cards.length > 0 && <div className={st.contactCards}>{cards}</div>}
          </div>
          {section.embed === "service_finder" && <ServiceFinder />}
          {section.embed === "landowner_contact" && <LandownerContactForm />}
        </div>
      </div>
    </section>
  );
}

/* ================================================================= faq ====
 * Landowner's accordion band. Uses the same Accordion component, so the
 * open/close behaviour and the single-open-at-a-time rule are unchanged.
 * ========================================================================= */
export function FaqSection({ section }) {
  const items = (Array.isArray(section.items) ? section.items : []).filter(
    (i) => i && i.question
  );
  if (items.length === 0) return null;

  return (
    <section className={`${land.section} ${section.background === "dark" ? land.dark : ""}`}>
      <div className={land.container}>
        {section.heading && <h2 className={land.headingCenter}>{section.heading}</h2>}
        <div className={land.faqWrap}>
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}
