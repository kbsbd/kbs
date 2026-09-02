import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Archivo, Hanken_Grotesk, IBM_Plex_Mono, Anek_Bangla, Hind_Siliguri } from "next/font/google";
import "../globals.css";
import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { resolveIntegrations } from "@/lib/integrations";
import { img, faviconUrl } from "@/lib/media";
import { siteUrl } from "@/lib/site-url";

/* Display: wide, geometric, architectural. Echoes the building's concrete slabs.
   Neither Inter nor Roboto appears anywhere on this site. */
const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});

/* Bengali gets a real pairing, not a fallback. Anek Bangla carries a matching
   width axis so the two scripts sit at the same visual weight. */
const displayBn = Anek_Bangla({
  subsets: ["bengali", "latin"],
  weight: "700",
  variable: "--font-display-bn",
  display: "swap",
});

const bodyBn = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-bn",
  display: "swap",
});

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "en";
  const c = await getContent();
  const integrations = resolveIntegrations(c);

  const title =
    l === "bn"
      ? "কেবি হাউস, কেবিএস। ঢাকায় নির্মাণাধীন।"
      : "KB HOUSE by KBS. Under construction in Dhaka.";
  const description =
    l === "bn"
      ? "কেবি হাউস: প্রতিটি তলায় নিজস্ব সবুজ বারান্দা। ঢাকায় নির্মাণাধীন। সাইট ভিজিট বুক করুন।"
      : "KB HOUSE: every floor has its own planted terrace. Under construction in Dhaka. Book a site visit.";

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    other: {
      ...(integrations.googleSiteVerification
        ? { "google-site-verification": integrations.googleSiteVerification }
        : {}),
      ...(integrations.bingSiteVerification
        ? { "msvalidate.01": integrations.bingSiteVerification }
        : {}),
    },
    alternates: {
      languages: { en: "/en", bn: "/bn" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: l === "bn" ? "bn_BD" : "en_US",
      url: `${siteUrl()}/${l}`,
      images: [img("hero-ending", 1200)],
    },
    icons: c.site.favicon
      ? {
          icon: [
            { url: faviconUrl(c.site.favicon, 32), sizes: "32x32" },
            { url: faviconUrl(c.site.favicon, 192), sizes: "192x192" },
          ],
          apple: [{ url: faviconUrl(c.site.favicon, 180), sizes: "180x180" }],
        }
      : {
          icon: [
            {
              url:
                "data:image/svg+xml," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0B1622"/><g fill="#88C038"><path d="M6 6h9l-4.5 10z"/><path d="M6 26h9l-4.5-10z"/><path d="M17 6h4a5 5 0 0 1 0 10h-4z"/><path d="M17 16h5a5 5 0 0 1 0 10h-5z"/></g></svg>`
                ),
              type: "image/svg+xml",
            },
          ],
        },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1622" },
    { media: "(prefers-color-scheme: light)", color: "#f5f3ec" },
  ],
};

/* Resolves the theme before the first paint, so there is no flash. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('kbs:theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const l = locale as Locale;
  const content = await getContent();
  const { gtmId } = resolveIntegrations(content);

  const fontVars = [
    display.variable,
    body.variable,
    mono.variable,
    displayBn.variable,
    bodyBn.variable,
  ].join(" ");

  return (
    <html lang={l} className={fontVars} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        )}
        <a href="#main" className="skip-link">
          {l === "bn" ? "মূল অংশে যান" : "Skip to content"}
        </a>
        <div className="env" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
