/**
 * Integration config, resolved and cleaned.
 *
 * The admin can paste a bare code or the whole tag the provider gives them.
 * Everything is normalised here so the render code stays simple, and anything
 * malformed collapses to "" (which means "don't load it").
 */

import type { SiteContent } from "@/content/seed";

/** Pull the code out of a pasted `<meta ... content="CODE">`, or pass a bare code through. */
export function verificationCode(input: string | undefined): string {
  const s = (input || "").trim();
  if (!s) return "";
  const tag = s.match(/content\s*=\s*["']([^"']+)["']/i);
  if (tag) return tag[1].trim();
  // a bare token: letters, digits, -_. and nothing that looks like markup
  return /[<>"'\s]/.test(s) ? "" : s;
}

const GTM = /^GTM-[A-Z0-9]+$/;
const GA4 = /^G-[A-Z0-9]+$/;
const PIXEL = /^\d{6,20}$/;

export type ResolvedIntegrations = {
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  /** true when at least one analytics/marketing tag will load */
  anyTag: boolean;
};

export function resolveIntegrations(c: SiteContent): ResolvedIntegrations {
  const i = c.integrations ?? ({} as SiteContent["integrations"]);
  const gtmId = GTM.test((i.gtmId || "").trim().toUpperCase()) ? i.gtmId.trim().toUpperCase() : "";
  const ga4Id = GA4.test((i.ga4Id || "").trim().toUpperCase()) ? i.ga4Id.trim().toUpperCase() : "";
  const metaPixelId = PIXEL.test((i.metaPixelId || "").trim()) ? i.metaPixelId.trim() : "";
  return {
    gtmId,
    ga4Id,
    metaPixelId,
    googleSiteVerification: verificationCode(i.googleSiteVerification),
    bingSiteVerification: verificationCode(i.bingSiteVerification),
    anyTag: Boolean(gtmId || ga4Id || metaPixelId),
  };
}
