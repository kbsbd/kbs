import { redirect } from "next/navigation";

export const metadata = { title: "KBS admin", robots: { index: false, follow: false } };

/**
 * There is one login for the whole site now. This old staff URL just forwards
 * to it, carrying a `next` so an admin still lands in the dashboard.
 */
export default async function AdminLoginRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/login?next=/${locale}/admin`);
}
