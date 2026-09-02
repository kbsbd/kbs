import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import SiteChrome from "@/components/SiteChrome";
import Analytics from "@/components/Analytics";

/**
 * The public site's chrome. It lives in a route group so the admin area, which
 * sits at the same URL depth, does not inherit the marketing nav and footer.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = ((LOCALES as readonly string[]).includes(locale) ? locale : "en") as Locale;
  const content = await getContent();

  return (
    <>
      <SiteChrome content={content} locale={l}>
        {children}
      </SiteChrome>
      <Analytics pixelId={content.site.metaPixelId} />
    </>
  );
}
