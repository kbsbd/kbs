import type { Locale, SiteContent } from "@/content/seed";
import { siteUrl } from "@/lib/site-url";
import { img } from "@/lib/media";

/**
 * Structured data for the developer and for KB HOUSE itself.
 *
 * Only facts that are actually true go in here. Nothing about approvals, and no
 * invented ratings or prices, because a rich result built on a claim the client
 * cannot back up is worse than no rich result.
 */
export default function StructuredData({ c, l }: { c: SiteContent; l: Locale }) {
  const base = siteUrl();

  /* Organization + WebSite come from the site layout, on every page. Here the
     home page adds the building itself and the FAQ, both tied back to the org. */
  const project = {
    "@type": "ApartmentComplex",
    name: "KB HOUSE",
    url: `${base}/${l}`,
    description: c.staticHero.sub[l],
    image: `${base}${img("hero-ending", 1600)}`,
    numberOfFloors: 9,
    address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
    provider: { "@id": `${base}/#org` },
    amenityFeature: c.amenities.items.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.title[l],
      value: true,
    })),
  };

  const faq = {
    "@type": "FAQPage",
    "@id": `${base}/${l}#faq`,
    mainEntity: c.faq.items.map((f) => ({
      "@type": "Question",
      name: f.q[l],
      acceptedAnswer: { "@type": "Answer", text: f.a[l] },
    })),
  };

  const graph = { "@context": "https://schema.org", "@graph": [project, faq] };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
