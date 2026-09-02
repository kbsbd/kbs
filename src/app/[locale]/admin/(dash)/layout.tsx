import { redirect } from "next/navigation";
import { getAdminSession, createAuthClient } from "@/lib/supabase/auth";

export const metadata = { title: "KBS admin", robots: { index: false, follow: false } };

/**
 * The gate. One login serves the whole site; this is where role is enforced:
 *   - not signed in        -> the single login, carrying `next`
 *   - signed in, not admin  -> their own account area
 *   - signed in as an admin -> through
 *
 * The admin check is a real server-side lookup (auth.getUser + a row in the
 * `admins` table), not a cookie the browser could set for itself.
 */
export default async function DashLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminSession();
  if (session) return <>{children}</>;

  const supabase = await createAuthClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  redirect(user ? `/${locale}/account` : `/${locale}/login?next=/${locale}/admin`);
}
