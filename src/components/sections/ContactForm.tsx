"use client";

import { useState } from "react";
import type { Locale, SiteContent } from "@/content/seed";

/**
 * The contact / reach-us form. One endpoint, /api/contact, which emails the
 * KBS alias inbox. The "topic" field routes the subject line so a project
 * inquiry and a product quote request are easy to tell apart in Gmail.
 */

type State = "idle" | "sending" | "sent" | "error";

export default function ContactForm({ c, l }: { c: SiteContent; l: Locale }) {
  const [state, setState] = useState<State>("idle");
  const t = (v: Record<Locale, string>) => v[l];
  const f = c.contact.fields;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      topic: String(fd.get("topic") ?? "general"),
      message: String(fd.get("message") ?? "").trim(),
      locale: l,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setState("sent");
      window.fbq?.("track", "Lead", { content_name: "contact" });
    } catch {
      setState("error");
    }
  }

  const field =
    "w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3.5 text-[color:var(--text-primary)] outline-none transition-colors duration-300 placeholder:text-[color:var(--text-quiet)] focus:border-[color:var(--accent)]";
  const lbl = "font-mono-label text-[color:var(--text-quiet)]";

  if (state === "sent") {
    return (
      <div role="status" aria-live="polite" className="card">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)]">
          {t(c.contact.successHead)}
        </h2>
        <p className="mt-4 max-w-[42ch] leading-relaxed text-[color:var(--text-secondary)]">
          {t(c.contact.successBody)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label htmlFor="name" className={lbl}>
          {t(f.name)}
        </label>
        <input id="name" name="name" required autoComplete="name" className={`${field} mt-2`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={lbl}>
            {t(f.email)}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${field} mt-2`}
          />
        </div>
        <div>
          <label htmlFor="phone" className={lbl}>
            {t(f.phone)}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={`${field} mt-2`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className={lbl}>
          {t(f.topicLabel)}
        </label>
        <select id="topic" name="topic" defaultValue="general" className={`${field} mt-2`}>
          <option value="general">{t(f.topicGeneral)}</option>
          <option value="project">{t(f.topicProject)}</option>
          <option value="product">{t(f.topicProduct)}</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className={lbl}>
          {t(f.message)}
        </label>
        <textarea id="message" name="message" rows={4} required className={`${field} mt-2 resize-y`} />
      </div>

      {state === "error" && (
        <p role="alert" className="text-sm text-[color:var(--clay)]">
          {t(c.contact.errorBody)}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={state === "sending"}>
        {state === "sending" ? t(f.sending) : t(f.submit)}
      </button>
    </form>
  );
}
