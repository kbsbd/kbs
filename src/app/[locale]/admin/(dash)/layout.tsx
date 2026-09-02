import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";

export const metadata = { title: "KBS admin", robots: { index: false, follow: false } };

/**
 * The gate. Every page under it is admin only, and the check is a real server
 * side session lookup plus a row in the admins table, not a cookie the browser
 * could set for itself.
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
  if (!session) redirect(`/${locale}/admin/login`);
  return <>{children}</>;
}
