import Link from "next/link";
import Newsletter from "./Newsletter";
import { getSiteSettings } from "@/lib/data/site";

/*
 * footer.footer-wrapper.footer-layout5.footer-default — mirrors the
 * WordPress output:
 *
 *   <footer class="footer-wrapper footer-layout5 footer-default">
 *     <div class="container">
 *       <div class="footer-wrap space pb-0">
 *         …newsletter-wrap style5…
 *         <div class="widget-area">
 *           <div class="row justify-content-center nm-footer-wrapper">
 *             <div class="footer-links text-center"><ul>…</ul></div>
 *             <div class="details text-center"><small class="text-light mb-0">…</small></div>
 *             <div class="th-social style5 text-center">…4 links…</div>
 *             <div class="copyright-wrap bg-theme"><p class="copyright-text text-center">…</p></div>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </footer>
 *
 * Note the structure is flatter than it looks: .footer-links, .details,
 * .th-social and .copyright-wrap are all direct children of the same
 * .row.nm-footer-wrapper (which supplies `row-gap:10px`), not separate
 * columns. Each carries `text-center` itself.
 *
 * The address, the copyright line, the newsletter heading and the brand name
 * are no longer literals here — they come from site_settings so the admin can
 * change them. The fallbacks in lib/data/site.js reproduce exactly what this
 * file used to hardcode.
 */

const SOCIAL_ICONS = {
  facebook: "fab fa-facebook-f",
  linkedin: "fab fa-linkedin-in",
  instagram: "fab fa-instagram",
  youtube: "fab fa-youtube",
  twitter: "fab fa-x-twitter",
  x: "fab fa-x-twitter",
  tiktok: "fab fa-tiktok",
  whatsapp: "fab fa-whatsapp",
  pinterest: "fab fa-pinterest-p",
  threads: "fab fa-threads",
};

export default async function Footer({ footerLinks, socialLinks }) {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  const siteName = settings.site_name || "KBS";
  const address = settings.footer_address || settings.contact_address;

  const links = (footerLinks || []).filter((l) => l.is_active !== false);
  const socials = (socialLinks || []).filter((s) => s.is_active !== false);

  /* An admin-set copyright line replaces the whole sentence; {year} in it is
     substituted so "© {year} KBS" stays correct next January. */
  const customCopyright = settings.footer_copyright
    ? settings.footer_copyright.replace(/\{year\}/g, String(year))
    : null;

  return (
    <footer className="footer-wrapper footer-layout5 footer-default">
      <div className="container">
        <div className="footer-wrap space pb-0">
          <Newsletter heading={settings.newsletter_heading} />

          <div className="widget-area">
            <div className="row justify-content-center nm-footer-wrapper">
              <div className="footer-links text-center">
                <ul className="">
                  {links.map((link) => {
                    const isExternal = /^https?:\/\//.test(link.href);
                    /* the original writes `Video <i …>` — that literal space
                       is ~4.4px of real width, so it must be explicit here */
                    const label = link.open_new_tab ? (
                      <>
                        {link.label}{" "}
                        <i className="fa-solid fa-arrow-up-right-from-square ms-2" />
                      </>
                    ) : (
                      link.label
                    );
                    return (
                      <li key={link.id || link.label}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target={link.open_new_tab ? "_blank" : undefined}
                            rel={link.open_new_tab ? "noopener" : undefined}
                          >
                            {label}
                          </a>
                        ) : (
                          <Link href={link.href}>{label}</Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {address && (
                <div className="details text-center">
                  <small className="text-light mb-0">{address}</small>
                </div>
              )}

              <div className="th-social style5 text-center">
                {socials.map((social) => (
                  <a
                    key={social.id || social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                    aria-label={social.label || social.platform}
                  >
                    <i className={SOCIAL_ICONS[social.platform] || "fa-solid fa-link"} />
                  </a>
                ))}
              </div>

              <div className="copyright-wrap bg-theme">
                <p className="copyright-text text-center">
                  {customCopyright || (
                    <>
                      Copyright <i className="fa-solid fa-copyright" /> {year}{" "}
                      <Link href="/">{siteName}</Link>, all rights reserved.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
