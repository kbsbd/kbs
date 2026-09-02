import { cookies } from "next/headers";
import { createServerClient as createSsrClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cookie-backed Supabase client for server components, server actions and
 * route handlers. This is the one that knows who is signed in.
 *
 * Returns null when Supabase is not configured, so the admin area can say so
 * plainly instead of crashing.
 */
export async function createAuthClient(): Promise<SupabaseClient | null> {
  if (!URL || !ANON) return null;
  const store = await cookies();

  return createSsrClient(URL, ANON, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a server component, where cookies are read only.
          // The session is refreshed by the proxy instead.
        }
      },
    },
  });
}

export type StaffRole = "admin" | "manager";
export type AdminSession = {
  userId: string;
  email: string;
  role: StaffRole;
};

/**
 * The only gate into the dashboard.
 *
 * Being signed in is not enough on its own: the user must also have a row in
 * `admins`. `role` splits staff into a full admin and a limited manager; the
 * dashboard and the server actions both key off it.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createAuthClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admins")
    .select("user_id, email, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  const role: StaffRole = data.role === "manager" ? "manager" : "admin";
  return { userId: user.id, email: (data.email as string) ?? user.email ?? "", role };
}
