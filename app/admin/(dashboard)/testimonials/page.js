import CrudManager from "@/components/admin/CrudManager";
import { getTestimonials } from "@/lib/data/testimonials";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  moveTestimonial,
} from "@/lib/actions/testimonials";
import styles from "../../admin.module.css";

export const metadata = { title: "Customer reviews" };

const FIELDS = [
  {
    name: "image_url",
    label: "Review image",
    type: "media",
    folder: "kbs/testimonials",
    required: true,
    hint: "A screenshot or photo of the review. Uploading fills in the size automatically.",
  },
  {
    name: "alt_text",
    label: "Alt text",
    type: "text",
    placeholder: "Customer review",
    hint: "Describes the image for screen readers.",
  },
  {
    name: "caption",
    label: "Lightbox caption",
    type: "text",
    placeholder: "Customer review",
  },
  {
    name: "width",
    label: "Image width (px)",
    type: "number",
    hint: "Optional. Setting the real width and height stops the slider jumping as images load.",
  },
  { name: "height", label: "Image height (px)", type: "number" },
  { name: "sort_order", label: "Position", type: "number", defaultValue: 100 },
  { name: "is_active", label: "Visible on the site", type: "checkbox", defaultChecked: true },
];

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials({ includeInactive: true });

  const rows = testimonials.map((item) => ({
    ...item,
    meta: item.width && item.height ? `${item.width}\u00d7${item.height}` : null,
  }));

  return (
    <>
      <h1 className={styles.pageTitle}>Customer reviews</h1>
      <p className={styles.pageDescription}>
        The customer-review images in the homepage slider. Clicking one on the site opens it full
        size in a lightbox.
      </p>

      <div className={styles.notice}>
        <strong>Heading</strong>
        <p>
          The band’s heading (“What do our customers say?”) is set under Homepage, alongside the
          other section headings.
        </p>
      </div>

      <div className={styles.card}>
        <CrudManager
          rows={rows}
          fields={FIELDS}
          createAction={createTestimonial}
          updateAction={updateTestimonial}
          deleteAction={deleteTestimonial}
          moveAction={moveTestimonial}
          addLabel="Add review"
          emptyLabel="No reviews yet."
          confirmLabel="Remove this review from the slider?"
          primaryKey="alt_text"
          secondaryKey="image_url"
        />
      </div>
    </>
  );
}
