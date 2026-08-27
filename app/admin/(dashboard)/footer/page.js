import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import FooterLinksManager from "./FooterLinksManager";
import SocialLinksManager from "./SocialLinksManager";
import styles from "../../admin.module.css";

export const metadata = { title: "Footer & Social" };

export default async function AdminFooterPage() {
  const [footerLinks, socialLinks] = await Promise.all([getFooterLinks(), getSocialLinks()]);

  return (
    <>
      <h1 className={styles.pageTitle}>Footer & Social</h1>
      <p className={styles.pageDescription}>Links shown in the site footer.</p>

      <div className={styles.card}>
        <h2 style={{ fontSize: "1.05rem", marginTop: 0, color: "#fff" }}>Footer links</h2>
        <FooterLinksManager links={footerLinks} />
      </div>

      <div className={styles.card}>
        <h2 style={{ fontSize: "1.05rem", marginTop: 0, color: "#fff" }}>Social links</h2>
        <SocialLinksManager links={socialLinks} />
      </div>
    </>
  );
}
