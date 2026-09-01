"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseItems, parseBlocks, slugify } from "@/lib/page-templates";
import { presetSections } from "@/lib/page-presets";

/*
 * Pages built from the dashboard, and the content blocks inside them.
 *
 * Two levels of CRUD: the page itself (title, template, banner, SEO) and its
 * sections. Deleting a page cascades to its sections via the foreign key in
 * migration 0007 — there is no orphan cleanup to do here.
 */

const TEMPLATES = ["standard", "feature", "text"];
const KINDS = [
  "richtext", "image_text", "checklist", "faq", "cards", "cta",
  "legacy_split", "marquee", "timeline", "feature_split",
  "services", "video_split", "review_slider", "contact_block",
];
const EMBEDS = ["service_finder", "landowner_contact"];

/* Slugs that a real route in app/ would shadow. The database enforces this
   too (see 0007); checking here as well turns a constraint violation into a
   sentence the admin can act on. */
const RESERVED = [
  "admin", "api", "contact", "properties", "property",
  "construction-status", "legal", "_next", "sitemap", "robots", "favicon",
];

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function text(formData, key) {
  return String(formData.get(key) || "").trim() || null;
}

function revalidatePage(slug) {
  if (slug) revalidatePath(`/${slug}`);
  revalidatePath("/admin/pages");
  revalidatePath("/sitemap.xml");
}

/* ------------------------------------------------------------------ pages */

