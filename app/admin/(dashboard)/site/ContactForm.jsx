"use client";

import { useActionState } from "react";
import { updateContactSettings } from "@/lib/actions/site";
import { updateContactPageSection } from "@/lib/actions/homepage";
import MediaPicker from "@/components/admin/MediaPicker";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

/*
 * Two separate forms in one component: the details (which feed the contact
 * page, the footer and the JSON-LD) and the contact page's own heading and
 * artwork. Keeping them apart means saving a phone number doesn't re-submit
 * the background images, and each gets its own success message.
 */

function DetailsForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateContactSettings, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.grid2}>
        <label>
          Primary phone
          <input
            type="tel"
            name="contact_phone"
            defaultValue={settings.contact_phone || ""}
            placeholder="16604"
          />
        </label>
        <label>
          Secondary phone
          <input
            type="tel"
            name="contact_phone_alt"
            defaultValue={settings.contact_phone_alt || ""}
            placeholder="+8809613191919"
          />
        </label>
        <label>
          WhatsApp number
          <input
            type="tel"
            name="contact_whatsapp"
            defaultValue={settings.contact_whatsapp || ""}
            placeholder="+8801313401405"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="contact_email"
            defaultValue={settings.contact_email || ""}
            placeholder="info@kbs.com"
          />
        </label>
      </div>

      <label>
        Office address
        <textarea name="contact_address" rows={2} defaultValue={settings.contact_address || ""} />
        <span className={styles.fieldHint}>
          Appears on the contact page, in the map card, and in the structured data search engines
          read. Clearing it hides the address card.
        </span>
      </label>

      <label>
        Map search text
        <input
          type="text"
          name="map_query"
          defaultValue={settings.map_query || ""}
          placeholder="KBS Celebration Point, Gulshan-2, Dhaka-1212"
        />
        <span className={styles.fieldHint}>
          What the “Open in Maps” link searches for. Falls back to the office address.
        </span>
      </label>

      <p className={styles.fieldHint}>
        Changing the phone or WhatsApp number here does not move the floating Call / WhatsApp
        buttons — those have their own links under CTA Buttons.
      </p>

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

function PageArtForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateContactPageSection, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label>
        Contact page heading
        <input
          type="text"
          name="contact_heading"
          defaultValue={settings.contact_heading || ""}
          placeholder="Get in touch"
        />
      </label>

      <MediaPicker
        name="contact_form_bg_url"
        label="Form background photo"
        defaultValue={settings.contact_form_bg_url || ""}
        folder="kbs/contact"
        hint="Sits behind the message form under a dark overlay. Clearing it leaves a plain background."
      />

      <MediaPicker
        name="contact_map_logo_url"
        label="Map card icon"
        defaultValue={settings.contact_map_logo_url || ""}
        folder="kbs/contact"
        hint="The small mark beside the address in the map card."
      />

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : "Save page"}
      </button>
    </form>
  );
}

export default function ContactForm({ settings }) {
  return (
    <>
      <DetailsForm settings={settings} />
      <hr className={styles.divider} />
      <PageArtForm settings={settings} />
    </>
  );
}
