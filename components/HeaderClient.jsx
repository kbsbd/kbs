/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

/* The original inlines this texture on both drawers via a style attribute. */
const TEXTURE =
  "/wp-content/themes/bti-new-properties-special/assets/img/demo/bg-texture.png";

const stop = (e) => e.stopPropagation();

function NavItem({ link, onNavigate }) {
  const label = (
    <>
      {link.label}
      {link.external ? (
        <i className="fa-solid fa-arrow-up-right-from-square ms-2" />
      ) : null}
    </>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener">
        {label}
      </a>
    );
  }

  return (
    <Link href={link.href} onClick={onNavigate}>
      {label}
    </Link>
  );
}

/* Links come from the nav_links table (see lib/data/nav.js); the brand
   wordmark / logo comes from site_settings. Everything else is unchanged from
   the original client-side Header. */
export default function HeaderClient({
  primaryLinks = [],
  drawerLinks = [],
  siteName = "KBS",
  logoUrl = null,
  logoAlt = "KBS",
}) {
  /* main.min.js: $(window).scroll(function(){ 300 < $(this).scrollTop()
     ? $('.sticky-wrapper').addClass('sticky') : removeClass('sticky') }) */
  const [sticky, setSticky] = useState(false);
  /* .th-menu-wrapper <-> th-body-visible, toggled by every .th-menu-toggle */
  const [mobileOpen, setMobileOpen] = useState(false);
  /* .sidemenu-info <-> show, opened by .sideMenuInfo, closed by .sideMenuCls
     and by a click on the wrapper itself */
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMobile = () => setMobileOpen((v) => !v);

  const brand = logoUrl ? (
    <img src={logoUrl} alt={logoAlt} className={styles.headerLogoImg} />
  ) : (
    siteName
  );

  return (
    <>
      {/*==============================
        Mobile Menu
      ==============================*/}
      <div
        className={`${styles.thMenuWrapper}${
          mobileOpen ? ` ${styles.thBodyVisible}` : ""
        }`}
        onClick={toggleMobile}
      >
        <div
          className={styles.thMenuArea}
          style={{ backgroundImage: `url('${TEXTURE}')` }}
          onClick={stop}
        >
          <button
            type="button"
            className={styles.thMenuClose}
            onClick={toggleMobile}
            aria-label="Close menu"
          >
            <i className="fa-solid fa-times" />
          </button>

          <div className={styles.thMobileMenu} onClick={stop}>
            <ul>
              {drawerLinks.map((link) => (
                <li key={link.id || link.href}>
                  <NavItem link={link} onNavigate={() => setMobileOpen(false)} />
                </li>
              ))}
            </ul>

            <div className={styles.thMobileMenuFoot}>
              <button
                type="button"
                className={styles.thMobileMenuFootBtn}
                onClick={toggleMobile}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/*==============================
        Sidemenu
      ==============================*/}
      <div
        className={`${styles.sidemenuWrapper}${
          sideOpen ? ` ${styles.sidemenuShow}` : ""
        }`}
        onClick={() => setSideOpen(false)}
      >
        <div
          className={styles.sidemenuContent}
          style={{ backgroundImage: `url('${TEXTURE}')` }}
          onClick={(e) => {
            e.stopPropagation();
            setSideOpen(true);
          }}
        >
          <button
            type="button"
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              setSideOpen(false);
            }}
            aria-label="Close menu"
          >
            <i className="fas fa-times" />
          </button>

          <div className={styles.widget}>
            <div className={styles.footerWidget}>
              <h3 className={styles.widgetTitle}>Menu</h3>
              <div>
                <ul className={styles.menu}>
                  {drawerLinks.map((link) => (
                    <li key={link.id || link.href}>
                      <NavItem
                        link={link}
                        onNavigate={() => setSideOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*==============================
        Header Area
      ==============================*/}
      <header className={styles.header}>
        <div
          className={`${styles.stickyWrapper}${
            sticky ? ` ${styles.sticky}` : ""
          }`}
        >
          {/* Main Menu Area */}
          <div className={styles.menuArea}>
            <div className="container">
              <div className="row align-items-center justify-content-between">
                <div className="col-auto">
                  <div className={styles.headerLogo}>
                    <Link href="/">{brand}</Link>
                  </div>
                </div>

                <div className="col-auto">
                  <div className={styles.headerButtonMobile}>
                    <button
                      type="button"
                      className={styles.thMenuToggleBar}
                      onClick={toggleMobile}
                      aria-label="Open menu"
                    >
                      <span className={styles.line} />
                      <span className={styles.line} />
                      <span className={styles.line} />
                    </button>
                  </div>
                </div>

                <div className={`col-auto ${styles.navCol}`}>
                  <nav className={styles.mainMenu}>
                    <ul>
                      {primaryLinks.map((link) => (
                        <li key={link.id || link.href}>
                          <NavItem link={link} />
                        </li>
                      ))}
                    </ul>
                  </nav>{" "}
                  <div className={styles.headerButtonInline}>
                    <button
                      type="button"
                      className={`${styles.simpleIcon}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSideOpen(true);
                      }}
                      aria-label="Open menu"
                    >
                      <span className={styles.line} />
                      <span className={styles.line} />
                      <span className={styles.line} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
