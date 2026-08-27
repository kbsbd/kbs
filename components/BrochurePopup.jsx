"use client";

import { useActionState, useEffect, useState } from "react";
import { submitPropertyLead } from "@/lib/actions/leads";

/*
 * Brochure — a React port of the Popup Builder popup (theme sgpb-theme-1,
 * 90% width / 600px max, overlay .8, close button bottom-right) that wraps
 * the WPForms brochure-download form. Opens on .nm-brouchure-download-btn
 * and reads the PDF from that button's data-broucher attribute, exactly
 * like the original binding. On success it opens the brochure.
 */
const initialState = { ok: false, message: "" };

export default function BrochurePopup({ propertyId, propertyTitle }) {
  const [open, setOpen] = useState(false);
  const [pdf, setPdf] = useState("");
  const [state, formAction, pending] = useActionState(submitPropertyLead, initialState);

  useEffect(() => {
    const onClick = (e) => {
      const btn = e.target.closest && e.target.closest(".nm-brouchure-download-btn");
      if (!btn) return;
      e.preventDefault();
      setPdf(btn.getAttribute("data-broucher") || "");
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (state.ok && pdf) {
      window.open(pdf, "_blank", "noopener");
      setOpen(false);
    }
  }, [state.ok, pdf]);

  return (
    <>
      <div className={`sgpb-popup-overlay${open ? " is-open" : ""}`} onClick={() => setOpen(false)} />
      <div className={`sgpb-popup-window${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div
          className="sg-popup-content nm-brochure-download-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Brochure"
        >
          <button
            type="button"
            className="sgpb-popup-close-button-1"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

          <h4>
            <span style={{ color: "#ffffff" }}>
              Please fill out the form below to view the brochure
            </span>
          </h4>

          <div className="wpforms-container wpforms-container-full property-brochure-download-form">
            <form className="wpforms-form" action={formAction}>
              <input type="hidden" name="property_id" value={propertyId || ""} />
              <input type="hidden" name="property_title" value={propertyTitle} />
              <input type="hidden" name="source" value="brochure_download" />

              <div className="wpforms-field-container">
                <div className="wpforms-field wpforms-field-name">
                  <label className="visually-hidden" htmlFor="brochure-name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="brochure-name"
                    className="wpforms-field-large wpforms-field-required"
                    name="name"
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="wpforms-field wpforms-field-email">
                  <label className="visually-hidden" htmlFor="brochure-email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="brochure-email"
                    className="wpforms-field-large"
                    name="email"
                    placeholder="Email"
                  />
                </div>
                <div className="wpforms-field wpforms-field-phone">
                  <label className="visually-hidden" htmlFor="brochure-phone">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="brochure-phone"
                    className="wpforms-field-large wpforms-field-required"
                    name="phone"
                    placeholder="Phone"
                    required
                  />
                </div>
              </div>

              {state.message && !state.ok && (
                <div className="wpforms-error">{state.message}</div>
              )}

              <div className="wpforms-submit-container">
                <button type="submit" className="wpforms-submit" disabled={pending}>
                  {pending ? "Sending…" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
