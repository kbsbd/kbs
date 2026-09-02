"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cached: SupabaseClient | null = null;

/** Browser client for the admin login. Null when Supabase is not configured. */
export function browserClient(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  if (!cached) cached = createBrowserClient(URL, ANON);
  return cached;
}
