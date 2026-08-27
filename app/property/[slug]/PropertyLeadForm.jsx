"use client";

import { useActionState, useState } from "react";
import { submitPropertyLead } from "@/lib/actions/leads";
import ThemeButton from "@/components/ThemeButton";
import styles from "./property-detail.module.css";
import adminStyles from "@/app/admin/admin.module.css";

const initialState = { ok: false, message: "" };

export default function PropertyLeadForm({ propertyId, propertyTitle }) {
  const [state, formAction, pending] = useActionState(submitPropertyLead, initialState);
  const [source, setSource] = useState("interest_form");

  return (
    <div id="interest-form" className={styles.leadCard}>
      <h3>I am interested in this property</h3>
      <form action={formAction} className={adminStyles.form}>
        <input type="hidden" name="property_id" value={propertyId || ""} />
        <input type="hidden" name="property_title" value={propertyTitle} />
        <input type="hidden" name="source" value={source} />

        <label className="visually-hidden" htmlFor="lead-name">
          Name
        </label>
        <input id="lead-name" type="text" name="name" placeholder="Name" required />

        <label className="visually-hidden" htmlFor="lead-email">
          Email
        </label>
        <input id="lead-email" type="email" name="email" placeholder="Email Address" />

        <label className="visually-hidden" htmlFor="lead-phone">
          Phone
        </label>
        <input id="lead-phone" type="tel" name="phone" placeholder="Phone Number" />

        <label className="visually-hidden" htmlFor="lead-message">
          Message
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={3}
          defaultValue={`I am interested in your property named "${propertyTitle}".`}
        />

        {state.message && (
          <p className={state.ok ? adminStyles.success : adminStyles.error}>{state.message}</p>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <ThemeButton
            type="submit"
            variant="white"
            icon
            disabled={pending}
            onClick={() => setSource("interest_form")}
          >
            {pending ? "Sending…" : "Submit"}
          </ThemeButton>
        </div>
      </form>
    </div>
  );
}
