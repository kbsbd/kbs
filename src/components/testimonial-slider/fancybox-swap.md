# Using the real Fancybox instead of the bundled Lightbox

The original theme opened testimonial images with **Fancybox 5**
(`@fancyapps/ui`), bound in its `main.min.js` as:

```js
Fancybox.bind(".popup-image", {
  groupAll: true,
  dragToClose: false,
  Images: { Panzoom: { maxScale: 2 } },
});
```

The skill ships a small dependency-free `Lightbox.jsx` that reproduces the
important parts (backdrop fade, image scale-in, prev/next, counter, keyboard
nav). If you'd rather use the genuine article:

## 1. Install

```bash
npm i @fancyapps/ui
```

## 2. Replace the Lightbox wiring

Drop this `Fancybox.jsx` next to the other files and delete `Lightbox.jsx` /
`Lightbox.css`:

```jsx
"use client";
import { useEffect } from "react";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function Fancybox({ selector = "[data-fancybox]", options }) {
  useEffect(() => {
    NativeFancybox.bind(selector, {
      groupAll: true,
      dragToClose: false,
      Images: { Panzoom: { maxScale: 2 } },
      ...options,
    });
    return () => NativeFancybox.unbind(selector);
  }, [selector, options]);
  return null;
}
```

## 3. Point the cards at it

In `TestimonialSlider.jsx`, render each image card as an anchor Fancybox can
group, and mount `<Fancybox />` once in the section instead of `<Lightbox />`:

```jsx
<a
  className="fts__media fts__media--btn"
  href={item.src}
  data-fancybox="testimonials"
  data-caption={item.caption}
>
  <img src={item.src} alt={item.alt ?? item.caption ?? ""} loading="lazy" />
</a>
```

```jsx
{lightbox && <Fancybox selector='[data-fancybox="testimonials"]' />}
```

You can then drop the `openAt` / `setOpenAt` state entirely — Fancybox takes
over from the anchors.
