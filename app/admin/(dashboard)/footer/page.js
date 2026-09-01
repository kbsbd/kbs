import CrudManager from "@/components/admin/CrudManager";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import {
  addFooterLink,
  updateFooterLink,
  deleteFooterLink,
  moveFooterLink,
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  moveSocialLink,
} from "@/lib/actions/footer";
import styles from "../../admin.module.css";

export const metadata = { title: "Footer & social links" };

const FOOTER_FIELDS = [
  { name: "label", label: "Label", type: "text", required: true, placeholder: "Gallery" },
  {
    name: "href",
    label: "Link",
    type: "text",
    required: true,
    placeholder: "/gallery or https://…",
  },
  { name: "sort_order", label: "Position", type: "number", defaultValue: 100 },
  { name: "open_new_tab", label: "Open in a new tab", type: "checkbox", defaultChecked: false },
  { name: "is_active", label: "Visible on the site", type: "checkbox", defaultChecked: true },
];

/* Only platforms the footer has an icon class for — anything else would render
   a generic link glyph. Keep in sync with SOCIAL_ICONS in components/Footer.jsx. */
const SOCIAL_FIELDS = [
  {
    name: "platform",
    label: "Platform",
    type: "select",
    defaultValue: "facebook",
    options: [
      { value: "facebook", label: "Facebook" },
      { value: "linkedin", label: "LinkedIn" },
      { value: "instagram", label: "Instagram" },
      { value: "youtube", label: "YouTube" },
      { value: "x", label: "X / Twitter" },
      { value: "tiktok", label: "TikTok" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "pinterest", label: "Pinterest" },
      { value: "threads", label: "Threads" },
    ],
  },
  { name: "url", label: "URL", type: "url", required: true, placeholder: "https://…" },
  {
    name: "label",
    label: "Accessible label",
    type: "text",
    placeholder: "Defaults to the platform name",
    hint: "Read out by screen readers, since the icon has no text.",
  },
  { name: "sort_order", label: "Position", type: "number", defaultValue: 100 },
  { name: "is_active", label: "Visible on the site", type: "checkbox", defaultChecked: true },
];

export default async function AdminFooterPage() {
  const [footerLinks, socialLinks] = await Promise.all([getFooterLinks(), getSocialLinks()]);

  return (
    <>
      <h1 className={styles.pageTitle}>Footer &amp; social links</h1>
      <p className={styles.pageDescription}>
        The link list and social icons at the bottom of every page. The address, copyright line and
        newsletter heading live under Site &amp; Branding.
      </p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Footer links</h2>
        <CrudManager
          rows={footerLinks}
          fields={FOOTER_FIELDS}
          createAction={addFooterLink}
          updateAction={updateFooterLink}
          deleteAction={deleteFooterLink}
          moveAction={moveFooterLink}
          addLabel="Add link"
          emptyLabel="No footer links yet."
          confirmLabel="Remove this footer link?"
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Social links</h2>
        <CrudManager
          rows={socialLinks}
          fields={SOCIAL_FIELDS}
          createAction={addSocialLink}
          updateAction={updateSocialLink}
          deleteAction={deleteSocialLink}
          moveAction={moveSocialLink}
          addLabel="Add social link"
          emptyLabel="No social links yet."
          confirmLabel="Remove this social link?"
          primaryKey="platform"
          secondaryKey="url"
        />
      </div>
    </>
  );
}
