"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import WorkMenu from "@/components/WorkMenu";
import MobileMenu from "@/components/MobileMenu";
import { featuredProjects, workCategories } from "@/data/projects";

type MenuContextValue = {
  workOpen: boolean;
  navOpen: boolean;
  openWork: () => void;
  closeWork: () => void;
  toggleWork: () => void;
  scheduleWorkClose: () => void;
  keepWorkOpen: () => void;
  openNav: () => void;
  closeNav: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

/* The menu triggers (mobile MENU button, desktop WORK link) live in the
   home page tree; the state they drive lives up here in the layout. */
export function useMenus(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenus must be used within <MenuLayer>");
  return ctx;
}

/* Menu layer — mounted in the root layout so the panels are rendered ABOVE
   route changes. Menu links navigate without closing anything: the panels
   stay up while the (prefetched) destination loads and commit beneath the
   overlay, and only then do the close animations run — sliding away over
   the new page itself. The panels used to live in Hero and died with the
   home page tree on every navigation, which forced the old
   close-then-wait-then-swap sequence: the slide-away revealed home, the
   route swapped late, and the page blinked in after the fact. */
export default function MenuLayer({ children }: { children: ReactNode }) {
  /* work panel: hover-driven on desktop, tap-driven from the mobile menu */
  const [workOpen, setWorkOpen] = useState(false);
  /* mobile main menu sheet (MENU / CLOSE) */
  const [navOpen, setNavOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openWork = useCallback(() => {
    clearCloseTimer();
    setWorkOpen(true);
  }, [clearCloseTimer]);

  /* short grace period so moving between the trigger and the panel keeps it open */
  const scheduleWorkClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setWorkOpen(false);
    }, 200);
  }, [clearCloseTimer]);

  const toggleWork = useCallback(() => {
    clearCloseTimer();
    setWorkOpen((open) => !open);
  }, [clearCloseTimer]);

  const closeWork = useCallback(() => {
    clearCloseTimer();
    setWorkOpen(false);
  }, [clearCloseTimer]);

  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  /* Warm every destination the menus can link to while a menu is open, so
     a tap swaps routes near-instantly: the slide-away then uncovers the
     destination, not home. Needed because the panel's links sit off-viewport
     (translated away) so Next's automatic prefetch never sees them. */
  useEffect(() => {
    if (!workOpen && !navOpen) return;
    router.prefetch("/work");
    for (const p of featuredProjects) router.prefetch(`/work/${p.slug}`);
    for (const c of workCategories) router.prefetch(`/work/category/${c.slug}`);
  }, [workOpen, navOpen, router]);

  /* Escape closes everything */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeWork();
        setNavOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeWork]);

  /* lock page scroll while the mobile menu is up. body overflow:hidden
     alone isn't enough on real phones — iOS momentum scrolling drags the
     page right behind the sheet — so the body is frozen in place with
     position:fixed at its current offset, and the exact offset is
     restored on release. The restore is skipped when the route changed
     while the menu was up (a tapped menu link): the new page must keep
     its own scroll position, not inherit the old page's. */
  const lockedPathRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  useEffect(() => {
    if (!navOpen) return;
    lockedPathRef.current = pathname;
    const scrollY = window.scrollY;
    const style = document.body.style;
    const prev = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      style.overflow = prev.overflow;
      if (lockedPathRef.current === pathnameRef.current) window.scrollTo(0, scrollY);
    };
    // pathname is read through pathnameRef — the lock must survive the
    // route change that closes it, not re-run per navigation
  }, [navOpen]);

  /* route change closes the menus — and this is the MAIN close path for
     menu links: they navigate without closing anything, so the panels
     stay up while the destination loads and the close animations then
     play entirely over the new page ("the page is already there when the
     panel slides away"). It doubles as the safety net for browser
     back/forward and any other navigation, so the overlays can never
     strand open on the wrong page. */
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    closeWork();
    setNavOpen(false);
  }, [pathname, closeWork]);

  const value: MenuContextValue = {
    workOpen,
    navOpen,
    openWork,
    closeWork,
    toggleWork,
    scheduleWorkClose,
    keepWorkOpen: clearCloseTimer,
    openNav,
    closeNav,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
      <MobileMenu open={navOpen} onClose={closeNav} onOpenWork={openWork} />
      <WorkMenu
        open={workOpen}
        onClose={closeWork}
        onBack={() => setWorkOpen(false)}
        onCloseAll={() => {
          setWorkOpen(false);
          setNavOpen(false);
        }}
        onMenuMouseEnter={clearCloseTimer}
        onMenuMouseLeave={scheduleWorkClose}
      />
    </MenuContext.Provider>
  );
}
