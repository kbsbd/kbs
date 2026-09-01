import Link from "next/link";
import { notFound } from "next/navigation";
import CrudManager from "@/components/admin/CrudManager";
import PageSettingsForm from "../PageSettingsForm";
import DeletePageButton from "./DeletePageButton";
import { getPageById, getPageSections } from "@/lib/data/pages";
import {
  updatePage,
  deletePage,
  createSection,
  updateSection,
  deleteSection,
  moveSection,
} from "@/lib/actions/pages";
import {
  SECTION_KINDS,
  sectionLabel,
  itemsToText,
  blocksToText,
  ITEM_KINDS,
  BLOCK_KINDS,
} from "@/lib/page-templates";
import styles from "../../../admin.module.css";

export const metadata = { title: "Edit page" };

const SECTION_FIELDS = [
  {
    name: "kind",
    label: "Section type",
    type: "select",
    defaultValue: "richtext",
    options: SECTION_KINDS.map((k) => ({ value: k.value, label: `${k.label} — ${k.group}` })),
    hint: "Each type uses only the fields it needs. The rest are ignored, so leaving them blank is fine.",
  },
  { name: "heading", label: "Heading", type: "text" },
  {
    name: "subheading",
    label: "Sub-heading / eyebrow",
    type: "text",
    hint: "Small label above the heading on the service and contact bands; the ticked-list heading on a text-and-image split.",
  },
  {
    name: "body",
    label: "Paragraphs",
    type: "textarea",
    rows: 5,
    hint: "Leave a blank line between paragraphs. Plain text only — no HTML. On a scrolling text strip, this is the phrase.",
  },
  {
    name: "items_text",
    label: "Ticked list / questions",
    type: "textarea",
    rows: 5,
    hint: `Ticked list — ${ITEM_KINDS.checklist} Questions and answers — ${ITEM_KINDS.faq} Card grid — ${ITEM_KINDS.cards}`,
  },
  {
    name: "blocks_text",
    label: "Groups, cards or reviews",
    type: "textarea",
    rows: 6,
    hint: `Text and image split — ${BLOCK_KINDS.feature_split}. Service grid — ${BLOCK_KINDS.services}. Customer reviews — ${BLOCK_KINDS.review_slider}. Contact band — ${BLOCK_KINDS.contact_block}.`,
  },
  {
    name: "image_url",
    label: "Image",
    type: "media",
    folder: "kbs/pages",
  },
  {
    name: "image_url_2",
    label: "Second image",
    type: "media",
    folder: "kbs/pages",
    hint: "The smaller picture that floats over the first one, on the About legacy block only.",
  },
  {
    name: "image_side",
    label: "Image side",
    type: "select",
    defaultValue: "right",
    options: [
      { value: "right", label: "Right of the text" },
      { value: "left", label: "Left of the text" },
    ],
  },
  {
    name: "badge_text",
    label: "Rotating badge text",
    type: "text",
    hint: "The ring of letters around the play button. Short phrases work best — it curves around a circle.",
  },
  {
    name: "video_url",
    label: "Video link",
    type: "text",
    placeholder: "https://www.youtube.com/watch?v=…",
    hint: "Opens in a lightbox over the page rather than navigating away.",
  },
  {
    name: "variant",
    label: "Style variation",
    type: "select",
    defaultValue: "",
    options: [
      { value: "", label: "Default" },
      { value: "two-column", label: "Ticked list — two columns" },
      { value: "quote", label: "Text and image — sub-heading as a pull quote" },
      { value: "slider", label: "Reviews — autoplaying slider" },
      { value: "carousel", label: "Reviews — scroll carousel" },
    ],
  },
  {
    name: "embed",
    label: "Built-in form",
    type: "select",
    defaultValue: "",
    options: [
      { value: "", label: "None" },
      { value: "service_finder", label: "Service finder (NRB)" },
      { value: "landowner_contact", label: "Enquiry form (Landowner)" },
    ],
    hint: "Only used by the contact band.",
  },
  { name: "cta_label", label: "Button label", type: "text", hint: "Call-to-action band only." },
  { name: "cta_href", label: "Button link", type: "text", placeholder: "/contact or https://…" },
  {
    name: "background",
    label: "Background",
    type: "select",
    defaultValue: "light",
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ],
  },
  { name: "sort_order", label: "Position", type: "number", defaultValue: 100 },
  { name: "is_active", label: "Visible on the page", type: "checkbox", defaultChecked: true },
];

export default async function AdminEditPagePage({ params }) {
  const { id } = await params;
  const page = await getPageById(id);

  if (!page) notFound();

  const sections = await getPageSections(id, { includeInactive: true });

  /* Two derivations happen here rather than in the client component, because
     props crossing the Server/Client boundary must be plain data:
       items_text  — the jsonb list rendered as the lines the admin edits
       display_*   — a readable label for a section that has no heading, so
                     the list never shows a blank row */
  const rows = sections.map((section) => {
    const itemCount = Array.isArray(section.items) ? section.items.length : 0;
    const summary =
      section.body?.replace(/\s+/g, " ").slice(0, 90) ||
      (itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"}` : "Empty");

    return {
      ...section,
      items_text: itemsToText(section.kind, section.items),
      blocks_text: blocksToText(section.kind, section.blocks),
      display_title: section.heading || `Untitled ${sectionLabel(section.kind).toLowerCase()}`,
      summary,
      meta: sectionLabel(section.kind),
    };
  });

  return (
    <>
      <h1 className={styles.pageTitle}>{page.title}</h1>
      <p className={styles.pageDescription}>
        Live at <code>/{page.slug}</code>
        {page.is_published ? (
          <>
            {" · "}
            <Link href={`/${page.slug}`} target="_blank">
              View page
            </Link>
          </>
        ) : (
          " · not published yet"
        )}
      </p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Sections</h2>
        <p className={styles.fieldHint} style={{ display: "block", marginBottom: "1.25rem" }}>
          The content of the page, top to bottom. Each section type uses only the fields it needs —
          the rest are ignored, so leaving them blank is fine.
        </p>

        <CrudManager
          rows={rows}
          fields={SECTION_FIELDS}
          createAction={createSection}
          updateAction={updateSection}
          deleteAction={deleteSection}
          moveAction={moveSection}
          extraFields={{ page_id: page.id }}
          addLabel="Add section"
          emptyLabel="No sections yet. Add one to put content on this page."
          confirmLabel="Delete this section?"
          primaryKey="display_title"
          secondaryKey="summary"
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Page settings</h2>
        <PageSettingsForm action={updatePage} page={page} mode="edit" />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Delete this page</h2>
        <p className={styles.fieldHint} style={{ display: "block", marginBottom: "1rem" }}>
          Removes the page and all of its sections. Any menu link pointing at
          <code> /{page.slug}</code> will need removing separately under Navigation.
        </p>
        <DeletePageButton id={page.id} title={page.title} />
      </div>

      <p className={styles.pageDescription}>
        <Link href="/admin/pages">Back to all pages</Link>
      </p>
    </>
  );
}
