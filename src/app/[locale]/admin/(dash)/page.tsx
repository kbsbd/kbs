import { redirect } from "next/navigation";
import { getAdminSession, createAuthClient } from "@/lib/supabase/auth";
import { getContent } from "@/lib/content";
import { editableStrings } from "@/lib/editable";
import { loadShopAdmin } from "@/lib/shop-admin";
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

  const [bookingsRes, projectsRes, notesRes, shop, pagesRes, menuRes] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.from("projects").select("*").order("sort", { ascending: true }),
    supabase.from("internal_notes").select("key, value"),
    loadShopAdmin(supabase),
    supabase.from("cms_pages").select("*").order("sort", { ascending: true }),
    supabase.from("cms_menu_items").select("*").order("sort", { ascending: true }),
  ]);

  const cms = {
    pages: (pagesRes.data ?? []).map((p) => ({
      id: String(p.id),
      slug: String(p.slug ?? ""),
      title: String(p.title ?? ""),
      title_bn: String(p.title_bn ?? ""),
      seo_description: String(p.seo_description ?? ""),
      status: (String(p.status ?? "draft") as "draft" | "published"),
      blocks: Array.isArray(p.blocks) ? p.blocks : [],
    })),
    menu: (menuRes.data ?? []).map((m) => ({
      id: String(m.id),
      label: String(m.label ?? ""),
      label_bn: String(m.label_bn ?? ""),
      href: String(m.href ?? ""),
      sort: Number(m.sort ?? 0),
      visible: Boolean(m.visible),
    })),
  };

  return (
    <Dashboard
      locale={locale}
      email={session.email}
      groups={editableStrings(content)}
      site={content.site}
      integrations={content.integrations}
      bookings={bookingsRes.data ?? []}
      projects={projectsRes.data ?? []}
      notes={notesRes.data ?? []}
      shop={shop}
      cms={cms}
      media={{
        staticHero: { image: content.staticHero.image },
        premise: { image: content.premise.image },
        building: { image: content.building.image },
        amenities: { items: content.amenities.items },
        servicesPage: { items: content.servicesPage.items },
        kbHomes: { gallery: content.kbHomes.gallery },
        clientsPage: { logos: content.clientsPage.logos },
      }}
    />
  );
}
