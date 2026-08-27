"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/lib/actions/leads";
import ThemeButton from "@/components/ThemeButton";
import styles from "./contact.module.css";

const initialState = { ok: false, message: "" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  return (
    <div className={styles.formCard}>
      <h2>Contact us</h2>
      <form action={formAction} className={styles.form}>
        <label className="visually-hidden" htmlFor="contact-name">
          Your Name
        </label>
        <input id="contact-name" type="text" name="name" placeholder="Your Name*" required />

        <label className="visually-hidden" htmlFor="contact-email">
          Your Email
        </label>
        <input id="contact-email" type="email" name="email" placeholder="Your Email*" required />

        <label className="visually-hidden" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Type Your Message"
          rows={4}
          required
        />

        {state.message && (
          <p style={{ color: state.ok ? "#1a7a3a" : "#c22" }}>{state.message}</p>
        )}

        <ThemeButton type="submit" icon disabled={pending}>
          {pending ? "Sending…" : "Submit Message"}
        </ThemeButton>
      </form>
    </div>
  );
}
