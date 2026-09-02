"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";

export default function LoginForm({ locale }: { locale: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const supabase = browserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.replace(`/${locale}/admin`);
    router.refresh();
  }

  const field =
    "w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3 outline-none transition-colors duration-300 focus:border-[color:var(--accent)]";

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="font-mono-label text-[color:var(--text-quiet)]">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className={`${field} mt-2`} />
      </div>
      <div>
        <label htmlFor="password" className="font-mono-label text-[color:var(--text-quiet)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${field} mt-2`}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-[color:var(--clay)]">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
