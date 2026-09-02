import { redirect } from "next/navigation";
import { getAdminSession, createAuthClient } from "@/lib/supabase/auth";
import { getContent } from "@/lib/content";
import { editableStrings } from "@/lib/editable";
import Dashboard from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminSession();
  const supabase = await createAuthClient();
  /* The (dash) layout already gates this, but it renders alongside the page
     rather than strictly before it, so guard here too before the non-null uses. */
  if (!session || !supabase) redirect(`/${locale}/admin/login`);
  const content = await getContent();

  const [bookingsRes, projectsRes, notesRes] = await Promise.all([
    supabase!.from("bookings").select("*").order("created_at", { ascending: false }).limit(300),
    supabase!.from("projects").select("*").order("sort", { ascending: true }),
    supabase!.from("internal_notes").select("key, value"),
  ]);

  return (
    <Dashboard
      locale={locale}
      email={session!.email}
      groups={editableStrings(content)}
      site={content.site}
      integrations={content.integrations}
      bookings={bookingsRes.data ?? []}
      projects={projectsRes.data ?? []}
      notes={notesRes.data ?? []}
    />
  );
}
