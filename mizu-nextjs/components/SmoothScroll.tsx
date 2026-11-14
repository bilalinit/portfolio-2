"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useMenus } from "@/components/MenuLayer";

export default function SmoothScroll() {
  const instance = useRef<Lenis | null>(null);
  const { navOpen } = useMenus();
  const blocked = useRef(false);
  blocked.current = navOpen;
  const pathname = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const configure = () => {
      instance.current?.destroy();
      instance.current = null;
      // Phones retain native touch momentum; reduced motion stays native too.
      if (!desktop.matches || reducedMotion.matches) return;
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        stopInertiaOnNavigate: true,
        // Keep wheel smoothing consistent across the pricing form. Only
        // explicit nested scrollers (menus/chat) opt out of page smoothing.
        prevent: (node) => node.hasAttribute("data-lenis-prevent"),
      });
      instance.current = lenis;
      if (blocked.current) lenis.stop();
    };
    configure();
    desktop.addEventListener("change", configure);
    reducedMotion.addEventListener("change", configure);
    return () => {
      desktop.removeEventListener("change", configure);
      reducedMotion.removeEventListener("change", configure);
      instance.current?.destroy();
      instance.current = null;
    };
  }, []);

  useEffect(() => {
    // Only the full-screen mobile menu locks the page. A desktop Work
    // dropdown must not hide the scrollbar or change the viewport width.
    if (navOpen) {
      instance.current?.stop();
      return;
    }
    // Resume after MenuLayer has restored the body's saved scroll position,
    // and discard inertia left over from the previous route or menu state.
    const frame = requestAnimationFrame(() => {
      // Fixing the body makes the document temporarily viewport-height.
      // Refresh the scroll limit before restoring a nonzero saved position.
      instance.current?.resize();
      instance.current?.start();
      instance.current?.scrollTo(window.scrollY, { immediate: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [navOpen, pathname]);

  return null;
}
