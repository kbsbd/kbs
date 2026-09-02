"use client";

/**
 * The scroll-scrubbed hero.
 *
 * Engineering standard, all of it deliberate:
 *  - the poster paints first and wins the bandwidth race, then the video
 *    streams as a Blob behind an honest loading ring with a no-progress watchdog
 *  - the displayed time is eased toward the target in a rAF loop that RESTS when
 *    converged and when the hero is off-screen, with frame-rate independent
 *    smoothing so a 120Hz screen feels the same as a 60Hz one
 *  - seeks are gated so they never overlap, coalesce to the newest target, and
 *    reset on error so the gate cannot deadlock
 *  - every DOM write is delta-gated
 *  - a single gate hands reduced-motion visitors a designed static hero,
 *    re-evaluated live on rotation and preference changes
 *  - the page is complete and beautiful if the video never loads
 */

import { useEffect, useRef } from "react";
import type { HeroBand, Locale } from "@/content/seed";
import { SplitText, splitSeeded } from "./SplitText";

/* The static-hero gate. The scrub now runs on every viewport — phones and
   tablets included — so the only thing that still opts out is an explicit
   reduced-motion preference. This string is duplicated character for character
   in globals.css. If you change it, change both. */
const GATES = [
  "(prefers-reduced-motion: reduce)",
];

const RING_CIRCUMFERENCE = 126; // 2 * PI * r, r = 20

/* The footage reaches its final resting frame at this much scroll progress,
   and holds there for the rest of the hero. Without it the page settles while
   the camera is still moving: the last caption and the call to action arrive
   over a frame that has not arrived yet. The remaining scroll becomes a real
   settle plateau over the composed ending. */
const VIDEO_ENDS_AT = 0.88;
const videoTime = (p: number, duration: number) =>
  Math.min(1, p / VIDEO_ENDS_AT) * duration;

