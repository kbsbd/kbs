import { createServerClient } from "@supabase/ssr";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Cookie-free anon client. Used when there is no request to read cookies from
// (generateStaticParams, generateMetadata and statically-prerendered pages),
// where calling cookies() throws. It can only ever see rows exposed by the
// "public read" RLS policies, which is all the read-only data getters need.
export function createStaticClient() {
  if (!isSupabaseConfigured) return null;

  return createBareClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Server Component / Server Action / Route Handler client.
// Returns null when Supabase env vars aren't set yet, so pages can fall back
// to bundled demo data instead of crashing before real credentials exist.
// When there is no request context (build-time static generation), cookies()
// throws — fall back to the cookie-free anon client so public reads still work.
export async function createClient() {
  if (!isSupabaseConfigured) return null;

  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    return createStaticClient();
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component - middleware refreshes the
          // session instead, so this can be safely ignored.
        }
      },
    },
  });
}
