import LoginForm from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import styles from "../admin.module.css";

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className={styles.authScreen}>
      <div className={styles.authCard}>
        <p className={styles.authBrand}>KBS Admin</p>

        {isSupabaseConfigured ? (
          <LoginForm />
        ) : (
          <p className={styles.notConfigured}>
            Supabase isn&apos;t configured yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment, run the migration
            in <code>supabase/migrations</code>, and create an admin user before signing in.
          </p>
        )}
      </div>
    </div>
  );
}
