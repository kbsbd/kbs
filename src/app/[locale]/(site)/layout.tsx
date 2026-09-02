import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { resolveIntegrations } from "@/lib/integrations";
import { getMenu } from "@/lib/cms";
import { siteUrl } from "@/lib/site-url";
import { img } from "@/lib/media";
import SiteChrome from "@/components/SiteChrome";
import Integrations from "@/components/Integrations";
import JsonLd, { siteGraph } from "@/components/JsonLd";
import { CartProvider } from "@/components/shop/cart";
import { WishlistProvider } from "@/components/shop/wishlist";
import CartDrawer from "@/components/shop/CartDrawer";

/**
 * The public site's chrome. It lives in a route group so the admin area, which
 * sits at the same URL depth, does not inherit the marketing nav and footer —
 * or any of the analytics tags.
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
  const [content, menu] = await Promise.all([getContent(), getMenu()]);
  const shopOn = content.shop.enabled;
  const base = siteUrl();

  const graph = siteGraph({
    base,
    name: content.site.name,
    founded: content.site.founded,
    description: content.site.tagline?.[l],
    logo: content.site.logo ? img(content.site.logo, 512) : undefined,
    telephone: content.site.phone || undefined,
    email: content.site.email || undefined,
    streetAddress: content.site.address?.[l] || undefined,
    sameAs: content.site.socials?.map((s) => s.href).filter(Boolean),
  });

  return (
    <CartProvider>
      <WishlistProvider>
        <JsonLd data={graph} />
        <SiteChrome content={content} locale={l} menu={menu}>
          {children}
        </SiteChrome>
        {shopOn && <CartDrawer l={l} symbol={content.shop.currencySymbol} />}
        <Integrations config={resolveIntegrations(content)} />
      </WishlistProvider>
    </CartProvider>
  );
}
