"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/leads";

/*
 * .newsletter-wrap.style5 — the "Never miss an update" strip at the top of
 * the footer. Markup mirrors the WordPress output:
 *
 *   <div class="newsletter-wrap style5">
 *     <h5 class="newsletter-title text-light">Never miss an update</h5>
 *     <form class="newsletter-form" id="btiFooterNewsletterForm">
 *       <div class="form-group">
 *         <input type="email" class="form-control" id="btiFooterNewsletterEmail"
 *                name="bti_footer_newsletter_email" placeholder="Enter Email" required>
 *       </div>
 *       <button class="th-btn style5" type="submit">
 *         Subscribe<i class="far fa-paper-plane text-title"></i>
 *       </button>
 *     </form>
 *   </div>
 *
 * Behaviour ported from the page's inline script:
 *   - a #btiFooterNewsletterResponse div sits immediately after the form
 *   - on submit the button is disabled and its label becomes "Submitting..."
 *   - on success the FORM IS HIDDEN (display:none) and the response message
 *     replaces it; on failure the message shows and the button is restored
 *
 * The original POSTs to wp-admin/admin-ajax.php. There is no WordPress here,
 * so the same UX runs over the existing `subscribeToNewsletter` server
 * action (Supabase). The transport differs; the visible behaviour does not.
 *
 * The hidden WordPress fields (nonce, _wp_http_referer,
 * bti_footer_newsletter_form) are intentionally NOT reproduced — they carry
 * no styling or layout and exist only for WP's own request handling.
 */

const initialState = { ok: false, message: "" };

export default function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);
  const [sent, setSent] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    // mirror the original: hide the form only once a success comes back
    if (wasPending.current && !pending && state.ok) setSent(true);
    wasPending.current = pending;
  }, [pending, state.ok]);

  /* The original does NOT unmount the form on success — it sets
     display:none and leaves the button disabled, still reading
     "Submitting...", because the success branch returns before the code
     that would restore the label. Reproduced exactly. */
  const busy = pending || sent;

  return (
    <div className="newsletter-wrap style5">
      <h5 className="newsletter-title text-light">Never miss an update</h5>
      <form
        action={formAction}
        className="newsletter-form"
        id="btiFooterNewsletterForm"
        style={sent ? { display: "none" } : undefined}
      >
        <div className="form-group">
          <input
            type="email"
            className="form-control"
            id="btiFooterNewsletterEmail"
            name="email"
            placeholder="Enter Email"
            required
          />
        </div>
        <button className="th-btn style5" type="submit" disabled={busy}>
          {busy ? "Submitting..." : "Subscribe"}
          {!busy && <i className="far fa-paper-plane text-title" />}
        </button>
      </form>
      <div id="btiFooterNewsletterResponse">
        {state.message && <p>{state.message}</p>}
      </div>
    </div>
  );
}
