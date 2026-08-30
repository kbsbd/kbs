import CrudManager from "@/components/admin/CrudManager";
import { getNavLinks } from "@/lib/data/nav";
import { createNavLink, updateNavLink, deleteNavLink, moveNavLink } from "@/lib/actions/nav";
import styles from "../../admin.module.css";

export const metadata = { title: "Navigation" };

const FIELDS = [
  { name: "label", label: "Label", type: "text", required: true, placeholder: "About Us" },
  {
    name: "href",
    label: "Link",
    type: "text",
    required: true,
    placeholder: "/about or https://…",
  },
  {
    name: "placement",
    label: "Show in",
    type: "select",
    defaultValue: "drawer",
    options: [
      { value: "drawer", label: "Menu drawer only" },
      { value: "primary", label: "Header bar only" },
      { value: "both", label: "Header bar and drawer" },
    ],
  },
  {
    name: "sort_order",
    label: "Position",
    type: "number",
    defaultValue: 100,
    hint: "Lower numbers come first. The arrows do this for you.",
  },
  {
    name: "external",
    label: "Open in a new tab",
    type: "checkbox",
    defaultChecked: false,
  },
  { name: "is_active", label: "Visible on the site", type: "checkbox", defaultChecked: true },
];

const PLACEMENT_LABELS = {
  primary: "header bar",
  drawer: "menu drawer",
  both: "header bar + drawer",
};

export default async function AdminNavigationPage() {
  const links = (await getNavLinks()).map((row) => ({
    ...row,
    _meta: PLACEMENT_LABELS[row.placement] || row.placement,
  }));

  return (
    <>
      <h1 className={styles.pageTitle}>Navigation</h1>
      <p className={styles.pageDescription}>
        The links in the header bar and the slide-out menu. “Header bar” is the short strip next to
        the logo on desktop; “menu drawer” is the panel behind the ☰ button, which is also the whole
        mobile menu.
      </p>

      <div className={styles.card}>
        <CrudManager
          rows={links}
          fields={FIELDS}
          createAction={createNavLink}
          updateAction={updateNavLink}
          deleteAction={deleteNavLink}
          moveAction={moveNavLink}
          addLabel="Add link"
          emptyLabel="No navigation links yet."
          confirmLabel="Remove this link from the menu?"
        />
      </div>
    </>
  );
}
