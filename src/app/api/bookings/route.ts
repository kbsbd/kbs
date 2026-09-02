import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

/**
 * Site visit bookings.
 *
 * Writes through the service-role key so the public anon role never needs
 * insert rights on the table. Validated here rather than trusting the browser.
 * When Supabase is not configured yet the request is accepted and logged, so
 * the form's success state is never a lie about something that did save.
 *
 * Either way an alert email goes to the KBS alias inbox, so a missed dashboard
 * check does not mean a missed visitor.
 */

export const runtime = "nodejs";

async function alert(name: string, phone: string, message: string, visitDate: string | null) {
  try {
    await sendMail({
      subject: `[KBS site visit] ${name}`,
      text: [
        `Name:    ${name}`,
        `Phone:   ${phone}`,
        `Day:     ${visitDate || "—"}`,
        "",
        message || "(no message)",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[bookings] alert email failed:", err instanceof Error ? err.message : err);
  }
}

const MAX = { name: 120, phone: 32, message: 1200 };

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, MAX.name);
  const phone = String(body.phone ?? "").trim().slice(0, MAX.phone);
  const message = String(body.message ?? "").trim().slice(0, MAX.message);
  const language = body.language === "en" ? "en" : "bn";
  const locale = body.locale === "en" ? "en" : "bn";
  const rawDate = String(body.visit_date ?? "");
  const visitDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

  if (name.length < 2) {
    return NextResponse.json({ error: "name required" }, { status: 422 });
  }
  // Bangladeshi numbers, with or without country code, plus a general fallback
  if (!/^[+\d][\d\s\-()]{7,}$/.test(phone)) {
    return NextResponse.json({ error: "phone required" }, { status: 422 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    console.warn("[bookings] Supabase not configured, booking not persisted:", {
      name,
      phone,
    });
    await alert(name, phone, message, visitDate);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("bookings").insert({
    name,
    phone,
    message: message || null,
    language,
    locale,
    visit_date: visitDate,
    status: "new",
  });

  if (error) {
    console.error("[bookings] insert failed:", error.message);
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }

  await alert(name, phone, message, visitDate);
  return NextResponse.json({ ok: true, persisted: true });
}
