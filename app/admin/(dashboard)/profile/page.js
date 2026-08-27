import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Profile" };

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <>
      <h1 className={styles.pageTitle}>Profile</h1>
      <p className={styles.pageDescription}>Update the admin sign-in email or password.</p>

      <div className={styles.card}>
        <ProfileForm currentEmail={user?.email || ""} />
      </div>
    </>
  );
}
