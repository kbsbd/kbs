/**
 * One JSON-LD block. Pass a schema.org node or an array of them; an array is
 * wrapped in an @graph so a page emits a single script.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...(data as object) };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

/** The Organization + WebSite pair, shared by every page through the layout. */
export function siteGraph(opts: {
  base: string;
  name: string;
  founded?: string;
  description?: string;
  logo?: string;
  telephone?: string;
  email?: string;
  streetAddress?: string;
  sameAs?: string[];
}) {
  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${opts.base}/#org`,
    name: opts.name,
    url: `${opts.base}/`,
    areaServed: "BD",
  };
  if (opts.founded) org.foundingDate = opts.founded;
  if (opts.description) org.description = opts.description;
  if (opts.logo) org.logo = opts.logo;
  if (opts.telephone) org.telephone = opts.telephone;
  if (opts.email) org.email = opts.email;
  if (opts.streetAddress)
    org.address = {
      "@type": "PostalAddress",
      streetAddress: opts.streetAddress,
      addressCountry: "BD",
    };
  if (opts.sameAs?.length) org.sameAs = opts.sameAs;

  const website = {
    "@type": "WebSite",
    "@id": `${opts.base}/#website`,
    url: `${opts.base}/`,
    name: opts.name,
    inLanguage: ["en", "bn"],
    publisher: { "@id": `${opts.base}/#org` },
  };

  return [org, website];
}
