import CrudManager from "@/components/admin/CrudManager";
import { getTimelineEntries } from "@/lib/data/timeline-entries";
import {
  createTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry,
  moveTimelineEntry,
} from "@/lib/actions/timeline";
import styles from "../../admin.module.css";

export const metadata = { title: "Company history" };

const FIELDS = [
  {
    name: "date_label",
    label: "Date on the rail",
    type: "text",
    required: true,
    placeholder: "1984",
    hint: "The short label on the scrolling date strip.",
  },
  {
    name: "title",
    label: "Heading",
    type: "text",
    required: true,
    placeholder: "1984-1985",
  },
  { name: "body", label: "Story", type: "textarea", rows: 5 },
  { name: "image_url", label: "Photo", type: "media", folder: "kbs/timeline" },
  {
    name: "image_position",
    label: "Photo side",
    type: "select",
    defaultValue: "left",
    options: [
      { value: "left", label: "Left of the text" },
      { value: "right", label: "Right of the text" },
    ],
  },
  {
    name: "link_label",
    label: "Link label",
    type: "text",
    hint: "Leave both link fields empty to show no link.",
  },
  { name: "link_url", label: "Link address", type: "text", placeholder: "/properties or https://…" },
  { name: "sort_order", label: "Position", type: "number", defaultValue: 100 },
  { name: "is_active", label: "Show this entry", type: "checkbox", defaultChecked: true },
];

export default async function AdminTimelinePage() {
  const entries = await getTimelineEntries({ includeInactive: true });

  const rows = entries.map((entry) => ({
    ...entry,
    meta: entry.image_position === "right" ? "photo right" : "photo left",
    summary: entry.body ? entry.body.replace(/\s+/g, " ").slice(0, 90) : "No story yet",
  }));

  return (
    <>
      <h1 className={styles.pageTitle}>Company history</h1>
      <p className={styles.pageDescription}>
        The year-by-year company history. It appears wherever a page has a “Company timeline”
        section — the About page by default.
      </p>

      <div className={styles.notice}>
        <strong>One history, shared</strong>
        <p>
          These entries are not tied to a single page. Any page with a timeline section shows this
          same list, so there is one place to keep it current.
        </p>
      </div>

      <div className={styles.card}>
        <CrudManager
          rows={rows}
          fields={FIELDS}
          createAction={createTimelineEntry}
          updateAction={updateTimelineEntry}
          deleteAction={deleteTimelineEntry}
          moveAction={moveTimelineEntry}
          addLabel="Add entry"
          emptyLabel="No timeline entries yet."
          confirmLabel="Delete this timeline entry?"
          primaryKey="title"
          secondaryKey="summary"
        />
      </div>
    </>
  );
}
