import PropertyForm from "../PropertyForm";
import { createProperty } from "@/lib/actions/properties";
import styles from "../../../admin.module.css";

export const metadata = { title: "Add property" };

export default function NewPropertyPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Add property</h1>
      <div className={styles.card}>
        <PropertyForm action={createProperty} />
      </div>
    </>
  );
}
