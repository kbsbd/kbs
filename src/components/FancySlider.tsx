"use client";

/*
 * FancySlider — a tiny, dependency-free slider engine.
 *
 * Ported to TypeScript from the testimonial-image-slider skill (itself a clean
 * extraction of the bti real-estate theme's own slider). Behaviour preserved:
 *
 *   perView  = largest breakpoint <= window.innerWidth  (1 when effect:"fade")
 *   maxIndex = fade ? count - 1 : max(0, count - perView)
 *   clamp(i) = loop ? (i > max ? 0 : i < 0 ? max : i) : min(max, max(0, i))
 *   slide    = flex 0 0 calc((100% - gap*(perView-1)) / perView); margin-right: gap
 *   track    = translate3d(-index * (slideWidth + gap), 0, 0)
 *   autoplay = setInterval(next, delay); restarts after interaction
 *   drag     = 8px axis lock; on release steps by round(-dx / slideWidth), or
 *              +/-1 once |dx| passes min(90, max(35, .18 * slideWidth))
 *
 * The engine sets `is-active` / `is-visible` / `is-prev` / `is-next` on the
 * slide elements and drives `.fslide__track` — those classes live in globals.css.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";

export type FancySliderOptions = {
  speed?: number;
  spaceBetween?: number;
  loop?: boolean;
  slidesPerView?: number;
  breakpoints?: Record<string, { slidesPerView?: number }>;
  autoplay?: { delay?: number; disableOnInteraction?: boolean } | false;
  allowTouchMove?: boolean;
  effect?: "fade" | "slide";
};

export type FancySliderHandle = {
  slidePrev: () => void;
  slideNext: () => void;
  slideTo: (i: number, instant?: boolean) => void;
  readonly realIndex: number;
  update: () => void;
  getRoot: () => HTMLDivElement | null;
};

type Props = {
  id?: string;
  options?: FancySliderOptions;
  /** taps still click; only a deliberate horizontal drag pages the slider */
  clickFirstDrag?: boolean;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
  onSlideChange?: (index: number) => void;
  children: ReactNode;
};

