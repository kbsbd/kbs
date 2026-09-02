"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/content/seed";
import { browserClient } from "@/lib/supabase/browser";
import { UserIcon } from "@/components/icons/Icons";

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
      className="inline-flex h-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--text-primary)]"
    >
      {authed ? (
        <UserIcon className="h-[22px] w-[22px]" />
      ) : (
        <span className="px-1 text-sm">{l === "bn" ? "সাইন ইন" : "Sign in"}</span>
      )}
    </Link>
  );
}
