"use client";

import { useEffect } from "react";

/*
 * The original binds Fancybox 5 three times in main.min.js:
 *   Fancybox.bind(".popup-image", {groupAll:true, dragToClose:false,
 *                                  Images:{Panzoom:{maxScale:2}}})
 *   Fancybox.bind(".popup-video",   {dragToClose:false})
 *   Fancybox.bind(".popup-content", {dragToClose:false})
 * Both fancybox.css and fancybox.umd.js are already vendored in /public
 * (same build the WordPress site loads), so the lightbox here is the very
 * same component, not a look-alike.
 *
 * `options` defaults to the .popup-image set so existing callers are
 * unchanged; the video and content bindings pass {dragToClose:false}.
 */
const BASE = "/wp-content/cache/min/1/npm/@fancyapps/ui@5.0/dist/fancybox";
const CSS_HREF = `${BASE}/fancybox.css`;
const JS_SRC = `${BASE}/fancybox.umd.js`;

const IMAGE_OPTIONS = {
  groupAll: true,
  dragToClose: false,
  Images: { Panzoom: { maxScale: 2 } },
};

export default function Fancybox({ selector = ".popup-image", options }) {
  const optionsKey = JSON.stringify(options ?? null);

  useEffect(() => {
    const resolved = options ?? IMAGE_OPTIONS;
    let cancelled = false;

    if (!document.querySelector(`link[data-fancybox-css]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      link.setAttribute("data-fancybox-css", "");
      document.head.appendChild(link);
    }

    const bind = () => {
      if (cancelled || !window.Fancybox) return;
      window.Fancybox.bind(selector, resolved);
    };

    if (window.Fancybox) {
      bind();
    } else {
      let script = document.querySelector(`script[data-fancybox-js]`);
      if (!script) {
        script = document.createElement("script");
        script.src = JS_SRC;
        script.async = true;
        script.setAttribute("data-fancybox-js", "");
        document.body.appendChild(script);
      }
      script.addEventListener("load", bind);
      return () => {
        cancelled = true;
        script.removeEventListener("load", bind);
      };
    }

    return () => {
      cancelled = true;
      if (window.Fancybox) {
        window.Fancybox.close();
        window.Fancybox.unbind(selector);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, optionsKey]);

  return null;
}
