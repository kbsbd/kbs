/**
 * Server-side Supabase clients.
 *
 * Both return null when the environment is not configured, so every caller
 * degrades to the seed content instead of throwing. The site must render with
 * no database attached.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Anon client: reads published content through row level security. */
export function createServerClient(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

/**
 * Service-role client: used only in route handlers that must write
 * (booking inserts) or read private rows. Never import this into a client
 * component; the key must not reach the browser.
 */
export function createAdminClient(): SupabaseClient | null {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}

export const supabaseConfigured = Boolean(URL && ANON);
