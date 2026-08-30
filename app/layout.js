import { Outfit } from "next/font/google";
import "./globals.css";
import { getSiteSettings, resolveMetaTitle } from "@/lib/data/site";
import { getSocialLinks } from "@/lib/data/footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/*
 * Everything below used to be module-level constants. It now comes from the
 * site_settings row, so the admin controls the browser tab icon, the wordmark,
 * the default <title>/description, and the OG image without a deploy.
 *
 * generateMetadata runs per request on the server; getSiteSettings falls back
 * to the bundled defaults when Supabase is unreachable, so a database outage
 * degrades to the previous hardcoded values rather than an empty <head>.
 */
export async function generateMetadata() {
  const settings = await getSiteSettings();

  const siteName = settings.site_name || "KBS";
  const title = resolveMetaTitle(settings);
  const description = settings.meta_description || "";
  const ogImages = settings.og_image_url ? [{ url: settings.og_image_url }] : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: "/",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
    icons: {
      icon: settings.favicon_url || "/favicon.ico",
      apple: settings.apple_icon_url || settings.favicon_url || "/favicon.ico",
    },
  };
}

function buildJsonLd(settings, socialLinks) {
  const siteName = settings.site_name || "KBS";
  const description = settings.meta_description || "";

  const organization = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: siteName,
    url: SITE_URL,
    description,
    ...(settings.logo_url ? { logo: settings.logo_url } : {}),
    ...(settings.contact_phone ? { telephone: settings.contact_phone } : {}),
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    ...(settings.contact_address
      ? {
          address: {
            "@type": "PostalAddress",
            // The admin edits one free-text address line, so emit it as the
            // street address rather than inventing a parse of it.
            streetAddress: settings.contact_address,
            addressCountry: "BD",
          },
        }
      : {}),
    sameAs: (socialLinks || []).map((s) => s.url).filter(Boolean),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
  };

  return [organization, website];
}

export default async function RootLayout({ children }) {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()]);
  const [organizationJsonLd, websiteJsonLd] = buildJsonLd(settings, socialLinks);

  return (
    <html lang="en" className={outfit.variable}>
      {/* WordPress renders body_class('bg-theme'), so the page canvas is
          --theme-color (#1C1C1C). Sections that look dark without a
          background of their own (the testimonial slider) rely on this. */}
      <body className="bg-theme">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