const smoothstep = (p: number, e0: number, e1: number) => {
  const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Source = { url: string; bytes: number };

type Props = {
  bands: HeroBand[];
  locale: Locale;
  /** H.264 primary, VP9 fallback. Chosen by canPlayType before any bytes move. */
  sources: { h264: Source; vp9: Source };
  posterUrl: string;
  ctaHref: string;
  scrollLabel: string;
};

export default function ScrubHero({
  bands,
  locale,
  sources,
  posterUrl,
  ctaHref,
  scrollLabel,
}: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const ringWrapRef = useRef<SVGSVGElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const poster = posterRef.current;
    if (!hero || !stage || !video || !poster) return;

    const bandEls = Array.from(
      stage.querySelectorAll<HTMLDivElement>("[data-band]")
    );

    /* cached last-written values, so the DOM is touched only on change */
    const cache = bandEls.map(() => ({ op: -1, k: -1 }));

    let target = 0;
    let shown = 0;
    let rafId: number | null = null;
    let lastTick = 0;
    let heroOnScreen = true;
    let scrubOn = false;
    let initialised = false;
    let blobUrl: string | null = null;
    let aborter: AbortController | null = null;

    /* Pick the encode this browser can actually decode. A Chromium built
       without the proprietary codec returns "" here, and an H.264 blob would
       fail with MEDIA_ERR_SRC_NOT_SUPPORTED after the whole file downloaded. */
    const probe = document.createElement("video");
    const source = probe.canPlayType('video/mp4; codecs="avc1.42E01E"')
      ? sources.h264
      : sources.vp9;

    /* Narrow screens: the full-fat master (~15 MB) cannot stream in before the
       visitor has scrolled the hero, so the scrub looks dead on a phone. If the
       file is on Cloudinary, ask for a lighter derivative — about a third of the
       size, still sharp enough for a viewport-cover background. Desktop is
       untouched and keeps the pristine 8-frame-keyframe master. */
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    const cld = source.url.match(
      /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)$/
    );
    const sourceUrl =
      narrow && cld ? `${cld[1]}q_auto:eco,w_1000/${cld[2]}` : source.url;
    const sourceBytes = narrow && cld ? Math.round(source.bytes * 0.33) : source.bytes;

    /* ---------- scroll progress through the pinned region ---------- */
    function heroProgress() {
      const el = heroRef.current;
      if (!el) return 0;
      const range = el.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;
      return clamp(-el.getBoundingClientRect().top / range, 0, 1);
    }

    /* ---------- gated seeks: never overlap, coalesce to newest ---------- */
    let seekBusy = false;
    let pendingTime: number | null = null;

    function requestSeek(t: number) {
      if (!video || !video.duration || !isFinite(video.duration)) return;
      if (seekBusy) {
        pendingTime = t;
        return;
      }
      seekBusy = true;
      try {
        video.currentTime = t;
      } catch {
        seekBusy = false;
      }
    }
    const onSeeked = () => {
      seekBusy = false;
      if (pendingTime !== null) {
        const t = pendingTime;
        pendingTime = null;
        requestSeek(t);
      }
    };
    const onVideoError = () => {
      // the deadlock escape, and the honest fallback
      seekBusy = false;
      pendingTime = null;
      failVideo();
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onVideoError);

    /* ---------- captions: delta-gated writes only ---------- */
    function updateCaptions(p: number) {
      for (let i = 0; i < bandEls.length; i++) {
        const el = bandEls[i];
        const a = Number(el.dataset.from);
        const b = Number(el.dataset.to);
        const f = Math.min(0.02, (b - a) / 3);

        const isFirst = i === 0;
        const isLast = i === bandEls.length - 1;
        const rampIn = isFirst ? 1 : smoothstep(p, a, a + f);
        const rampOut = isLast ? 1 : 1 - smoothstep(p, b - f, b);
        const op = Math.max(0, Math.min(1, rampIn * rampOut));

        const ramp = Number(el.dataset.ramp) || Math.min(0.025, (b - a) * 0.35);
        let k = clamp((p - a) / ramp, 0, 1);
        if (isFirst) k = Math.max(k, loadK);

        const c = cache[i];
        if (Math.abs(op - c.op) > 0.004) {
          c.op = op;
          el.style.opacity = String(op);
          el.style.visibility = op < 0.004 ? "hidden" : "visible";
        }
        if (Math.abs(k - c.k) > 0.008) {
          c.k = k;
          el.style.setProperty("--k", String(k));
        }
      }
    }

    /* band one assembles once on load, then hands over to scroll */
    let loadK = 0;
    let loadStart = 0;
    function runLoadRamp(now: number) {
      if (!loadStart) loadStart = now;
      const t = clamp((now - loadStart) / 900, 0, 1);
      loadK = t * t * (3 - 2 * t);
      updateCaptions(shown);
      if (t < 1 && scrubOn) requestAnimationFrame(runLoadRamp);
    }

    /* ---------- the drive loop, which rests ---------- */
    function tick(now: number) {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      const k = 0.16;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));

      if (Math.abs(target - shown) < 0.0005) {
        shown = target;
        rafId = null;
        lastTick = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }

      if (video && video.duration && isFinite(video.duration)) {
        requestSeek(videoTime(shown, video.duration));
      }
      updateCaptions(shown);
    }

    function onScroll() {
      target = heroProgress();
      if (rafId === null && heroOnScreen && scrubOn) {
        rafId = requestAnimationFrame(tick);
      }
    }

    /* ---------- the streamed blob, behind an honest ring ---------- */
    function failVideo() {
      const ring = ringWrapRef.current;
      if (ring) ring.style.display = "none";
      if (cueRef.current) cueRef.current.style.display = "";
      stage?.classList.add("video-failed");
    }

    async function loadHeroBlob() {
      aborter = new AbortController();
      let watchdog = window.setTimeout(() => aborter?.abort(), 20000);
      try {
        const res = await fetch(sourceUrl, {
          // the hero footage IS the content here, so let it compete for
          // bandwidth rather than sitting at the back of the queue
          priority: "auto",
          signal: aborter.signal,
        });
        if (!res.ok || !res.body) throw new Error("hero video unavailable");

        const total = Number(res.headers.get("Content-Length")) || sourceBytes;
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let got = 0;
        let lastRing = 0;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          window.clearTimeout(watchdog);
          watchdog = window.setTimeout(() => aborter?.abort(), 20000);
          chunks.push(value);
          got += value.length;
          const frac = Math.min(1, got / total);
          const now = performance.now();
          if (now - lastRing > 100 || frac === 1) {
            lastRing = now;
            ringRef.current?.style.setProperty(
              "--ld",
              String(Math.round(RING_CIRCUMFERENCE * (1 - frac)))
            );
          }
        }
        window.clearTimeout(watchdog);
        ringRef.current?.style.setProperty("--ld", "0");

        blobUrl = URL.createObjectURL(new Blob(chunks as BlobPart[]));
        video!.src = blobUrl;
        video!.load();
        video!.addEventListener(
          "canplay",
          () => {
            if (ringWrapRef.current) ringWrapRef.current.style.display = "none";
            requestSeek(videoTime(heroProgress(), video!.duration || 0));
            stage!.classList.add("video-ready");
          },
          { once: true }
        );
      } catch {
        window.clearTimeout(watchdog);
        failVideo();
      }
    }

    /* the poster wins the bandwidth race by design */
    let started = false;
    let posterTimer = 0;
    function startBlobFetch() {
      if (started) return;
      started = true;
      loadHeroBlob();
    }

    function initHeroOnce() {
      if (initialised) return;
      initialised = true;
      poster!.style.backgroundImage = `url('${posterUrl}')`;
      const img = new Image();
      img.onload = startBlobFetch;
      img.onerror = startBlobFetch;
      img.src = posterUrl;
      // don't let a slow poster hold the footage back for long
      posterTimer = window.setTimeout(startBlobFetch, 1500);
    }

    /* ---------- reduced motion: pin and unpin, both directions ---------- */
    function pinToFinalStates() {
      bandEls.forEach((el, i) => {
        el.style.opacity = i === bandEls.length - 1 ? "1" : "0";
        el.style.visibility = i === bandEls.length - 1 ? "visible" : "hidden";
        el.style.setProperty("--k", "1");
        cache[i].op = -1;
        cache[i].k = -1;
      });
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
    function unpinFinalStates() {
      bandEls.forEach((el, i) => {
        el.style.removeProperty("opacity");
        el.style.removeProperty("visibility");
        el.style.removeProperty("--k");
        cache[i].op = -1;
        cache[i].k = -1;
      });
    }

    /* ---------- arm and disarm through the same gate function ---------- */
    function enableScrub() {
      if (scrubOn) return;
      scrubOn = true;
      initHeroOnce();
      window.addEventListener("scroll", onScroll, { passive: true });
      unpinFinalStates();
      loadStart = 0;
      requestAnimationFrame(runLoadRamp);
      updateCaptions(heroProgress());
      onScroll();
    }
    function disableScrub() {
      if (!scrubOn) return;
      scrubOn = false;
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
    function applyHeroMode() {
      if (GATES.some((q) => window.matchMedia(q).matches)) disableScrub();
      else enableScrub();
    }

    const MQLS = GATES.map((q) => window.matchMedia(q));
    MQLS.forEach((m) => m.addEventListener("change", applyHeroMode));

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedMotion = (e: MediaQueryListEvent) => {
      if (e.matches) pinToFinalStates();
      else applyHeroMode();
    };
    rm.addEventListener("change", onReducedMotion);

    const io = new IntersectionObserver(
      ([entry]) => {
        heroOnScreen = entry.isIntersecting;
        if (heroOnScreen && scrubOn) onScroll();
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(hero);

    const onResize = () => {
      if (scrubOn) onScroll();
    };
    window.addEventListener("resize", onResize, { passive: true });

    applyHeroMode();

    return () => {
      disableScrub();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      MQLS.forEach((m) => m.removeEventListener("change", applyHeroMode));
      rm.removeEventListener("change", onReducedMotion);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onVideoError);
      aborter?.abort();
      window.clearTimeout(posterTimer);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [sources.h264.url, sources.h264.bytes, sources.vp9.url, sources.vp9.bytes, posterUrl]);

  return (
    <div ref={heroRef} className="hero">
      <div ref={stageRef} className="stage">
        <div ref={posterRef} className="poster" aria-hidden="true" />

        {/* decorative: the journey is told by the captions, not the footage */}
        <video
          ref={videoRef}
          preload="none"
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="scrim" aria-hidden="true" />

        {bands.map((band, i) => (
          <Band key={band.id} band={band} locale={locale} index={i} ctaHref={ctaHref} />
        ))}

        <svg
          ref={ringWrapRef}
          className="ring"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            opacity="0.22"
          />
          <circle
            ref={ringRef}
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            style={{ strokeDashoffset: "var(--ld, 126)" }}
          />
        </svg>

        <div
          ref={cueRef}
          className="cue font-mono-label"
          style={{ display: "none" }}
          aria-hidden="true"
        >
          {scrollLabel}
        </div>
      </div>
    </div>
  );
}

function Band({
  band,
  locale,
  index,
  ctaHref,
}: {
  band: HeroBand;
  locale: Locale;
  index: number;
  ctaHref: string;
}) {
  const head = band.head[locale];
  const sub = band.sub?.[locale];
  const kicker = band.kicker?.[locale];
  const cta = band.cta?.[locale];

  const charLevel = band.entrance === "grid-snap";

  return (
    <div
      data-band={band.id}
      data-from={band.from}
      data-to={band.to}
      data-lane={band.lane}
      data-entrance={band.entrance}
      data-ramp={band.ramp ?? ""}
      className="band"
      style={
        {
          "--scrim-a": band.scrim,
          opacity: 0,
          visibility: "hidden",
        } as React.CSSProperties
      }
    >
      <div className="inner">
        {kicker && (
          <p className="chip font-mono-label mb-5">{kicker}</p>
        )}

        {band.entrance === "approach-depth" ? (
          <h2 className="depth font-display text-[clamp(2.1rem,5.6vw,4.4rem)]">
            <span className="soft" aria-hidden="true">
              {head}
            </span>
            <span className="sharp">{head}</span>
          </h2>
        ) : (
          <h2 className="font-display text-[clamp(2.1rem,5.6vw,4.4rem)]">
            <SplitText
              text={head}
              seed={index * 977 + 13}
              level={charLevel ? "char" : "word"}
              entrance={band.entrance}
              spread={band.spread}
            />
          </h2>
        )}

        {sub && (
          <p
            className={`sub-line mt-6 max-w-[46ch] text-[clamp(1rem,1.55vw,1.28rem)] leading-relaxed text-[color:var(--text-primary)]/90 ${
              band.entrance === "staged-settle" ? "" : "opacity-[inherit]"
            }`}
          >
            {sub}
          </p>
        )}

        {cta && (
          <div className="cta-row mt-9">
            <a href={ctaHref} className="btn btn-primary">
              {cta}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export { splitSeeded };
