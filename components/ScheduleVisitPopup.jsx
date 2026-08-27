"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitPropertyLead } from "@/lib/actions/leads";

/*
 * Schedule a visit — a React port of the original's #nm-schedule-visit-popup
 * and the two-step "bti-msf engine v1.3.3" form inside it. Same markup,
 * same classes, same step animation; it posts to this project's own lead
 * action instead of the WordPress admin-ajax endpoint.
 *
 * Like the original it binds by class: any .nm_schedule_visit_btn on the
 * page opens it, so the button can stay in the server-rendered markup.
 */
const STEP1 = [
  {
    id: "11",
    label: "When are you planning to buy an apartment?",
    placeholder: "Select an option",
    options: ["Immediately", "1-3 months", "3-6 months"],
  },
  {
    id: "12",
    label: "What is your purpose for buying?",
    placeholder: "Select an option",
    options: ["Own Residence", "Investment"],
  },
  {
    id: "13",
    label: "Preferred contact time?",
    placeholder: "Select a time",
    options: [
      "Morning (9:00 – 11:30 AM)",
      "Afternoon (12:00 – 4:00 PM)",
      "Evening (4:00 – 7:00 PM)",
    ],
  },
];

const initialState = { ok: false, message: "" };

export default function ScheduleVisitPopup({ propertyId, propertyTitle }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [invalid, setInvalid] = useState({});
  const [state, formAction, pending] = useActionState(submitPropertyLead, initialState);
  const dialogRef = useRef(null);

  /* open on any .nm_schedule_visit_btn, exactly like the original */
  useEffect(() => {
    const onClick = (e) => {
      const btn = e.target.closest && e.target.closest(".nm_schedule_visit_btn");
      if (!btn) return;
      e.preventDefault();
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
    document.body.classList.add("nm-schedule-popup-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("nm-schedule-popup-open");
    };
  }, [open]);

  useEffect(() => {
    if (state.ok) setStep("success");
  }, [state.ok]);

  const next = () => {
    const missing = {};
    STEP1.forEach((f) => {
      if (!answers[f.id]) missing[f.id] = true;
    });
    setInvalid(missing);
    if (Object.keys(missing).length === 0) setStep(2);
  };

  const preferenceMessage = STEP1.map((f) => `${f.label} ${answers[f.id] || "—"}`).join("\n");

  return (
    <div
      id="nm-schedule-visit-popup"
      className={`nm-schedule-popup${open ? " is-open" : ""}`}
      aria-hidden={!open}
    >
      <div className="nm-schedule-popup__overlay" onClick={() => setOpen(false)} />
      <div
        className="nm-schedule-popup__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Schedule a visit"
        ref={dialogRef}
      >
        <button
          type="button"
          className="nm-schedule-popup__close"
          aria-label="Close popup"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <div className="nm-schedule-popup__content">
          <div className="bti-msf-engine-section" data-bti-msf-version="1.3.3">
            <div className="bti-msf-page">
              <div className="bti-msf-modal" role="region" aria-labelledby="bti-msf-engine-9-title">
                <div className="bti-msf-progress" aria-label="Form progress">
                  <div
                    className={`bti-msf-progress-item${
                      step === 1 ? " is-active" : " is-complete"
                    }`}
                    data-progress-step="1"
                  >
                    <span className="bti-msf-progress-dot">01</span>
                    <span className="bti-msf-progress-line" />
                  </div>
                  <div
                    className={`bti-msf-progress-item${step !== 1 ? " is-active" : ""}`}
                    data-progress-step="2"
                  >
                    <span className="bti-msf-progress-dot">02</span>
                  </div>
                </div>

                <form id="bti-msf-engine-9-form" className="bti-msf-engine-form" action={formAction}>
                  <input type="hidden" name="property_id" value={propertyId || ""} />
                  <input type="hidden" name="property_title" value={propertyTitle} />
                  <input type="hidden" name="source" value="schedule_visit" />
                  <input type="hidden" name="message" value={preferenceMessage} />

                  <section
                    className={`bti-msf-step${step === 1 ? " is-active" : ""}`}
                    data-form-step="1"
                  >
                    <h2 className="bti-msf-title" id="bti-msf-engine-9-title">
                      Tell us your apartment preference
                    </h2>
                    <div className="bti-msf-fields">
                      {STEP1.map((field) => (
                        <div
                          className={`bti-msf-field${invalid[field.id] ? " is-invalid" : ""}`}
                          data-field-id={field.id}
                          key={field.id}
                        >
                          <label className="bti-msf-label" htmlFor={`bti-msf-field-${field.id}`}>
                            {field.label}
                          </label>
                          <select
                            className="bti-msf-control"
                            id={`bti-msf-field-${field.id}`}
                            name={`bti_field_${field.id}`}
                            required
                            value={answers[field.id] || ""}
                            onChange={(e) =>
                              setAnswers((a) => ({ ...a, [field.id]: e.target.value }))
                            }
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options.map((o) => (
                              <option value={o} key={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="bti-msf-actions">
                      <button className="bti-msf-btn bti-msf-btn-next" type="button" onClick={next}>
                        Continue
                      </button>
                    </div>
                  </section>

                  <section
                    className={`bti-msf-step${step === 2 ? " is-active" : ""}`}
                    data-form-step="2"
                  >
                    <h2 className="bti-msf-title">Please fill out the form below:</h2>
                    <div className="bti-msf-fields">
                      <div className="bti-msf-field" data-field-id="15">
                        <label className="bti-msf-label" htmlFor="bti-msf-field-15">
                          Name <span className="bti-msf-required" aria-hidden="true">*</span>
                        </label>
                        <input
                          className="bti-msf-control"
                          id="bti-msf-field-15"
                          name="name"
                          type="text"
                          maxLength={100}
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div className="bti-msf-field" data-field-id="16">
                        <label className="bti-msf-label" htmlFor="bti-msf-field-16">
                          Phone <span className="bti-msf-required" aria-hidden="true">*</span>
                        </label>
                        <div className="bti-msf-phone-control">
                          <input
                            className="bti-msf-control"
                            id="bti-msf-field-16"
                            name="phone"
                            type="tel"
                            maxLength={24}
                            autoComplete="tel"
                            inputMode="tel"
                            required
                          />
                        </div>
                      </div>
                      <div className="bti-msf-field" data-field-id="20">
                        <label className="bti-msf-label" htmlFor="bti-msf-field-20">
                          WhatsApp number
                        </label>
                        <div className="bti-msf-phone-control">
                          <input
                            className="bti-msf-control"
                            id="bti-msf-field-20"
                            name="whatsapp"
                            type="tel"
                            maxLength={24}
                            autoComplete="tel"
                            inputMode="tel"
                          />
                        </div>
                      </div>
                      <div className="bti-msf-field" data-field-id="17">
                        <label className="bti-msf-label" htmlFor="bti-msf-field-17">
                          Email
                        </label>
                        <input
                          className="bti-msf-control"
                          id="bti-msf-field-17"
                          name="email"
                          type="email"
                          maxLength={190}
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className="bti-msf-actions has-back">
                      <button
                        className="bti-msf-btn bti-msf-btn-back"
                        type="button"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button
                        className="bti-msf-btn bti-msf-btn-next"
                        type="submit"
                        disabled={pending}
                      >
                        Submit
                      </button>
                    </div>
                  </section>

                  <section
                    className={`bti-msf-step${step === "success" ? " is-active" : ""}`}
                    data-form-step="success"
                  >
                    <div className="bti-msf-success">
                      <div className="bti-msf-success-icon" aria-hidden="true">
                        ✓
                      </div>
                      <div>
                        <h2>Thank you</h2>
                        <p>{state.message}</p>
                      </div>
                    </div>
                  </section>

                  {state.message && !state.ok && (
                    <div className="bti-msf-status is-error" role="status" aria-live="polite">
                      {state.message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
