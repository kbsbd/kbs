import Link from "next/link";
import { getProperties } from "@/lib/data/properties.server";
import DeletePropertyButton from "./DeletePropertyButton";
import styles from "../../admin.module.css";

export const metadata = { title: "Properties" };

export default async function AdminPropertiesPage() {
  const properties = await getProperties();

  return (
    <>
      <h1 className={styles.pageTitle}>Properties</h1>
      <p className={styles.pageDescription}>{properties.length} listing(s).</p>

      <div className={styles.card}>
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/admin/properties/new" className={styles.primaryButton}>
            Add property
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Featured</th>
              <th>Special offer</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id || property.slug}>
                <td>{property.title}</td>
                <td>{property.location}</td>
                <td>{property.is_featured ? "Yes" : "—"}</td>
                <td>{property.is_special_offer ? "Yes" : "—"}</td>
                <td>
                  <div className={styles.rowActions}>
                    {property.id && (
                      <>
                        <Link href={`/admin/properties/${property.id}`} className={styles.secondaryButton}>
                          Edit
                        </Link>
                        <DeletePropertyButton id={property.id} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
