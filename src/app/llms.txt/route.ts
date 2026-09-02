import { getContent } from "@/lib/content";
import { getProducts } from "@/lib/shop";
import { siteUrl } from "@/lib/site-url";

/**
 * llms.txt — a brief for AI agents reading this site.
 *
 * The format is stricter than it looks: an H1, an optional blockquote summary,
 * then free prose, and after that every H2 section must be a list of markdown
 * links and nothing else. Prose under an H2 fails the llms-txt audit — keep new
 * sections as link lists.
 */
export const revalidate = 3600;

export async function GET() {
  const c = await getContent();
  const base = siteUrl();
  const shopOn = c.shop.enabled;
  const products = shopOn ? await getProducts({ limit: 30 }) : [];

  const productLines = products
    .map((p) => `- [${p.name}](${base}/en/shop/${p.slug})`)
    .join("\n");

  const body = `# KBS / Kanchan Builders

> A Bangladeshi construction, real-estate and sanitary/plumbing company, working since ${c.site.founded}. It develops residential buildings — its current project is KB Homes in Faidabad, Dokhinkhan, Dhaka — installs and consults on sanitary, plumbing and water-treatment systems, and imports and sells the related products.

The site asks for three kinds of contact: booking a site visit at KB Homes, a
message through the contact form (general, project or product), and — in the
shop — a cash-on-delivery order or a request for a quote. Someone from the KBS
office replies by email or phone, usually the same working day.

No claims are made about regulatory approval status, and there are no awards or
ratings. Specifications shown as "to be confirmed" are genuinely not fixed.

## Pages

- [Home / KB Homes, English](${base}/en)
- [Home / KB Homes, Bengali](${base}/bn)
- [Services](${base}/en/services): sanitary & plumbing consultancy and works, import & distribution, booster pumps, core hole cutting, deep tube wells, water-treatment plants, CPVC
- [KB Homes](${base}/en/kb-homes): the residential building in Faidabad, Dokhinkhan, Dhaka - 1230
- [Clients](${base}/en/clients)
- [Reach us](${base}/en/contact): contact form, phone and WhatsApp
${shopOn ? `- [Shop](${base}/en/shop): sanitary ware, plumbing fittings, pumps, CPVC pipe, water-treatment equipment` : ""}

## Contact

- [Contact form](${base}/en/contact)
- [Book a site visit](${base}/en#book): name, phone number and preferred day
${c.site.phone ? `- Phone: ${c.site.phone}` : ""}
${c.site.whatsapp ? `- WhatsApp: ${c.site.whatsapp}` : ""}
${c.site.email ? `- Email: ${c.site.email}` : ""}
${
  shopOn && products.length
    ? `\n## Products\n\n${productLines}\n`
    : ""
}
## Machine readable

- [Sitemap](${base}/sitemap.xml)
- [Robots](${base}/robots.txt)
`;

  return new Response(body.replace(/\n{3,}/g, "\n\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
