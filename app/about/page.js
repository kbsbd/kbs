/* eslint-disable @next/next/no-img-element */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Fancybox from "@/components/Fancybox";
import Marquee from "@/components/Marquee";
import AboutTimeline from "@/components/AboutTimeline";
import CircleTitleAnime from "@/components/CircleTitleAnime";
import AboutReviewSlider from "@/components/AboutReviewSlider";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import "./about.css";

/*
 * /about-us/ — ported 1:1 from the WordPress page template `about.php`.
 * Section order, exactly as the original emits it:
 *
 *   .breadcumb-wrapper.bti-about-breadcrumb        (data-bg-src banner)
 *   #about-sec .about-area-6                       (legacy copy + img-box6)
 *     └ .nm-marquee-section.nm-home-marquee-original-hidden   (display:none)
 *   .nm-marquee-section.nm-marquee-between-sections           (the animated one)
 *   .bg-theme.space                                (the 40-year timeline)
 *   #mission-vision-sec .bg-light                  (mission / vision / values)
 *   .bti-landowner-page.bti-about-customer-reviews (review slider)
 *
 * Notes on faithfulness:
 *  - There really are TWO marquees with identical text. The first sits inside
 *    the about container carrying `nm-home-marquee-original-hidden`, which is
 *    `display:none!important` AND is excluded from the animation selector.
 *    It is kept because the markup has it.
 *  - `data-bg-src` is rewritten by main.min.js into an inline background-image
 *    plus the `background-image` class, with the attribute removed; the clone
 *    renders that end state directly.
 *  - The stray `<br>` between the two halves of the mission row is in the
 *    original markup.
 *  - `fa-sharp` on the play buttons is a Font Awesome Pro class that never
 *    loads, here or on the original — only `fa-solid fa-play` renders.
 *  - Brand references follow this project's KBS rebrand; the original reads
 *    "building technology & ideas ltd. (bti)".
 */

const THEME = "/wp-content/themes/bti-new-properties-special/assets/img";
const BANNER = `${THEME}/demo/banner-about.webp`;
const CHECK = `${THEME}/icon/checkmark.svg`;

const MARQUEE_TEXT =
  "High Quality of Construction. Design Excellence. Reliability. Customer-centricity.";

const CORE_VALUES = [
  "Win The Customer's Heart.",
  "Work Harder than Everyone Else & Strive to be the Best.",
  "Maintain an Entrepreneurial Spirit.",
  "Respect, Develop & Empower our People.",
  "High Morals, Honesty & Integrity.",
  "Speed of Work, Fight Bureaucracy, Sycophancy and Remove Superfluous Work.",
  "Practice Meritocracy & Constantly Enhance Talent Density.",
];

const WHY_CHOOSE = [
  "On-time delivery, guaranteed",
  "Amazing credit ratings = timely payments",
  "A heartfelt relationship with patrons",
  "A one-stop solution to all real-estate issues",
];

export const metadata = {
  title: "About Us",
  description:
    "KBS stands as one of the pioneers of Bangladesh's real estate sector, with a legacy of on-time handovers, high quality of construction, and excellent designs.",
};

