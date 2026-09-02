"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content/seed";
import { browserClient } from "@/lib/supabase/browser";

type State = "loading" | "guest" | "form" | "sending" | "done";

export default function ReviewForm({
  productId,
  l,
  label,
}: {
  productId: string;
  l: Locale;
  label: string;
}) {
  const [state, setState] = useState<State>("loading");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const sb = browserClient();
    if (!sb) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("guest");
      return;
    }
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        setName(
          (data.user.user_metadata?.full_name as string) ||
            data.user.email?.split("@")[0] ||
            ""
        );
        setState("form");
      } else {
        setState("guest");
      }
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = browserClient();
    if (!sb || body.trim().length < 4) return;
    setState("sending");
    setError("");
    const { data: u } = await sb.auth.getUser();
    const { error: err } = await sb.from("product_reviews").insert({
      product_id: productId,
      user_id: u.user?.id,
      author_name: name.trim() || "Anonymous",
      rating,
      title: title.trim(),
      body: body.trim(),
      status: "pending",
    });
    if (err) {
      setError(err.message);
      setState("form");
    } else {
      setState("done");
    }
  }

  const card = "card";
  const field =
    "w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]";

  if (state === "loading") return null;

  if (state === "done") {
    return (
      <div className={card}>
        <p className="font-semibold">{l === "bn" ? "ধন্যবাদ!" : "Thank you."}</p>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
          {l === "bn"
            ? "আপনার রিভিউ যাচাইয়ের পর প্রকাশ করা হবে।"
            : "Your review will appear once it has been checked."}
        </p>
      </div>
    );
  }

  if (state === "guest") {
    return (
      <div className={card}>
        <p className="font-semibold">{label}</p>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
          {l === "bn"
            ? "রিভিউ দিতে সাইন ইন করুন।"
            : "Sign in to leave a review."}
        </p>
        <Link
          href={`/${l}/login?next=${encodeURIComponent(pathname)}`}
          className="btn btn-ghost mt-4 text-sm"
        >
          {l === "bn" ? "সাইন ইন" : "Sign in"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${card} space-y-3`}>
      <p className="font-semibold">{label}</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="text-2xl leading-none"
            style={{ color: n <= rating ? "var(--accent)" : "var(--text-quiet)" }}
          >
            ★
          </button>
        ))}
      </div>

      <input
        className={field}
        placeholder={l === "bn" ? "আপনার নাম" : "Your name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className={field}
        placeholder={l === "bn" ? "শিরোনাম (ঐচ্ছিক)" : "Headline (optional)"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className={`${field} resize-y`}
        rows={4}
        required
        placeholder={l === "bn" ? "আপনার মতামত" : "What did you think?"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {error && <p className="text-sm text-[color:var(--clay)]">{error}</p>}
      <button className="btn btn-primary text-sm" disabled={state === "sending"}>
        {state === "sending" ? "…" : label}
      </button>
    </form>
  );
}
