import CrudManager from "@/components/admin/CrudManager";
import { getCtaButtons } from "@/lib/data/cta";
import { CTA_ICON_KEYS } from "@/lib/cta-defaults";
import { CTA_ICON_LABELS } from "@/components/CtaIcon";
import { createCtaButton, updateCtaButton, deleteCtaButton } from "@/lib/actions/cta";
import styles from "../../admin.module.css";

export const metadata = { title: "Floating contact buttons" };

const FIELDS = [
  { name: "label", label: "Label", type: "text", required: true, placeholder: "Call" },
  {
    name: "href",
    label: "Link",
    type: "text",
    required: true,
    placeholder: "tel:16604 · https://wa.me/… · /contact",
    hint: "tel: dials, mailto: opens email, https:// opens a site, /path goes to a page here.",
  },
  {
    name: "icon",
    label: "Icon",
    type: "select",
    defaultValue: "phone",
    options: CTA_ICON_KEYS.map((key) => ({ value: key, label: CTA_ICON_LABELS[key] || key })),
  },
  {
    name: "accent_color",
    label: "Hover colour",
    type: "color",
    placeholder: "#25D366",
    hint: "Hex only, e.g. #25D366. Leave empty for the default dark hover.",
  },
  {
    name: "sort_order",
    label: "Position",
    type: "number",
    defaultValue: 100,
    hint: "Lower numbers sit higher in the stack.",
  },
  { name: "external", label: "Open in a new tab", type: "checkbox", defaultChecked: false },
  { name: "is_active", label: "Visible on the site", type: "checkbox", defaultChecked: true },
];

export default async function AdminCtaPage() {
  const buttons = await getCtaButtons({ includeInactive: true });

  const rows = buttons.map((button) => ({
    ...button,
    meta: CTA_ICON_LABELS[button.icon] || button.icon,
  }));

  return (
    <>
      <h1 className={styles.pageTitle}>Floating contact buttons</h1>
      <p className={styles.pageDescription}>
        The floating buttons pinned to the right edge of every page.
      </p>

      <div className={styles.notice}>
        <strong>How they behave</strong>
        <p>
          On desktop all the buttons are visible as a vertical stack. On tablets and phones
          (1024px and below) they collapse behind a single dot in the bottom-right corner — tapping
          the dot pops them open, and tapping anywhere else, or pressing Escape, closes them again.
          Buttons you hide here disappear from both.
        </p>
      </div>

      <div className={styles.card}>
        <CrudManager
          rows={rows}
          fields={FIELDS}
          createAction={createCtaButton}
          updateAction={updateCtaButton}
          deleteAction={deleteCtaButton}
          addLabel="Add button"
          emptyLabel="No CTA buttons yet."
          confirmLabel="Delete this button?"
        />
      </div>
    </>
  );
}
