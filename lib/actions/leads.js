"use server";

import { createClient } from "@/lib/supabase/server";
import { sendMail, LEAD_NOTIFY_TO } from "@/lib/email";

const SOURCE_LABELS = {
  contact_form: "Contact form",
  landowner_form: "Landowner enquiry",
  interest_form: "Property interest",
  schedule_visit: "Schedule a visit",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Emails LEAD_NOTIFY_TO (info@kbsbd.com) a copy of a submission that was just
 * stored in `leads`. Awaited so a serverless function doesn't get frozen
 * before the mail goes out, but its result is intentionally ignored — the
 * visitor's submission has already succeeded by this point.
 */
async function notifyNewLead(lead) {
  const label = SOURCE_LABELS[lead.source] || lead.source || "Website";
  const rows = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Property", lead.property_title],
    ["Source", label],
    ["Message", lead.message],
  ].filter(([, value]) => value != null && String(value).trim() !== "");

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2>New ${escapeHtml(label)} submission</h2>
<table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,Arial,sans-serif;font-size:14px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="border:1px solid #ddd;background:#f7f7f7"><strong>${escapeHtml(
        k
      )}</strong></td><td style="border:1px solid #ddd">${escapeHtml(v).replace(
        /\n/g,
        "<br>"
      )}</td></tr>`
  )
  .join("\n")}
</table>`;

  return sendMail({
    to: LEAD_NOTIFY_TO,
    subject: `New ${label} — ${lead.name || "website visitor"}`,
    text,
    html,
    replyTo: lead.email || undefined,
  });
}

export async function subscribeToNewsletter(_prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: "Newsletter signup isn't configured yet." };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email" });

  if (error) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  return { ok: true, message: "Thanks for subscribing!" };
}

export async function submitContactForm(_prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const source = String(formData.get("source") || "contact_form");

  if (!name || !email) {
    return { ok: false, message: "Please share your name and email." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: "This form isn't connected yet." };
  }

  const { error } = await supabase.from("leads").insert({
    name,
    email,
    phone: phone || null,
    message: message || null,
    source,
  });

  if (error) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  await notifyNewLead({ name, email, phone, message, source });

  return { ok: true, message: "Thanks — we'll be in touch shortly." };
}

export async function submitPropertyLead(_prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const propertyId = formData.get("property_id") || null;
  const propertyTitle = formData.get("property_title") || null;
  const source = String(formData.get("source") || "interest_form");

  if (!name || (!email && !phone)) {
    return { ok: false, message: "Please share your name and an email or phone number." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: "This form isn't connected yet." };
  }

  const { error } = await supabase.from("leads").insert({
    name,
    email: email || null,
    phone: phone || null,
    message: message || null,
    property_id: propertyId,
    property_title: propertyTitle,
    source,
  });

  if (error) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  await notifyNewLead({
    name,
    email,
    phone,
    message,
    source,
    property_title: propertyTitle,
  });

  return { ok: true, message: "Thanks — we'll be in touch shortly." };
}
