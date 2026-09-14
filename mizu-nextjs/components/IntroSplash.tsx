"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __mizuIntroPlayed?: boolean;
  }
}

/* The lockup's resting bbox inside the AE render's 1920x1080 frame,
   measured from the Pre-comp2 sequence (frames settle exactly here).
   The video lives in ONE pose for its whole life — scaled/positioned so
   this region sits on the #hero-lockup image — so the animation reads
   as one continuous move and nothing slides after it ends. Its final
   frame matches the resting page pixel for pixel; lifting the cover is
   invisible. */
const FRAME = { w: 1920, h: 1080 };
const LOCKUP = { x: 153, y: 284, w: 608, h: 128 };

/* Homepage onboarding: the brand lockup animation (PNG sequence encoded
   as VP9-with-alpha WebM) plays over a beige cover, then the cover
   fades to reveal the page with the settled lockup already in place.
   Skips reduced-motion and Safari (no alpha in WebM video); replays
   only on a full reload — the window flag survives client-side route
   changes where Turbopack would reset a module-scope flag. */
export default function IntroSplash() {
  const [active, setActive] = useState(false);
  const [lifting, setLifting] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    /* below the desktop breakpoint the icon's 280px floor breaks the
       scale relationship (text would draw off-screen) — phones and
       tablets just get the static icon */
    if (window.innerWidth < 1025 || window.__mizuIntroPlayed || reduced || isSafari) return;

    document.documentElement.setAttribute("data-intro-pending", "");
    document.body.style.overflow = "hidden";
    setActive(true);

    return () => {
      document.documentElement.removeAttribute("data-intro-pending");
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const box = boxRef.current;
    const video = videoRef.current;
    if (!box || !video) return;

    let cancelled = false;
    let done = false;
    let liftTimer = 0;

    /* map the baked lockup region onto the hero image's live rect */
    const alignPose = () => {
      const img = document.getElementById("hero-lockup");
      if (!img) return;
      const r = img.getBoundingClientRect();
      if (r.width === 0) return;
      const scale = r.width / LOCKUP.w;
      box.style.width = `${FRAME.w * scale}px`;
      box.style.height = `${FRAME.h * scale}px`;
      box.style.left = `${r.left - LOCKUP.x * scale}px`;
      box.style.top = `${r.top - LOCKUP.y * scale}px`;
    };

    const lift = () => {
      if (done) return;
      done = true;
      window.__mizuIntroPlayed = true;
      document.documentElement.removeAttribute("data-intro-pending");
      document.body.style.overflow = "";
      setLifting(true);
      liftTimer = window.setTimeout(() => setActive(false), 700);
    };

    const start = () => {
      if (cancelled) return;
      video.play().catch(lift);
    };

    const beginWhenReady = () => {
      if (cancelled) return;
      const img = document.getElementById("hero-lockup") as HTMLImageElement | null;
      if (img && !img.complete) {
        img.addEventListener("load", start, { once: true });
      } else {
        start();
      }
    };

    const onResize = () => alignPose();
    const onEnded = () => lift();
    const onError = () => lift();

    alignPose();
    window.addEventListener("resize", onResize);

    if (video.readyState >= 3) {
      beginWhenReady();
    } else {
      video.addEventListener("canplay", beginWhenReady, { once: true });
    }
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);

    return () => {
      cancelled = true;
      window.clearTimeout(liftTimer);
      window.removeEventListener("resize", onResize);
      video.removeEventListener("canplay", beginWhenReady);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      id="intro-cover"
      aria-hidden="true"
      className={`fixed inset-0 z-[900] bg-beige transition-opacity duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        lifting ? "pointer-events-none opacity-0" : ""
      }`}
    >
      <div
        ref={boxRef}
        className="pointer-events-none absolute overflow-hidden"
        style={{ width: 0, height: 0 }}
      >
        <video
          ref={videoRef}
          src="/intro/lockup.webm"
          preload="auto"
          muted
          playsInline
          disablePictureInPicture
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
