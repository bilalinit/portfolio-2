"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/** One observer per route; content stays visible without JavaScript. */
export default function ScrollReveals() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const show = (element: HTMLElement) => {
      element.dataset.revealState = "visible";
      observer?.unobserve(element);
    };
    const configure = () => {
      observer?.disconnect();
      if (motion.matches || !("IntersectionObserver" in window)) {
        elements.forEach(show);
        return;
      }
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) show(entry.target as HTMLElement); });
      }, { rootMargin: "0px 0px -32px 0px", threshold: 0 });
      elements.forEach((element) => {
        // Preserve the page entrance and restored scroll positions. Only
        // unseen content below the viewport receives a scroll entrance.
        if (element.dataset.revealState === "visible" || element.getBoundingClientRect().top < window.innerHeight) show(element);
        else {
          element.dataset.revealState = "pending";
          observer?.observe(element);
        }
      });
    };
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      let element = event.target.closest<HTMLElement>("[data-scroll-reveal]");
      while (element) {
        show(element);
        element = element.parentElement?.closest<HTMLElement>("[data-scroll-reveal]") ?? null;
      }
    };
    configure();
    motion.addEventListener("change", configure);
    document.addEventListener("focusin", onFocus);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", configure);
      document.removeEventListener("focusin", onFocus);
      elements.forEach((element) => {
        if (element.dataset.revealState === "pending") delete element.dataset.revealState;
      });
    };
  }, [pathname]);

  return null;
}
