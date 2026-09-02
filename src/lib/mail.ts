/**
 * Outgoing mail.
 *
 * Every public form on the site — the contact page, the project-inquiry form
 * and the site-visit booking — delivers to one Gmail alias inbox over SMTP.
 *
 * When SMTP is not configured the call resolves as `{ sent: false }` instead of
 * throwing, so a form never shows a success state for something that did not
 * happen and never a failure for something the operator simply has not wired up
 * yet. The route logs the payload in that case.
 */

import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const PORT = Number(process.env.SMTP_PORT || 465);
/* Gmail SMTP authenticates as the real account, never an alias. */
const USER = process.env.SMTP_USER || "";
const PASS = process.env.SMTP_PASS || "";
const TO = process.env.MAIL_TO || USER;
/* The visible sender. Can be an alias of USER that Gmail knows as "send mail as". */
const FROM = process.env.MAIL_FROM || TO || USER;

export const mailConfigured = Boolean(USER && PASS && TO);

let cached: nodemailer.Transporter | null = null;
function transport() {
  if (!cached) {
    cached = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return cached;
}

type Payload = {
  subject: string;
  /** Plain-text body. Kept plain on purpose: it renders everywhere and cannot carry markup injection. */
  text: string;
  /** So a reply in Gmail goes straight back to the person who filled the form. */
  replyTo?: string;
};

export async function sendMail({ subject, text, replyTo }: Payload): Promise<{ sent: boolean }> {
  if (!mailConfigured) return { sent: false };
  await transport().sendMail({
    from: `"KBS website" <${FROM}>`,
    to: TO,
    subject,
    text,
    replyTo: replyTo || undefined,
  });
  return { sent: true };
}
