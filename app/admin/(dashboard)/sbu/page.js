import CrudManager from "@/components/admin/CrudManager";
import { getSbuUnits } from "@/lib/data/sbu";
import { createSbuUnit, updateSbuUnit, deleteSbuUnit, moveSbuUnit } from "@/lib/actions/sbu";
import styles from "../../admin.module.css";

export const metadata = { title: "Business units" };

const FIELDS = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Square Feet Story",
  },
  {
    name: "logo_url",
    label: "Logo",
    type: "media",
    folder: "kbs/sbu",
    maxDimension: 600,
    hint: "Shown as a square tile behind a shaped mask, about 500px. A square image on a plain background works best.",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    rows: 4,
    hint: "Revealed over the logo on hover.",
  },
  {
    name: "url",
    label: "Link",
    type: "text",
    placeholder: "https://… or /fss",
  },
  { name: "sort_order", label: "Position", type: "number", defaultValue: 100 },
  { name: "is_active", label: "Visible on the site", type: "checkbox", defaultChecked: true },
];

export default async function AdminSbuPage() {
  const units = await getSbuUnits({ includeInactive: true });

  return (
    <>
      <h1 className={styles.pageTitle}>Business units</h1>
      <p className={styles.pageDescription}>
        The business units in the “Other Initiatives” slider near the bottom of the homepage.
      </p>

      <div className={styles.notice}>
        <strong>Heading and background</strong>
        <p>
          The big outlined heading and the photo behind this slider are set under Homepage, in the
          SBU band section.
        </p>
      </div>

      <div className={styles.card}>
        <CrudManager
          rows={units}
          fields={FIELDS}
          createAction={createSbuUnit}
          updateAction={updateSbuUnit}
          deleteAction={deleteSbuUnit}
          moveAction={moveSbuUnit}
          addLabel="Add unit"
          emptyLabel="No business units yet."
          confirmLabel="Remove this unit from the slider?"
          primaryKey="name"
          secondaryKey="url"
        />
      </div>
    </>
  );
}
