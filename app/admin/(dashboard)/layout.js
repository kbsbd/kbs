import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "./SidebarNav";
import SignOutButton from "./SignOutButton";
import styles from "../admin.module.css";

export const metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/admin/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarBrand}>KBS Admin</p>
        <SidebarNav />
        <div className={styles.sidebarFooter}>
          <p className={styles.sidebarUser}>{user.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
