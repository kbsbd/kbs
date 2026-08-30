import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import SpecialOfferSection from "@/components/SpecialOfferSection";
import FeaturedPropertiesSection from "@/components/FeaturedPropertiesSection";
import StatementOfArrival from "@/components/StatementOfArrival";
import Testimonials from "@/components/Testimonials";
import SbuSection from "@/components/SbuSection";
import Footer from "@/components/Footer";
import IntegrationScripts from "@/components/IntegrationScripts";
import { getSiteSettings } from "@/lib/data/site";
import {
  getProperties,
  getFeaturedProperties,
  getSpecialOfferProperties,
} from "@/lib/data/properties.server";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import { getTestimonials } from "@/lib/data/testimonials";
import { getSbuUnits } from "@/lib/data/sbu";

/*
 * Every band on this page is now driven by the database: the copy and artwork
 * from the site_settings row, the review images from `testimonials`, the
 * business units from `sbu_units`, and the property cards from `properties`.
 *
 * All of the reads happen in one Promise.all so the page still costs a single
 * round of parallel queries rather than a waterfall.
 */
export default async function HomePage() {
  const [
    settings,
    allProperties,
    featured,
    specialOffer,
    footerLinks,
    socialLinks,
    testimonials,
    sbuUnits,
  ] = await Promise.all([
    getSiteSettings(),
    getProperties(),
    getFeaturedProperties(),
    getSpecialOfferProperties(),
    getFooterLinks(),
    getSocialLinks(),
    getTestimonials(),
    getSbuUnits(),
  ]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Header />

      <main id="main-content">
        <Hero
          videoUrl={settings.hero_video_url}
          posterUrl={settings.hero_poster_url}
          headline={settings.hero_headline}
          subheadline={settings.hero_subheadline}
        >
          <SearchBar properties={allProperties} />
        </Hero>

        <SpecialOfferSection
          properties={specialOffer}
          heading={settings.special_offer_heading}
          text={settings.special_offer_text}
          ctaLabel={settings.special_offer_cta_label}
          ctaHref={settings.special_offer_cta_href}
        />

        <FeaturedPropertiesSection
          properties={featured}
          heading={settings.featured_heading}
          text={settings.featured_text}
          ctaLabel={settings.featured_cta_label}
          ctaHref={settings.featured_cta_href}
        />

        <StatementOfArrival
          youtubeId={settings.arrival_youtube_id}
          heading={settings.arrival_heading}
          thumbUrl={settings.arrival_thumb_url}
        />

        <Testimonials items={testimonials} heading={settings.testimonials_heading} />

        <SbuSection
          units={sbuUnits}
          heading={settings.sbu_heading}
          subheading={settings.sbu_subheading}
          bgUrl={settings.sbu_bg_url}
        />
      </main>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />

      <IntegrationScripts
        metaPixelId={settings.meta_pixel_id}
        gaMeasurementId={settings.ga_measurement_id}
      />
    </>
  );
}
