import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProperties } from "@/lib/data/properties.server";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import ConstructionSearch from "./ConstructionSearch";
import styles from "./construction-status-index.module.css";
import { buildRouteMetadata } from "@/lib/data/routes";

/* Search visibility for this route is admin-controlled: the noindex
   flag and any title/description override come from route_settings.
   With no row, buildRouteMetadata returns this base unchanged. */
export async function generateMetadata() {
  return buildRouteMetadata("/construction-status", {
    title: "Construction Status",
    description: "Track live construction progress across every KBS project.",
  });
}

export default async function ConstructionStatusIndexPage() {
  const [properties, footerLinks, socialLinks] = await Promise.all([
    getProperties(),
    getFooterLinks(),
    getSocialLinks(),
  ]);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <ConstructionSearch properties={properties} />
      </main>
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
