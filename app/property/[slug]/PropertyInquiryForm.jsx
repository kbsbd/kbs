"use client";

import { useActionState } from "react";
import { submitPropertyLead } from "@/lib/actions/leads";

/*
 * .widget-property-contact-form — the sidebar "I am interested in this
 * property" form, markup-for-markup as the original, wired to this
 * project's lead action.
 */
const initialState = { ok: false, message: "" };

export default function PropertyInquiryForm({ propertyId, propertyTitle }) {
  const [state, formAction, pending] = useActionState(submitPropertyLead, initialState);

  return (
    <form className="widget-property-contact-form" id="btiPropertyInquiryForm" action={formAction}>
      <input type="hidden" name="property_id" value={propertyId || ""} />
      <input type="hidden" name="property_title" value={propertyTitle} />
      <input type="hidden" name="source" value="interest_form" />

      <div className="form-group">
        <input
          type="text"
          className="form-control style-border"
          name="name"
          placeholder="Name"
          required
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          className="form-control style-border"
          name="email"
          placeholder="Email Address"
          required
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          className="form-control style-border"
          name="phone"
          placeholder="Phone Number"
          required
        />
      </div>
      <div className="form-group">
        <textarea
          className="form-control style-border"
          name="message"
          placeholder="Message"
          required
          defaultValue={`I am interested in your property named "${propertyTitle}".`}
        />
      </div>
      <button className="th-btn style-white th-btn-icon mt-15" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Submit"}
      </button>
      <p className="form-messages mb-0 mt-3 bti-property-wpforms-response" hidden={!state.message}>
        {state.message}
      </p>
    </form>
  );
}
