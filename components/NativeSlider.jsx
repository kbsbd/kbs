"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

/*
 * NativeSlider — a port of the theme's own slider (main.min.js, the
 * function that adds `.nm-native-slider` to every `.swiper.th-slider`).
 * The original site does NOT ship Swiper; it re-implements the parts it
 * needs. This mirrors that implementation exactly:
 *
 *   perView   = largest breakpoint <= window.innerWidth (1 when effect:fade)
 *   maxIndex  = fade ? count - 1 : max(0, count - perView)
 *   clamp(i)  = loop ? (i > max ? 0 : i < 0 ? max : i) : min(max, max(0, i))
 *   slide     = flex 0 0 calc((100% - gap*(perView-1)) / perView); margin-right: gap
 *   wrapper   = translate3d(-index * (slideWidth + gap), 0, 0)
 *               transition: transform {speed}ms ease
 *               (fade: no transform at all; CSS cross-fades the slides)
 *   autoplay  = setInterval(next, delay); restarted after any interaction
 *               when disableOnInteraction is false
 *   drag      = 8px axis lock; on release steps by round(-dx / slideWidth),
 *               or +/-1 when |dx| passes min(90, max(35, .18 * slideWidth))
 */
const NativeSlider = forwardRef(function NativeSlider(
  {
    id,
    options = {},
    clickFirstDrag = false,
    className = "",
    wrapperClassName = "",
    onSlideChange,
    children,
  },
  ref
) {
  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const changeRef = useRef(onSlideChange);
  changeRef.current = onSlideChange;

  const stateRef = useRef({
    index: 0,
    translate: 0,
    perView: 1,
    maxIndex: 0,
    timer: null,
    startX: null,
    startY: null,
    dx: 0,
    dy: 0,
    axisLocked: false,
    dragging: false,
    suppressClick: false,
    startTranslate: 0,
    pointerId: null,
  });

  const opt = {
    speed: 1000,
    spaceBetween: 24,
    loop: true,
    slidesPerView: 1,
    breakpoints: {},
    autoplay: { delay: 6000, disableOnInteraction: false },
    allowTouchMove: true,
    effect: undefined,
    ...options,
  };

  const fade = opt.effect === "fade";
  const speed = opt.speed;
  const gap = fade ? 0 : opt.spaceBetween;
  const loop = opt.loop;
  const autoplayDelay = opt.autoplay && opt.autoplay.delay ? opt.autoplay.delay : 6000;
  const autoplayOn = opt.autoplay !== false;
  const restartOnInteraction =
    autoplayOn && (!opt.autoplay || opt.autoplay.disableOnInteraction === false);

  const slidesOf = useCallback(
    () => (wrapRef.current ? Array.from(wrapRef.current.children) : []),
    []
  );

  const computePerView = useCallback(() => {
    if (fade) return 1;
    let n = opt.slidesPerView || 1;
    const bps = opt.breakpoints || {};
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    let best = null;
    Object.keys(bps).forEach((k) => {
      const bp = parseInt(k, 10);
      if (!isNaN(bp) && bp <= w && (best === null || best < bp)) best = bp;
    });
    if (best !== null && bps[best] && bps[best].slidesPerView !== undefined) {
      n = parseFloat(bps[best].slidesPerView);
    }
    if (!n || n < 1) n = 1;
    return Math.max(1, Math.floor(n));
  }, [fade, opt.slidesPerView, opt.breakpoints]);

  const clampIndex = useCallback(
    (i) => {
      const { maxIndex } = stateRef.current;
      if (loop) {
        if (i > maxIndex) return 0;
        if (i < 0) return maxIndex;
      }
      return Math.max(0, Math.min(i, maxIndex));
    },
    [loop]
  );

  const slideOuterWidth = useCallback(() => {
    const slides = slidesOf();
    if (!slides.length) return 0;
    const r = slides[0].getBoundingClientRect();
    const ms = parseFloat(getComputedStyle(slides[0]).marginRight) || 0;
    return r.width + ms;
  }, [slidesOf]);

  const applyTransform = useCallback(
    (instant, explicit) => {
      const wrap = wrapRef.current;
      if (!wrap || fade) return;
      const st = stateRef.current;
      const t =
        typeof explicit === "number" ? explicit : -st.index * (slideOuterWidth() || 0);
      st.translate = t;
      wrap.style.transition = instant ? "none" : `transform ${speed}ms ease`;
      wrap.style.transform = `translate3d(${t}px,0,0)`;
      if (instant) {
        // eslint-disable-next-line no-unused-expressions
        wrap.offsetHeight;
        wrap.style.transition = `transform ${speed}ms ease`;
      }
    },
    [fade, slideOuterWidth, speed]
  );

  const applyClasses = useCallback(() => {
    const slides = slidesOf();
    const st = stateRef.current;
    slides.forEach((el) =>
      el.classList.remove(
        "swiper-slide-active",
        "swiper-slide-prev",
        "swiper-slide-next",
        "swiper-slide-visible"
      )
    );
    if (!slides.length) return;
    if (slides[st.index]) {
      slides[st.index].classList.add("swiper-slide-active", "swiper-slide-visible");
    }
    if (!fade) {
      for (let i = st.index; i < st.index + st.perView && i < slides.length; i++) {
        slides[i].classList.add("swiper-slide-visible");
      }
    }
    const prev = slides[clampIndex(st.index - 1)];
    const next = slides[clampIndex(st.index + 1)];
    if (prev) prev.classList.add("swiper-slide-prev");
    if (next) next.classList.add("swiper-slide-next");
  }, [clampIndex, fade, slidesOf]);

  const stopAutoplay = useCallback(() => {
    const st = stateRef.current;
    if (st.timer) {
      window.clearInterval(st.timer);
      st.timer = null;
    }
  }, []);

  const goTo = useCallback(
    (i, instant) => {
      const st = stateRef.current;
      const before = st.index;
      st.index = clampIndex(i);
      applyClasses();
      applyTransform(instant);
      if (before !== st.index && changeRef.current) changeRef.current(st.index);
    },
    [applyClasses, applyTransform, clampIndex]
  );

  const startAutoplay = useCallback(() => {
    if (!autoplayOn) return;
    if (slidesOf().length <= 1) return;
    stopAutoplay();
    stateRef.current.timer = window.setInterval(() => {
      goTo(stateRef.current.index + 1, false);
    }, autoplayDelay);
  }, [autoplayDelay, autoplayOn, goTo, slidesOf, stopAutoplay]);

  const maybeRestartAutoplay = useCallback(() => {
    if (restartOnInteraction) startAutoplay();
  }, [restartOnInteraction, startAutoplay]);

  const layout = useCallback(() => {
    const st = stateRef.current;
    const slides = slidesOf();
    st.perView = computePerView();
    st.maxIndex = fade
      ? Math.max(0, slides.length - 1)
      : Math.max(0, slides.length - st.perView);
    if (st.index > st.maxIndex) st.index = st.maxIndex;
    if (st.index < 0) st.index = 0;

    const root = rootRef.current;
    const draggable =
      opt.allowTouchMove !== false &&
      !fade &&
      (clickFirstDrag || slides.length > st.perView);
    if (root) {
      root.classList.toggle("nm-native-click-first-drag", draggable && clickFirstDrag);
      root.classList.toggle("nm-native-draggable", draggable && !clickFirstDrag);
      root.style.setProperty("--nm-native-slider-speed", `${speed}ms`);
    }

    const wrap = wrapRef.current;
    if (fade) {
      if (wrap) {
        wrap.style.transition = "none";
        wrap.style.transform = "none";
      }
      slides.forEach((el) => {
        el.style.flex = "";
        el.style.marginRight = "";
        el.style.opacity = "";
        el.style.zIndex = "";
        el.style.transform = "";
      });
    } else {
      const total = gap * Math.max(st.perView - 1, 0);
      if (wrap) {
        wrap.style.transition = `transform ${speed}ms ease`;
        wrap.style.transform = "translate3d(0,0,0)";
      }
      slides.forEach((el) => {
        el.style.flex = `0 0 calc((100% - ${total}px) / ${st.perView})`;
        el.style.marginRight = `${gap}px`;
      });
    }

    applyClasses();
    applyTransform(true);
  }, [
    applyClasses,
    applyTransform,
    clickFirstDrag,
    computePerView,
    fade,
    gap,
    opt.allowTouchMove,
    slidesOf,
    speed,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      slidePrev() {
        goTo(stateRef.current.index - 1, false);
        maybeRestartAutoplay();
      },
      slideNext() {
        goTo(stateRef.current.index + 1, false);
        maybeRestartAutoplay();
      },
      slideTo(i, instant) {
        goTo(i, !!instant);
        maybeRestartAutoplay();
      },
      get realIndex() {
        return stateRef.current.index;
      },
      update() {
        layout();
      },
      getRoot() {
        return rootRef.current;
      },
    }),
    [goTo, layout, maybeRestartAutoplay]
  );

  useEffect(() => {
    layout();
    startAutoplay();
    if (changeRef.current) changeRef.current(stateRef.current.index);

    let resizeTimer = null;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      stopAutoplay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- drag ----- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || opt.allowTouchMove === false || fade) return;
    const st = stateRef.current;

    const canDrag = () => clickFirstDrag || slidesOf().length > st.perView;

    const onMove = (e) => {
      if (st.startX === null || st.startY === null) return;
      const p = e.touches && e.touches.length ? e.touches[0] : e;
      const dx = p.clientX - st.startX;
      const dy = p.clientY - st.startY;
      st.dx = dx;
      st.dy = dy;
      if (!st.axisLocked) {
        const horizontal = Math.abs(dx) >= 8 && Math.abs(dx) > Math.abs(dy);
        if (horizontal) {
          st.axisLocked = true;
          st.suppressClick = true;
        }
      }
      if (st.dragging && st.axisLocked) {
        e.preventDefault();
        applyTransform(true, st.startTranslate + dx);
      }
    };

    const onUp = () => {
      const wasDragging = st.dragging;
      const dx = st.dx;
      const dy = st.dy;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
      if (wasDragging) root.classList.remove("is-native-dragging");
      st.dragging = false;
      st.startX = null;
      st.startY = null;
      st.pointerId = null;

      if (st.axisLocked) {
        st.axisLocked = false;
        if (st.suppressClick) {
          window.setTimeout(() => {
            st.suppressClick = false;
          }, 300);
        }
        if (wasDragging && Math.abs(dx) > Math.abs(dy)) {
          const w = Math.max(1, slideOuterWidth());
          const threshold = Math.min(90, Math.max(35, 0.18 * w));
          let steps = Math.round(-dx / w);
          if (steps === 0 && Math.abs(dx) > threshold) steps = dx < 0 ? 1 : -1;
          if (steps !== 0) {
            goTo(st.index + steps, false);
            maybeRestartAutoplay();
            return;
          }
        }
      } else {
        st.suppressClick = false;
      }
      applyTransform(false);
      maybeRestartAutoplay();
    };

    const onDown = (e) => {
      if (e.type === "mousedown" && e.button !== 0) return;
      if (st.startX !== null) return;
      const p = e.touches && e.touches.length ? e.touches[0] : e;
      if (!p) return;
      st.startX = p.clientX;
      st.startY = p.clientY;
      st.dx = 0;
      st.dy = 0;
      st.axisLocked = false;
      st.suppressClick = false;
      st.dragging = canDrag();
      st.startTranslate = st.translate;
      st.pointerId = e.pointerId !== undefined ? e.pointerId : null;
      if (!st.dragging) return;
      stopAutoplay();
      root.classList.add("is-native-dragging");
      const wrap = wrapRef.current;
      if (wrap) wrap.style.transition = "none";
      document.addEventListener("pointermove", onMove, { passive: false });
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
    };

    const onClickCapture = (e) => {
      if (st.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
        st.suppressClick = false;
      }
    };

    const onDragStart = (e) => {
      if (canDrag()) e.preventDefault();
    };

    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("pointerdown", onDown, true);
    root.addEventListener("touchstart", onDown, true);
    root.addEventListener("dragstart", onDragStart);

    return () => {
      root.removeEventListener("click", onClickCapture, true);
      root.removeEventListener("pointerdown", onDown, true);
      root.removeEventListener("touchstart", onDown, true);
      root.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id={id}
      ref={rootRef}
      className={`swiper nm-native-slider${fade ? " is-native-fade" : ""} ${className}`.trim()}
    >
      <div ref={wrapRef} className={`swiper-wrapper ${wrapperClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
});

export default NativeSlider;
