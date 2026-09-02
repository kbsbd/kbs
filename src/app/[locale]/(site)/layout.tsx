import { LOCALES, type Locale } from "@/content/seed";
import { getContent } from "@/lib/content";
import { resolveIntegrations } from "@/lib/integrations";
import SiteChrome from "@/components/SiteChrome";
import Integrations from "@/components/Integrations";
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
  const content = await getContent();
  const shopOn = content.shop.enabled;

  return (
    <CartProvider>
      <WishlistProvider>
        <SiteChrome content={content} locale={l}>
          {children}
        </SiteChrome>
        {shopOn && <CartDrawer l={l} symbol={content.shop.currencySymbol} />}
        <Integrations config={resolveIntegrations(content)} />
      </WishlistProvider>
    </CartProvider>
  );
}
