import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "KBS";
const SITE_DESCRIPTION =
  "KBS is a leading real estate developer building functional, design-forward homes in Dhaka and Chattogram.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – A Leading Real Estate Developer in Bangladesh`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} – A Leading Real Estate Developer in Bangladesh`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – A Leading Real Estate Developer in Bangladesh`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/wp-content/uploads/2021/05/cropped-site-icon-788309-102463-32x32.png",
    apple: "/wp-content/uploads/2021/05/cropped-site-icon-788309-102463-180x180.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Celebration Point, Plot: 3 & 5, Road: 113/A, Gulshan-2",
    addressLocality: "Dhaka",
    postalCode: "1212",
    addressCountry: "BD",
  },
  sameAs: [
    "https://www.facebook.com/btibd/",
    "https://www.linkedin.com/company/btibd",
    "https://www.instagram.com/btibd",
    "https://www.youtube.com/c/btibuildingtechnologyideasltd",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({ children }) {
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
