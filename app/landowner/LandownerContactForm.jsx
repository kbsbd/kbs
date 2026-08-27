"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/lib/actions/leads";
import ThemeButton from "@/components/ThemeButton";
import styles from "./landowner.module.css";

const initialState = { ok: false, message: "" };

export default function LandownerContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  return (
    <div className={styles.formCard}>
      <form action={formAction} className={styles.form}>
        <input type="hidden" name="source" value="landowner_form" />
        <div className={styles.formRow}>
          <input type="text" name="name" placeholder="Name *" required />
          <input type="email" name="email" placeholder="Email *" required />
        </div>
        <input type="tel" name="phone" placeholder="Contact Number *" required />
        <textarea name="message" placeholder="Message *" rows={4} required />

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
