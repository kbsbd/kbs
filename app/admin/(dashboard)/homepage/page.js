import Link from "next/link";
import { getSiteSettings } from "@/lib/data/site";
import SectionForm from "./SectionForm";
import {
  updateSpecialOfferSection,
  updateFeaturedSection,
  updateTestimonialsSection,
  updateSbuSection,
} from "@/lib/actions/homepage";
import styles from "../../admin.module.css";

export const metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <h1 className={styles.pageTitle}>Homepage</h1>
      <p className={styles.pageDescription}>
        The heading, blurb and button on each band of the homepage, in the order they appear.
      </p>

      <div className={styles.notice}>
        <strong>What lives elsewhere</strong>
        <p>
          The hero video is under <Link href="/admin/hero">Hero &amp; Video</Link>, the arrival
          video under <Link href="/admin/arrival">Statement of Arrival</Link>, the review images
          under <Link href="/admin/testimonials">Testimonials</Link>, and the business units under{" "}
          <Link href="/admin/sbu">SBU Units</Link>. Which properties appear in the Special offer and
          Featured bands is set per property under <Link href="/admin/properties">Properties</Link>.
        </p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Special offer band</h2>
        <SectionForm
          action={updateSpecialOfferSection}
          fields={[
            {
              name: "special_offer_heading",
              label: "Heading",
              value: settings.special_offer_heading,
              placeholder: "Special offer",
            },
            {
              name: "special_offer_text",
              label: "Blurb",
              type: "textarea",
              value: settings.special_offer_text,
              hint: "Leave empty to hide the line under the heading.",
            },
            {
              name: "special_offer_cta_label",
              label: "Button label",
              value: settings.special_offer_cta_label,
              placeholder: "View all properties",
            },
            {
              name: "special_offer_cta_href",
              label: "Button link",
              value: settings.special_offer_cta_href,
              placeholder: "/properties?category=special",
            },
          ]}
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Featured properties band</h2>
        <SectionForm
          action={updateFeaturedSection}
          fields={[
            {
              name: "featured_heading",
              label: "Heading",
              value: settings.featured_heading,
              placeholder: "Featured properties",
            },
            {
              name: "featured_text",
              label: "Blurb",
              type: "textarea",
              value: settings.featured_text,
              hint: "Empty by default — this band shipped without one.",
            },
            {
              name: "featured_cta_label",
              label: "Button label",
              value: settings.featured_cta_label,
              placeholder: "View all properties",
            },
            {
              name: "featured_cta_href",
              label: "Button link",
              value: settings.featured_cta_href,
              placeholder: "/properties?category=featured",
            },
          ]}
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Customer reviews band</h2>
        <SectionForm
          action={updateTestimonialsSection}
          fields={[
            {
              name: "testimonials_heading",
              label: "Heading",
              value: settings.testimonials_heading,
              placeholder: "What do our customers say?",
            },
          ]}
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>SBU band</h2>
        <SectionForm
          action={updateSbuSection}
          fields={[
            {
              name: "sbu_heading",
              label: "Large outline heading",
              value: settings.sbu_heading,
              placeholder: "SBU",
              hint: "The big outlined word above the slider.",
            },
            {
              name: "sbu_subheading",
              label: "Secondary label",
              value: settings.sbu_subheading,
              placeholder: "Other Initiatives",
            },
            {
              name: "sbu_bg_url",
              label: "Background photo",
              type: "media",
              value: settings.sbu_bg_url,
              folder: "kbs/homepage",
              hint: "Sits behind the slider under a dark overlay. A wide, low-contrast photo works best.",
            },
          ]}
        />
      </div>
    </>
  );
}
