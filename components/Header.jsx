import HeaderClient from "./HeaderClient";
import FixedActions from "./FixedActions";
import ScrollTop from "./ScrollTop";
import { getSiteSettings } from "@/lib/data/site";
import { getNavLinks, primaryNavLinks, drawerNavLinks } from "@/lib/data/nav";
import { getCtaButtons } from "@/lib/data/cta";
import { optimiseUrl } from "@/lib/cloudinary";

/*
 * Header is now a Server Component whose only job is to fetch. All of the
 * interactive behaviour (sticky scroll, the mobile drawer, the slide-out side
 * menu) lives in HeaderClient.
 *
 * The split matters because it means every page that already renders <Header />
 * picks up admin-managed navigation, branding and CTA buttons without the page
 * itself having to fetch or forward anything.
 */

export default async function Header() {
  const [settings, navLinks, ctaButtons] = await Promise.all([
    getSiteSettings(),
    getNavLinks(),
    getCtaButtons(),
  ]);

  // The upload is already resized in the browser (see MediaPicker); this asks
  // Cloudinary to also negotiate AVIF/WebP and cap the width on delivery.
  const logoUrl = optimiseUrl(settings.logo_url, "f_auto,q_auto,w_600,c_limit");

  return (
    <>
      <HeaderClient
        primaryLinks={primaryNavLinks(navLinks)}
        drawerLinks={drawerNavLinks(navLinks)}
        siteName={settings.site_name || "KBS"}
        logoUrl={logoUrl}
        logoAlt={settings.logo_alt || settings.site_name || "KBS"}
      />
      <FixedActions buttons={ctaButtons} />
      <ScrollTop />
    </>
  );
}