function pageFieldsFromForm(formData) {
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const template = String(formData.get("template") || "standard");

  return {
    title,
    slug: slugify(slugInput || title),
    template: TEMPLATES.includes(template) ? template : "standard",
    banner_image_url: text(formData, "banner_image_url"),
    banner_title: text(formData, "banner_title"),
    banner_subtitle: text(formData, "banner_subtitle"),
    intro_heading: text(formData, "intro_heading"),
    intro_body: text(formData, "intro_body"),
    meta_title: text(formData, "meta_title"),
    meta_description: text(formData, "meta_description"),
    og_image_url: text(formData, "og_image_url"),
    noindex: formData.get("noindex") === "on",
    is_published: formData.get("is_published") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

function validatePage(fields) {
  if (!fields.title) return "A title is required.";
  if (!fields.slug) {
    return "That title doesn't produce a usable web address. Add a custom one.";
  }
  if (RESERVED.includes(fields.slug)) {
    return `“/${fields.slug}” is already used by a built-in page. Pick a different address.`;
  }
  return null;
}

export async function createPage(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = pageFieldsFromForm(formData);
  const invalid = validatePage(fields);
  if (invalid) return { ok: false, message: invalid };

  const { data, error: dbError } = await supabase
    .from("pages")
    .insert(fields)
    .select("id, slug")
    .maybeSingle();

  if (dbError) {
    // 23505 is unique_violation — the only realistic collision here is the slug.
    if (dbError.code === "23505") {
      return { ok: false, message: `A page already lives at “/${fields.slug}”.` };
    }
    return { ok: false, message: dbError.message };
  }

  /* "Start from" copies the section stack of an existing design — this is what
     makes "About Us style" or "NRB style" a real choice rather than just a
     banner. The content is copied too, so the admin has something concrete to
     edit down instead of an empty frame. */
  const preset = String(formData.get("preset") || "blank");
  const sections = presetSections(preset);

  if (sections.length > 0) {
    const rows = sections.map((section) => ({
      page_id: data.id,
      kind: section.kind,
      heading: section.heading,
      subheading: section.subheading,
      body: section.body,
      items: section.items || [],
      blocks: section.blocks || [],
      image_url: section.image_url,
      image_url_2: section.image_url_2,
      image_side: section.image_side || "right",
      badge_text: section.badge_text,
      video_url: section.video_url,
      variant: section.variant,
      embed: section.embed,
      background: section.background || "light",
      is_active: true,
      sort_order: section.sort_order,
    }));

    // Non-fatal: the page exists either way, and an admin can add sections by
    // hand. Failing the whole creation over this would be worse.
    await supabase.from("page_sections").insert(rows);
  }

  // Optionally drop a link into the menu in the same step, so a new page is
  // reachable without a second trip to the Navigation screen.
  if (formData.get("add_to_menu") === "on") {
    await supabase.from("nav_links").insert({
      label: fields.title,
      href: `/${fields.slug}`,
      external: false,
      placement: "drawer",
      is_active: true,
      sort_order: 500,
    });
    revalidatePath("/", "layout");
  }

  revalidatePage(fields.slug);
  redirect(`/admin/pages/${data.id}`);
}

export async function updatePage(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const previousSlug = String(formData.get("previous_slug") || "");

  const fields = pageFieldsFromForm(formData);
  const invalid = validatePage(fields);
  if (invalid) return { ok: false, message: invalid };

  const { error: dbError } = await supabase
    .from("pages")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (dbError) {
    if (dbError.code === "23505") {
      return { ok: false, message: `A page already lives at “/${fields.slug}”.` };
    }
    return { ok: false, message: dbError.message };
  }

  // A renamed page leaves its old URL cached; clear both.
  if (previousSlug && previousSlug !== fields.slug) revalidatePage(previousSlug);
  revalidatePage(fields.slug);

  return {
    ok: true,
    message:
      previousSlug && previousSlug !== fields.slug
        ? `Saved. This page now lives at /${fields.slug} — update any menu links pointing at the old address.`
        : "Saved.",
  };
}

export async function deletePage(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");

  const { data: page } = await supabase.from("pages").select("slug").eq("id", id).maybeSingle();

  const { error: dbError } = await supabase.from("pages").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidatePage(page?.slug);
  redirect("/admin/pages");
}

/* --------------------------------------------------------------- sections */

function sectionFieldsFromForm(formData, existingBlocks = []) {
  const kind = String(formData.get("kind") || "richtext");
  const safeKind = KINDS.includes(kind) ? kind : "richtext";
  const side = String(formData.get("image_side") || "right");
  const background = String(formData.get("background") || "light");
  const embed = String(formData.get("embed") || "");
  const variant = text(formData, "variant");

  return {
    kind: safeKind,
    heading: text(formData, "heading"),
    subheading: text(formData, "subheading"),
    body: text(formData, "body"),
    image_url: text(formData, "image_url"),
    image_url_2: text(formData, "image_url_2"),
    image_side: side === "left" ? "left" : "right",
    badge_text: text(formData, "badge_text"),
    video_url: text(formData, "video_url"),
    cta_label: text(formData, "cta_label"),
    cta_href: text(formData, "cta_href"),
    // The admin types lines; these turn them into the jsonb shapes the
    // renderer expects. Kinds that don't use a list always store [].
    items: parseItems(safeKind, formData.get("items_text")),
    // existingBlocks carries forward the service icons, which the line format
    // has no column for.
    blocks: parseBlocks(safeKind, formData.get("blocks_text"), existingBlocks),
    variant: variant,
    embed: EMBEDS.includes(embed) ? embed : null,
    background: background === "dark" ? "dark" : "light",
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

async function pageSlugFor(supabase, pageId) {
  const { data } = await supabase.from("pages").select("slug").eq("id", pageId).maybeSingle();
  return data?.slug;
}

export async function createSection(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const pageId = String(formData.get("page_id") || "");
  if (!pageId) return { ok: false, message: "Missing page." };

  const fields = { ...sectionFieldsFromForm(formData), page_id: pageId };

  const { error: dbError } = await supabase.from("page_sections").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath(`/admin/pages/${pageId}`);
  revalidatePage(await pageSlugFor(supabase, pageId));
  return { ok: true, message: "Section added." };
}

export async function updateSection(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const pageId = String(formData.get("page_id") || "");

  /* Read the current blocks first so per-card values the textarea can't
     express — the service icons — survive an edit of the wording. */
  const { data: current } = await supabase
    .from("page_sections")
    .select("blocks")
    .eq("id", id)
    .maybeSingle();

  const fields = sectionFieldsFromForm(formData, current?.blocks || []);

  const { error: dbError } = await supabase.from("page_sections").update(fields).eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath(`/admin/pages/${pageId}`);
  revalidatePage(await pageSlugFor(supabase, pageId));
  return { ok: true, message: "Saved." };
}

export async function deleteSection(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");

  const { data: row } = await supabase
    .from("page_sections")
    .select("page_id")
    .eq("id", id)
    .maybeSingle();

  const { error: dbError } = await supabase.from("page_sections").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  if (row?.page_id) {
    revalidatePath(`/admin/pages/${row.page_id}`);
    revalidatePage(await pageSlugFor(supabase, row.page_id));
  }
  return { ok: true, message: "Section deleted." };
}

/** Swap sort_order with the neighbour, scoped to this page's own sections. */
export async function moveSection(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "up");

  const { data: row } = await supabase
    .from("page_sections")
    .select("page_id")
    .eq("id", id)
    .maybeSingle();

  if (!row) return { ok: false, message: "That section no longer exists." };

  const { data: rows, error: readError } = await supabase
    .from("page_sections")
    .select("id, sort_order")
    .eq("page_id", row.page_id)
    .order("sort_order", { ascending: true });

  if (readError) return { ok: false, message: readError.message };

  const index = (rows || []).findIndex((r) => r.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) {
    return { ok: true, message: "" };
  }

  const current = rows[index];
  const neighbour = rows[targetIndex];
  const currentOrder = current.sort_order;
  const neighbourOrder =
    neighbour.sort_order === currentOrder
      ? currentOrder + (direction === "up" ? -1 : 1)
      : neighbour.sort_order;

  const [a, b] = await Promise.all([
    supabase.from("page_sections").update({ sort_order: neighbourOrder }).eq("id", current.id),
    supabase.from("page_sections").update({ sort_order: currentOrder }).eq("id", neighbour.id),
  ]);

  if (a.error || b.error) return { ok: false, message: (a.error || b.error).message };

  revalidatePath(`/admin/pages/${row.page_id}`);
  revalidatePage(await pageSlugFor(supabase, row.page_id));
  return { ok: true, message: "" };
}
