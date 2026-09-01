import { getSiteSettings } from "@/lib/data/site";
import BrandingForm from "./BrandingForm";
import SeoForm from "./SeoForm";
import ContactForm from "./ContactForm";
import FooterSettingsForm from "./FooterSettingsForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Branding & contact" };

export default async function AdminSitePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <h1 className={styles.pageTitle}>Branding &amp; contact</h1>
      <p className={styles.pageDescription}>
        The name, icon and contact details used across every page — browser tab icon, header
        wordmark, search-result snippet, footer address and the share preview.
      </p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Identity</h2>
        <BrandingForm settings={settings} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Search &amp; social preview</h2>
        <SeoForm settings={settings} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Contact details</h2>
        <ContactForm settings={settings} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Footer</h2>
        <FooterSettingsForm settings={settings} />
      </div>
    </>
  );
}
