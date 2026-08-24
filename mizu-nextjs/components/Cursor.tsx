"use client";

import { useEffect, useRef, useState } from "react";

/* Custom cursor: outer wrapper is positioned by JS only,
   the inner dot owns all visuals/transitions.
   Only rendered on devices with a fine pointer (mouse / trackpad). */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [grow, setGrow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let tx = 0;
    let ty = 0;
    let dx = 0;
    let dy = 0;
    let started = false;
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!started) {
        started = true; /* first move: snap into place, no fly-in */
        dx = tx;
        dy = ty;
        setVisible(true);
      }
    };

    /* hide when the mouse leaves the window, show again when it returns */
    const onDocLeave = () => setVisible(false);
    const onDocEnter = () => {
      if (started) setVisible(true);
    };

    /* grow over interactive elements (event delegation) */
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest("a, button")) setGrow(true);
    };
    const onOut = (e: MouseEvent) => {
      const from = (e.target as Element | null)?.closest("a, button");
      const to = (e.relatedTarget as Element | null)?.closest("a, button");
      if (from && from !== to) setGrow(false);
    };

    const loop = () => {
      dx += (tx - dx) * 0.55; /* dot hugs the mouse */
      dy += (ty - dy) * 0.55;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onDocLeave);
    document.addEventListener("mouseenter", onDocEnter);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onDocLeave);
      document.removeEventListener("mouseenter", onDocEnter);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={dotRef} className="pointer-events-none fixed top-0 left-0 z-[999]" aria-hidden="true">
      <div
        className={`-ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-white mix-blend-difference transition-[scale,opacity] duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
          visible ? "opacity-100" : "opacity-0"
        } ${grow ? "scale-[2.4]" : "scale-100"}`}
      />
    </div>
  );
}
