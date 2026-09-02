"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/content/seed";
import { browserClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup" | "forgot" | "reset";

const COPY = {
  en: {
    login: { title: "Sign in", cta: "Sign in", alt: "New here? Create an account", altHref: "signup", forgot: "Forgot your password?" },
    signup: { title: "Create an account", cta: "Create account", alt: "Already have an account? Sign in", altHref: "login" },
    forgot: { title: "Reset your password", cta: "Send reset link", alt: "Back to sign in", altHref: "login", note: "We'll email you a link to set a new password." },
    reset: { title: "Set a new password", cta: "Save password", alt: "", altHref: "login" },
    name: "Full name", phone: "Phone (optional)", email: "Email", password: "Password",
    sent: "Check your email for the link.",
    done: "Password updated. You can sign in now.",
    err: "That didn't work. Check the details and try again.",
  },
  bn: {
    login: { title: "সাইন ইন", cta: "সাইন ইন", alt: "নতুন? অ্যাকাউন্ট তৈরি করুন", altHref: "signup", forgot: "পাসওয়ার্ড ভুলে গেছেন?" },
    signup: { title: "অ্যাকাউন্ট তৈরি করুন", cta: "অ্যাকাউন্ট তৈরি", alt: "অ্যাকাউন্ট আছে? সাইন ইন", altHref: "login" },
    forgot: { title: "পাসওয়ার্ড রিসেট", cta: "রিসেট লিংক পাঠান", alt: "সাইন ইনে ফিরুন", altHref: "login", note: "নতুন পাসওয়ার্ড সেট করার লিংক ইমেইলে পাঠানো হবে।" },
    reset: { title: "নতুন পাসওয়ার্ড দিন", cta: "সেভ করুন", alt: "", altHref: "login" },
    name: "পুরো নাম", phone: "ফোন (ঐচ্ছিক)", email: "ইমেইল", password: "পাসওয়ার্ড",
    sent: "লিংকের জন্য আপনার ইমেইল দেখুন।",
    done: "পাসওয়ার্ড আপডেট হয়েছে। এখন সাইন ইন করুন।",
    err: "কাজ করেনি। তথ্য যাচাই করে আবার চেষ্টা করুন।",
  },
};

export default function AuthForm({ mode, l }: { mode: Mode; l: Locale }) {
  const c = COPY[l];
  const m = c[mode];
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || `/${l}/account`;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const field =
    "w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3 outline-none focus:border-[color:var(--accent)]";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = browserClient();
    if (!sb) return;
    setState("busy");
    setError("");
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else if (mode === "signup") {
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone } },
        });
        if (error) throw error;
        // autoconfirm is on, so a session exists straight away
        const { data } = await sb.auth.getSession();
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setState("sent");
        }
      } else if (mode === "forgot") {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/${l}/reset-password`,
        });
        if (error) throw error;
        setState("sent");
      } else if (mode === "reset") {
        const { error } = await sb.auth.updateUser({ password });
        if (error) throw error;
        setState("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : c.err);
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="card">
        <p>{c.sent}</p>
        <Link href={`/${l}/login`} className="btn btn-ghost mt-4 text-sm">
          {COPY[l].login.title}
        </Link>
      </div>
    );
  }
  if (state === "done") {
    return (
      <div className="card">
        <p>{c.done}</p>
        <Link href={`/${l}/login`} className="btn btn-primary mt-4 text-sm">
          {COPY[l].login.cta}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card max-w-md space-y-4">
      <h1 className="font-display text-[clamp(1.6rem,4vw,2.2rem)]">{m.title}</h1>
      {"note" in m && m.note && (
        <p className="text-sm text-[color:var(--text-secondary)]">{m.note}</p>
      )}

      {mode === "signup" && (
        <>
          <input
            className={field}
            placeholder={c.name}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={field}
            placeholder={c.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </>
      )}

      {mode !== "reset" && (
        <input
          className={field}
          type="email"
          placeholder={c.email}
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}

      {mode !== "forgot" && (
        <input
          className={field}
          type="password"
          placeholder={c.password}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {error && (
        <p role="alert" className="text-sm text-[color:var(--clay)]">
          {error}
        </p>
      )}

      <button className="btn btn-primary w-full" disabled={state === "busy"}>
        {state === "busy" ? "…" : m.cta}
      </button>

      <div className="flex flex-wrap justify-between gap-2 text-sm text-[color:var(--text-quiet)]">
        {m.alt && (
          <Link href={`/${l}/${m.altHref}`} className="hover:text-[color:var(--accent)]">
            {m.alt}
          </Link>
        )}
        {"forgot" in m && m.forgot && (
          <Link href={`/${l}/forgot-password`} className="hover:text-[color:var(--accent)]">
            {m.forgot}
          </Link>
        )}
      </div>
    </form>
  );
}
