"use server";

import { createClient } from "@/lib/supabase/server";

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

  return { ok: true, message: "Thanks — we'll be in touch shortly." };
}
