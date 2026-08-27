import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/data/properties.server";
import PropertyForm from "../PropertyForm";
import { updateProperty } from "@/lib/actions/properties";
import styles from "../../../admin.module.css";

export const metadata = { title: "Edit property" };

export default async function EditPropertyPage({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) notFound();

  return (
    <>
      <h1 className={styles.pageTitle}>Edit property</h1>
      <div className={styles.card}>
        <PropertyForm property={property} action={updateProperty} />
      </div>
    </>
  );
}
