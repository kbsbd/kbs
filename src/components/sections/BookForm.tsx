"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { Locale, SiteContent } from "@/content/seed";
import { img } from "@/lib/media";
import { trackLead } from "@/components/Integrations";

/**
 * The single call to action the whole page funnels to.
 * Submissions go to Supabase through /api/bookings and appear in the admin
 * dashboard. The Meta Pixel Lead event fires only on a confirmed success.
 */

type State = "idle" | "sending" | "sent" | "error";

export default function BookForm({ c, l }: { c: SiteContent; l: Locale }) {
  const [state, setState] = useState<State>("idle");
  const t = (v: Record<Locale, string>) => v[l];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      visit_date: String(fd.get("visit_date") ?? ""),
      language: String(fd.get("language") ?? l),
      message: String(fd.get("message") ?? "").trim(),
      locale: l,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setState("sent");
      trackLead("site_visit");
    } catch {
      setState("error");
    }
  }

  const field =
    "w-full rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-4 py-3.5 text-[color:var(--text-primary)] outline-none transition-colors duration-300 placeholder:text-[color:var(--text-quiet)] focus:border-[color:var(--accent)]";

  return (
    <section className="sec reveal" id="book">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-[color:var(--panel-edge)] lg:grid-cols-2">
          <div className="relative hidden lg:block">
            <img
              src={img("facade-palms", 1200)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(11,22,34,.25) 0%, rgba(11,22,34,.9) 100%)",
              }}
            />
          </div>

          <div className="bg-[color:var(--panel)] px-6 py-14 sm:px-12 lg:py-16">
            {state === "sent" ? (
              <div role="status" aria-live="polite">
                <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)]">
                  {t(c.book.successHead)}
                </h2>
                <p className="mt-5 max-w-[42ch] leading-relaxed text-[color:var(--text-secondary)]">
                  {t(c.book.successBody)}
                </p>
              </div>
            ) : (
              <>
                <p className="part font-mono-label text-[color:var(--clay)]">
                  {t(c.book.kicker)}
                </p>
                <h2 className="part font-display mt-4 text-[clamp(1.8rem,3.2vw,2.6rem)]">
                  {t(c.book.head)}
                </h2>
                <p className="part mt-5 max-w-[44ch] leading-relaxed text-[color:var(--text-secondary)]">
                  {t(c.book.body)}
                </p>

                <form onSubmit={onSubmit} className="part mt-10 space-y-4">
                  <div>
                    <label htmlFor="name" className="font-mono-label text-[color:var(--text-quiet)]">
                      {t(c.book.fields.name)}
                    </label>
                    <input id="name" name="name" required autoComplete="name" className={`${field} mt-2`} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="font-mono-label text-[color:var(--text-quiet)]">
                        {t(c.book.fields.phone)}
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        required
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className={`${field} mt-2`}
                      />
                    </div>
                    <div>
                      <label htmlFor="visit_date" className="font-mono-label text-[color:var(--text-quiet)]">
                        {t(c.book.fields.date)}
                      </label>
                      <input id="visit_date" name="visit_date" type="date" className={`${field} mt-2`} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="language" className="font-mono-label text-[color:var(--text-quiet)]">
                      {t(c.book.fields.lang)}
                    </label>
                    <select id="language" name="language" defaultValue={l} className={`${field} mt-2`}>
                      <option value="bn">বাংলা</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="font-mono-label text-[color:var(--text-quiet)]">
                      {t(c.book.fields.message)}
                    </label>
                    <textarea id="message" name="message" rows={3} className={`${field} mt-2 resize-y`} />
                  </div>

                  {state === "error" && (
                    <p role="alert" className="text-sm text-[color:var(--clay)]">
                      {t(c.book.errorBody)}
                    </p>
                  )}

                  <button type="submit" className="btn btn-primary w-full" disabled={state === "sending"}>
                    {state === "sending" ? t(c.book.sending) : t(c.book.submit)}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
