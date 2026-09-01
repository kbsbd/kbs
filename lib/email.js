import nodemailer from "nodemailer";

/*
 * Outbound email — server-only. This module reads SMTP_* env vars, so it must
 * never be imported from a "use client" file.
 *
 * Set up for Gmail SMTP with an App Password (Google Account → Security →
 * 2-Step Verification → App passwords). Env vars (.env.local):
 *
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_USER=kbsbdinfo@gmail.com
 *   SMTP_PASS=xxxxxxxxxxxxxxxx        # 16-char app password, spaces removed
 *   SMTP_FROM=KBS Website <info@kbsbd.com>   # a verified "Send mail as" alias
 *   LEAD_NOTIFY_TO=info@kbsbd.com     # where contact submissions are delivered
 *
 * When the vars are missing, isEmailConfigured is false and sendMail is a
 * no-op that resolves to { ok: false, skipped: true } — form submissions still
 * succeed, they just don't send a notification.
 */

const HOST = process.env.SMTP_HOST || "";
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER || "";
const PASS = process.env.SMTP_PASS || "";
const FROM = process.env.SMTP_FROM || (USER ? `KBS Website <${USER}>` : "");

export const isEmailConfigured = Boolean(HOST && USER && PASS);

/** Inbox that contact-form submissions are delivered to. */
export const LEAD_NOTIFY_TO = process.env.LEAD_NOTIFY_TO || "info@kbsbd.com";

let transporter = null;

function getTransporter() {
  if (!isEmailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      // 465 = implicit TLS (Gmail's recommended port); 587 = STARTTLS
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
}

/**
 * Sends one email. Never throws — a mail failure must not break the request
 * that triggered it. Returns { ok } and, on failure, a `message`.
 */
export async function sendMail({ to, subject, text, html, replyTo }) {
  const tx = getTransporter();
  if (!tx) return { ok: false, skipped: true };

  try {
    await tx.sendMail({
      from: FROM,
      to: to || LEAD_NOTIFY_TO,
      subject,
      text,
      html,
      replyTo,
    });
    return { ok: true };
  } catch (error) {
    console.error("sendMail failed:", error?.message || error);
    return { ok: false, message: error?.message || "send failed" };
  }
}
