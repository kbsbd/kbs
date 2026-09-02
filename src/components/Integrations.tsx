"use client";

import Script from "next/script";
import type { ResolvedIntegrations } from "@/lib/integrations";

/**
 * Third-party marketing / analytics tags.
 *
 * Nothing renders until the matching id is set in the admin dashboard, so a
 * site that has opted into none of this loads zero third-party script. The GTM
 * <noscript> frame is rendered separately, in the root layout, because it has
 * to sit at the very top of <body>.
 *
 * Only mounted inside the public site group — the admin dashboard never loads
 * any of it.
 */
export default function Integrations({ config }: { config: ResolvedIntegrations }) {
  const { gtmId, ga4Id, metaPixelId } = config;

  return (
    <>
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      )}

      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${metaPixelId}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a "lead" conversion across whatever is connected. Safe to call when
 * nothing is: each guard is a no-op without its script.
 */
export function trackLead(name: string) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "Lead", { content_name: name });
  window.dataLayer?.push({ event: "lead", lead_source: name });
  window.gtag?.("event", "generate_lead", { lead_source: name });
}
