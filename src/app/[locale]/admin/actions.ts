"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient, getAdminSession, can } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { setPath } from "@/lib/editable";
import { isPermKey } from "@/lib/permissions";

/**
 * Every write goes through here, and every one of them re-checks the session.
 * A server action is a public endpoint; trusting the page that rendered the
 * form would be the mistake. RLS (`has_perm('key')`) is the real gate.
 */

type Result = { ok: true } | { ok: false; error: string };

async function guard() {
  const session = await getAdminSession();
  if (!session) return null;
  const supabase = await createAuthClient();
  return supabase ? { session, supabase } : null;
}

/** Requires a specific permission (a full admin always passes). */
async function guardPerm(key: string) {
  const ctx = await guard();
  if (!ctx) return null;
  if (!can(ctx.session, key)) return "denied" as const;
  return ctx;
}
const NOT_ALLOWED: Result = { ok: false, error: "You do not have access to this." };
const NOT_SIGNED_IN: Result = { ok: false, error: "Not signed in as staff." };

function refresh() {
  /* site.logo / site.favicon / nav / socials live in the shared chrome, so
     revalidate the whole locale tree rather than a fixed page list. */
  for (const l of ["/en", "/bn"]) revalidatePath(l, "layout");
}

/**
 * Saves a batch of edits. Each entry is a dotted path under a top level key,
 * merged into that key's existing override row so two people editing different
 * sections never overwrite each other's work.
 */
export async function saveContent(
  edits: Array<{ root: string; path: string; value: unknown }>
): Promise<Result> {
  const ctx = await guardPerm("content");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;
  if (!edits.length) return { ok: true };

  const byRoot = new Map<string, Array<{ path: string; value: unknown }>>();
  for (const e of edits) {
    if (!byRoot.has(e.root)) byRoot.set(e.root, []);
    byRoot.get(e.root)!.push({ path: e.path, value: e.value });
  }

  for (const [root, list] of byRoot) {
    const { data: existing } = await ctx.supabase
      .from("site_content")
      .select("value")
      .eq("key", root)
      .maybeSingle();

    /* An empty path replaces the whole key — used when the content value is
       itself an array (heroBands) rather than an object of sections. */
    let merged: unknown = (existing?.value as Record<string, unknown>) ?? {};
    for (const { path, value } of list) {
      if (!path) merged = value;
      else setPath(merged as Record<string, unknown>, path, value);
    }

    const { error } = await ctx.supabase
      .from("site_content")
      .upsert({ key: root, value: merged, updated_by: ctx.session.userId }, { onConflict: "key" });

    if (error) return { ok: false, error: error.message };
  }

  refresh();
  return { ok: true };
}

export async function setBookingStatus(id: string, status: string): Promise<Result> {
  const ctx = await guardPerm("bookings");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;
  const allowed = ["new", "contacted", "visit booked", "visited", "closed"];
  if (!allowed.includes(status)) return { ok: false, error: "Unknown status." };

  const { error } = await ctx.supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  revalidatePath("/bn/admin");
  return { ok: true };
}

export async function saveProject(project: {
  id?: string;
  image: string;
  title_en: string;
  title_bn: string;
  location_en: string;
  location_bn: string;
  status_en: string;
  status_bn: string;
  sort: number;
  published: boolean;
}): Promise<Result> {
  const ctx = await guardPerm("projects");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;

  const row = { ...project };
  const { error } = project.id
    ? await ctx.supabase.from("projects").update(row).eq("id", project.id)
    : await ctx.supabase.from("projects").insert(row);

  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteProject(id: string): Promise<Result> {
  const ctx = await guardPerm("projects");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;
  const { error } = await ctx.supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

/** Internal notes. Stored apart from site_content so they cannot be rendered. */
export async function saveInternalNote(key: string, value: string): Promise<Result> {
  const ctx = await guardPerm("internal");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;
  const { error } = await ctx.supabase
    .from("internal_notes")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase?.auth.signOut();
}

/* ---------------- team (needs the 'team' permission) ---------------- */

export type StaffMember = {
  userId: string;
  email: string;
  role: "admin" | "manager";
  permissions: string[];
};

const cleanPerms = (list: unknown): string[] =>
  Array.isArray(list) ? [...new Set(list.filter((k): k is string => isPermKey(k)))] : [];

export async function listStaff(): Promise<{ ok: true; staff: StaffMember[] } | { ok: false; error: string }> {
  const ctx = await guardPerm("team");
  if (!ctx || ctx === "denied") return { ok: false, error: "You do not have access to the team." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Store is not available." };
  const { data, error } = await admin
    .from("admins")
    .select("user_id, email, role, permissions")
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    staff: (data ?? []).map((r) => ({
      userId: String(r.user_id),
      email: String(r.email),
      role: r.role === "manager" ? "manager" : "admin",
      permissions: cleanPerms(r.permissions),
    })),
  };
}

export async function addManager(input: {
  email: string;
  password: string;
  fullName: string;
  permissions: string[];
}): Promise<Result> {
  const ctx = await guardPerm("team");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Store is not available." };

  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "A valid email is required." };
  if (input.password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };
  const permissions = cleanPerms(input.permissions);

  // create the auth user (or reuse if it already exists)
  let userId: string | null = null;
  const created = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName.trim() },
  });
  if (created.data.user) {
    userId = created.data.user.id;
  } else {
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    if (userId) await admin.auth.admin.updateUserById(userId, { password: input.password });
  }
  if (!userId) return { ok: false, error: created.error?.message || "Could not create the account." };

  const { error } = await admin
    .from("admins")
    .upsert({ user_id: userId, email, role: "manager", permissions }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/en/admin");
  return { ok: true };
}

/** Change what a manager can do. Full admins are never touched here. */
export async function setManagerPermissions(
  userId: string,
  permissions: string[]
): Promise<Result> {
  const ctx = await guardPerm("team");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Store is not available." };

  const { error } = await admin
    .from("admins")
    .update({ permissions: cleanPerms(permissions) })
    .eq("user_id", userId)
    .eq("role", "manager");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  revalidatePath("/bn/admin");
  return { ok: true };
}

export async function removeStaff(userId: string): Promise<Result> {
  const ctx = await guardPerm("team");
  if (ctx === "denied") return NOT_ALLOWED;
  if (!ctx) return NOT_SIGNED_IN;
  if (userId === ctx.session.userId)
    return { ok: false, error: "You cannot remove yourself." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Store is not available." };

  // only managers can be removed here
  const { error } = await admin
    .from("admins")
    .delete()
    .eq("user_id", userId)
    .eq("role", "manager");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}
