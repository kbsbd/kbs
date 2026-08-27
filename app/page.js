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

export default async function HomePage() {
  const [settings, allProperties, featured, specialOffer, footerLinks, socialLinks] =
    await Promise.all([
      getSiteSettings(),
      getProperties(),
      getFeaturedProperties(),
      getSpecialOfferProperties(),
      getFooterLinks(),
      getSocialLinks(),
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

        <SpecialOfferSection properties={specialOffer} />
        <FeaturedPropertiesSection properties={featured} />
        <StatementOfArrival
          youtubeId={settings.arrival_youtube_id}
          heading={settings.arrival_heading}
        />
        <Testimonials />
        <SbuSection />
      </main>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />

      <IntegrationScripts
        metaPixelId={settings.meta_pixel_id}
        gaMeasurementId={settings.ga_measurement_id}
      />
    </>
  );
}