const FancySlider = forwardRef<FancySliderHandle, Props>(function FancySlider(
  {
    id,
    options = {},
    clickFirstDrag = false,
    className = "",
    trackClassName = "",
    ariaLabel,
    onSlideChange,
    children,
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const changeRef = useRef(onSlideChange);
  changeRef.current = onSlideChange;

  const stateRef = useRef({
    index: 0,
    translate: 0,
    perView: 1,
    maxIndex: 0,
    timer: null as number | null,
    startX: null as number | null,
    startY: null as number | null,
    dx: 0,
    dy: 0,
    axisLocked: false,
    dragging: false,
    suppressClick: false,
    startTranslate: 0,
  });

  const opt = {
    speed: 900,
    spaceBetween: 24,
    loop: true,
    slidesPerView: 1,
    breakpoints: {} as Record<string, { slidesPerView?: number }>,
    autoplay: { delay: 6000, disableOnInteraction: false } as
      | { delay?: number; disableOnInteraction?: boolean }
      | false,
    allowTouchMove: true,
    effect: undefined as "fade" | "slide" | undefined,
    ...options,
  };

  const fade = opt.effect === "fade";
  const speed = opt.speed;
  const gap = fade ? 0 : opt.spaceBetween;
  const loop = opt.loop;
  const autoplayOn = opt.autoplay !== false;
  const autoplayDelay =
    opt.autoplay && opt.autoplay.delay ? opt.autoplay.delay : 6000;
  const restartOnInteraction =
    autoplayOn && (!opt.autoplay || opt.autoplay.disableOnInteraction === false);

  const slidesOf = useCallback(
    (): HTMLElement[] =>
      wrapRef.current ? (Array.from(wrapRef.current.children) as HTMLElement[]) : [],
    []
  );

  const computePerView = useCallback(() => {
    if (fade) return 1;
    let n = opt.slidesPerView || 1;
    const bps = opt.breakpoints || {};
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    let best: number | null = null;
    Object.keys(bps).forEach((k) => {
      const bp = parseInt(k, 10);
      if (!isNaN(bp) && bp <= w && (best === null || best < bp)) best = bp;
    });
    if (best !== null && bps[best]?.slidesPerView !== undefined) {
      n = Number(bps[best].slidesPerView);
    }
    if (!n || n < 1) n = 1;
    return Math.max(1, Math.floor(n));
  }, [fade, opt.slidesPerView, opt.breakpoints]);

  const clampIndex = useCallback(
    (i: number) => {
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
    (instant: boolean, explicit?: number) => {
      const wrap = wrapRef.current;
      if (!wrap || fade) return;
      const st = stateRef.current;
      const t =
        typeof explicit === "number"
          ? explicit
          : -st.index * (slideOuterWidth() || 0);
      st.translate = t;
      wrap.style.transition = instant ? "none" : `transform ${speed}ms ease`;
      wrap.style.transform = `translate3d(${t}px,0,0)`;
      if (instant) {
        void wrap.offsetHeight;
        wrap.style.transition = `transform ${speed}ms ease`;
      }
    },
    [fade, slideOuterWidth, speed]
  );

  const applyClasses = useCallback(() => {
    const slides = slidesOf();
    const st = stateRef.current;
    slides.forEach((el) =>
      el.classList.remove("is-active", "is-prev", "is-next", "is-visible")
    );
    if (!slides.length) return;
    slides[st.index]?.classList.add("is-active", "is-visible");
    if (!fade) {
      for (let i = st.index; i < st.index + st.perView && i < slides.length; i++) {
        slides[i].classList.add("is-visible");
      }
    }
    slides[clampIndex(st.index - 1)]?.classList.add("is-prev");
    slides[clampIndex(st.index + 1)]?.classList.add("is-next");
  }, [clampIndex, fade, slidesOf]);

  const stopAutoplay = useCallback(() => {
    const st = stateRef.current;
    if (st.timer) {
      window.clearInterval(st.timer);
      st.timer = null;
    }
  }, []);

  const goTo = useCallback(
    (i: number, instant: boolean) => {
      const st = stateRef.current;
      const before = st.index;
      st.index = clampIndex(i);
      applyClasses();
      applyTransform(instant);
      if (before !== st.index) changeRef.current?.(st.index);
    },
    [applyClasses, applyTransform, clampIndex]
  );

  const startAutoplay = useCallback(() => {
    if (!autoplayOn || slidesOf().length <= 1) return;
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
    st.index = Math.max(0, Math.min(st.index, st.maxIndex));

    const root = rootRef.current;
    const draggable =
      opt.allowTouchMove !== false &&
      !fade &&
      (clickFirstDrag || slides.length > st.perView);
    if (root) {
      root.classList.toggle("fslide--click-first", draggable && clickFirstDrag);
      root.classList.toggle("fslide--draggable", draggable && !clickFirstDrag);
      root.style.setProperty("--fslide-speed", `${speed}ms`);
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
      slideTo(i: number, instant?: boolean) {
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
    changeRef.current?.(stateRef.current.index);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 150);
    };
    const onVis = () => (document.hidden ? stopAutoplay() : startAutoplay());
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
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

    const onMove = (e: PointerEvent | TouchEvent) => {
      if (st.startX === null || st.startY === null) return;
      const p =
        "touches" in e && e.touches.length ? e.touches[0] : (e as PointerEvent);
      const dx = p.clientX - st.startX;
      const dy = p.clientY - st.startY;
      st.dx = dx;
      st.dy = dy;
      if (!st.axisLocked && Math.abs(dx) >= 8 && Math.abs(dx) > Math.abs(dy)) {
        st.axisLocked = true;
        st.suppressClick = true;
      }
      if (st.dragging && st.axisLocked) {
        e.preventDefault();
        applyTransform(true, st.startTranslate + dx);
      }
    };

    const onUp = () => {
      const wasDragging = st.dragging;
      const { dx, dy } = st;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
      if (wasDragging) root.classList.remove("is-dragging");
      st.dragging = false;
      st.startX = null;
      st.startY = null;

      if (st.axisLocked) {
        st.axisLocked = false;
        if (st.suppressClick) {
          window.setTimeout(() => (st.suppressClick = false), 300);
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

    const onDown = (e: PointerEvent | TouchEvent) => {
      if (e.type === "mousedown" && (e as PointerEvent).button !== 0) return;
      if (st.startX !== null) return;
      const p =
        "touches" in e && e.touches.length ? e.touches[0] : (e as PointerEvent);
      if (!p) return;
      st.startX = p.clientX;
      st.startY = p.clientY;
      st.dx = 0;
      st.dy = 0;
      st.axisLocked = false;
      st.suppressClick = false;
      st.dragging = canDrag();
      st.startTranslate = st.translate;
      if (!st.dragging) return;
      stopAutoplay();
      root.classList.add("is-dragging");
      if (wrapRef.current) wrapRef.current.style.transition = "none";
      document.addEventListener("pointermove", onMove, { passive: false });
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (st.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        st.suppressClick = false;
      }
    };
    const onDragStart = (e: Event) => {
      if (canDrag()) e.preventDefault();
    };

    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("pointerdown", onDown as EventListener, true);
    root.addEventListener("touchstart", onDown as EventListener, true);
    root.addEventListener("dragstart", onDragStart);
    return () => {
      root.removeEventListener("click", onClickCapture, true);
      root.removeEventListener("pointerdown", onDown as EventListener, true);
      root.removeEventListener("touchstart", onDown as EventListener, true);
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
      className={`fslide${fade ? " fslide--fade" : ""} ${className}`.trim()}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div ref={wrapRef} className={`fslide__track ${trackClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
});

export default FancySlider;