function Checklist({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <img width="24" height="24" src={CHECK} alt="img" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function AboutPage() {
  const [footerLinks, socialLinks] = await Promise.all([getFooterLinks(), getSocialLinks()]);

  return (
    <>
      <Header />
      {/* main.min.js: Fancybox.bind(".popup-video", {dragToClose:false}) */}
      <Fancybox selector=".popup-video" options={{ dragToClose: false }} />

      <div
        className="breadcumb-wrapper bti-about-breadcrumb background-image"
        style={{ backgroundImage: `url(${BANNER})` }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-9">
              <div className="breadcumb-content">
                <h1 className="breadcumb-title bti-about-title-override">
                  We don&apos;t just make buildings. We&apos;re in the business of customer
                  satisfaction
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="about-area-6 z-index-common position-relative" id="about-sec">
        <div className="container">
          <div className="row gx-80 justify-content-between">
            <div className="col-xl-6 mb-50 mb-xl-0">
              <div className="img-box6">
                <div className="img1">
                  <img
                    width="640"
                    height="830"
                    src={`${THEME}/demo/Our-Legacy-1.webp`}
                    alt="img"
                  />
                </div>
                <div className="img2 d-none d-md-block jump">
                  <img
                    width="400"
                    height="330"
                    src={`${THEME}/demo/Our-Legacy-2.webp`}
                    alt="img"
                  />
                </div>
                <div className="about-tag">
                  <div className="about-experience-tag">
                    <CircleTitleAnime text="43 years of excellence" className="text-light" />
                  </div>
                  <a
                    href="https://www.youtube.com/watch?v=zGP2vkMNUeI"
                    className="play-btn popup-video"
                  >
                    <i className="fa-sharp fa-solid fa-play" />
                  </a>
                </div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="title-area mb-32">
                <div className="nm-about-line" />
                <h2 className="sec-title text-light">A Legacy of Excellence</h2>
                <p className="sec-text text-light">
                  <b>KBS</b> stands as one of the pioneers of Bangladesh&apos;s real estate
                  sector, raising standards of professionalism and integrity across the
                  industry. With a legacy of on-time handovers, high quality of construction,
                  and excellent designs, we have helped shape skylines and communities for over
                  four decades. <br />
                  <br />
                  Our continuous dedication, depth of experience, and relentless pursuit of
                  excellence have together earned us a position of strength and distinction in
                  the market. Above all, we remain deeply humbled by the enduring trust and
                  loyalty of our customers — a bond that has only grown stronger with time.
                </p>
              </div>
            </div>
          </div>
          {/* display:none, and excluded from the animation selector — kept for parity */}
          <Marquee
            text={MARQUEE_TEXT}
            className="nm-home-marquee-original-hidden"
            animate={false}
          />
        </div>
      </div>

      <Marquee text={MARQUEE_TEXT} className="nm-marquee-between-sections" />

      <div className="bg-theme space">
        <div className="container">
          <div className="row">
            <div className="col-auto">
              <h3 className="sec-title text-light mt-30 mb-30 nm-timeline-heading">
                Check out how we started shaping the future 4 decades ago
              </h3>
              <AboutTimeline />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden space bg-light" id="mission-vision-sec">
        <div className="container">
          <div className="about-page-wrap">
            <div className="row gy-40 justify-content-between align-items-center">
              <div className="col-lg-6 nm-mission-content">
                <div className="title-area mb-0">
                  <h2 className="sec-title text-theme mb-2">Mission</h2>
                  <p className="text-theme">To make homeownership a joyful experience.</p>
                  <h2 className="sec-title text-theme mb-2 mt-10">Vision</h2>
                  <p className="text-theme">
                    To provide viable housing solutions to every segment of our society.
                  </p>
                  <h2 className="sec-title text-theme mb-2 mt-10">Core Values</h2>
                  <div className="checklist style1 mb-5">
                    <Checklist items={CORE_VALUES} />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 nm-mission-image">
                <div className="img-box3">
                  <div className="img1">
                    <img
                      width="507"
                      height="410"
                      src={`${THEME}/demo/mision-vision.webp`}
                      alt="About"
                    />
                  </div>
                  <div className="about-tag">
                    <div className="about-experience-tag">
                      <CircleTitleAnime text="Pioneers of Bangladeshi Real Estate" />
                    </div>
                    <a
                      href="https://www.youtube.com/watch?v=394OaJS3AKc"
                      className="play-btn popup-video"
                    >
                      <i className="fa-sharp fa-solid fa-play" />
                    </a>
                  </div>
                </div>
              </div>
              <br />
              <div className="col-lg-5">
                <div className="img-box3">
                  <div className="img1">
                    <img
                      width="507"
                      height="410"
                      src={`${THEME}/demo/mision-vision-2.webp`}
                      alt="About"
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <h2 className="sec-title text-theme mb-2 mt-20">Why should you choose KBS?</h2>
                <p className="text-theme mb-4">
                  There are certain advantages to choosing KBS as your real estate partner, such
                  as:
                </p>
                <div className="checklist style1">
                  <Checklist items={WHY_CHOOSE} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bti-landowner-page bti-about-customer-reviews">
        <section className="space" id="about-customer-reviews-sec">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-xl-7 col-lg-8">
                <div className="title-area">
                  <h2 className="sec-title">What our customers say</h2>
                </div>
              </div>
            </div>
            <AboutReviewSlider />
          </div>
        </section>
      </div>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
