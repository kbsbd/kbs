import Link from "next/link";
import Newsletter from "./Newsletter";

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
 * The brand name in the address and copyright follows this project's KBS
 * rebrand (the same decision as the header wordmark); the original reads
 * "bti" in both places.
 */

const SOCIAL_ICONS = {
  facebook: "fab fa-facebook-f",
  linkedin: "fab fa-linkedin-in",
  instagram: "fab fa-instagram",
  youtube: "fab fa-youtube",
};

export default function Footer({ footerLinks, socialLinks }) {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-wrapper footer-layout5 footer-default">
      <div className="container">
        <div className="footer-wrap space pb-0">
          <Newsletter />

          <div className="widget-area">
            <div className="row justify-content-center nm-footer-wrapper">
              <div className="footer-links text-center">
                <ul className="">
                  {footerLinks.map((link) => {
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
                      <li key={link.label}>
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

              <div className="details text-center">
                <small className="text-light mb-0">
                  KBS Celebration Point, Plot: 3 &amp; 5, Road: 113/A, Gulshan-2, Dhaka-1212
                </small>
              </div>

              <div className="th-social style5 text-center">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                    aria-label={social.platform}
                  >
                    <i className={SOCIAL_ICONS[social.platform] || ""} />
                  </a>
                ))}
              </div>

              <div className="copyright-wrap bg-theme">
                <p className="copyright-text text-center">
                  Copyright <i className="fa-solid fa-copyright" /> {year}{" "}
                  <Link href="/">KBS</Link>, all rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
