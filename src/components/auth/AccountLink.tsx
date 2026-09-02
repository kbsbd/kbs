"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/content/seed";
import { browserClient } from "@/lib/supabase/browser";

/** Header link: "Sign in" when logged out, a person icon → /account when in. */
export default function AccountLink({ l }: { l: Locale }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = browserClient();
    if (!sb) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthed(false);
      return;
    }
    sb.auth.getUser().then(({ data }) => setAuthed(Boolean(data.user)));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setAuthed(Boolean(session?.user)));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (authed === null) return null;

  return (
    <Link
      href={authed ? `/${l}/account` : `/${l}/login`}
      aria-label={authed ? "My account" : "Sign in"}
      className="text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--text-primary)]"
    >
      {authed ? (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="text-sm">{l === "bn" ? "সাইন ইন" : "Sign in"}</span>
      )}
    </Link>
  );
}
