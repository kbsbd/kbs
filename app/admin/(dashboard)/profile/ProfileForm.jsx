"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "../../admin.module.css";

export default function ProfileForm({ currentEmail }) {
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ ok: false, message: "" });
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setStatus({ ok: false, message: "" });

    const supabase = createClient();
    const updates = {};
    if (email && email !== currentEmail) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      setPending(false);
      setStatus({ ok: false, message: "Nothing to update." });
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);
    setPending(false);

    if (error) {
      setStatus({ ok: false, message: error.message });
      return;
    }

    setPassword("");
    setStatus({
      ok: true,
      message: updates.email
        ? "Saved. Check the new address for a confirmation email before it takes effect."
        : "Password updated.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
      </label>
      <label>
        New password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          autoComplete="new-password"
        />
      </label>

      {status.message && (
        <p className={status.ok ? styles.success : styles.error}>{status.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
