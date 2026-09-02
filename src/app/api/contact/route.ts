import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

/**
 * The contact / reach-us endpoint.
 *
 * Every submission is emailed to the KBS alias inbox. Validated here rather
 * than trusting the browser. When SMTP is not configured the payload is logged
 * and the request still succeeds, so the form never shows a failure for
 * something the operator simply has not wired up yet.
 */

export const runtime = "nodejs";

const MAX = { name: 120, email: 160, phone: 32, message: 4000 };

const TOPICS: Record<string, string> = {
  general: "General enquiry",
  project: "Project / full works inquiry",
  product: "Product quote",
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, MAX.name);
  const email = String(body.email ?? "").trim().slice(0, MAX.email);
  const phone = String(body.phone ?? "").trim().slice(0, MAX.phone);
  const message = String(body.message ?? "").trim().slice(0, MAX.message);
  const topicKey = String(body.topic ?? "general");
  const topic = TOPICS[topicKey] ?? TOPICS.general;
  const locale = body.locale === "en" ? "en" : "bn";

  if (name.length < 2) {
    return NextResponse.json({ error: "name required" }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "email required" }, { status: 422 });
  }
  if (message.length < 5) {
    return NextResponse.json({ error: "message required" }, { status: 422 });
  }
  if (phone && !/^[+\d][\d\s\-()]{6,}$/.test(phone)) {
    return NextResponse.json({ error: "phone invalid" }, { status: 422 });
  }

  const text = [
    `Topic:   ${topic}`,
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Phone:   ${phone || "—"}`,
    `Locale:  ${locale}`,
    "",
    message,
  ].join("\n");

  try {
    const { sent } = await sendMail({
      subject: `[KBS ${topic}] ${name}`,
      text,
      replyTo: email,
    });
    if (!sent) {
      console.warn("[contact] mail not configured, submission not sent:", { name, email, topic });
    }
    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("[contact] send failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "could not send" }, { status: 500 });
  }
}
