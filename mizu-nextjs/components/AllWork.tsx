"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { allWork, workCategories } from "@/data/projects";
import { workPageCopy as copy, workPresentations } from "@/data/work";
import { gmailComposeUrl } from "@/lib/contact";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ProjectArtwork from "@/components/ProjectArtwork";
import styles from "./AllWork.module.css";

export default function AllWork() {
  const pathname = usePathname();
  const activeCategory = workCategories.find((category) => pathname === `/work/category/${category.slug}`)?.label;
  const items = activeCategory ? allWork.filter((item) => item.category === activeCategory) : allWork;
  const root = useRef<HTMLElement>(null);
  const filters = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, ready: false });
  useLayoutEffect(() => {
    const nav = filters.current;
    if (!nav) return;
    const measure = () => {
      const selected = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (selected) setIndicator({ left: selected.offsetLeft, top: selected.offsetTop, width: selected.offsetWidth, ready: true });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    nav.querySelectorAll('a').forEach((link) => observer.observe(link));
    return () => observer.disconnect();
  }, [pathname]);
  useEffect(() => {
    // Filtering can move an already-hidden card above the fold. Clear its
    // old reveal state before deciding which cards still need observing.
    root.current?.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      element.removeAttribute("data-pending");
      element.removeAttribute("data-visible");
    });
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.setAttribute("data-visible", "true"); observer.unobserve(entry.target); } });
    }, { threshold: .08 });
    root.current?.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) { element.setAttribute("data-pending", "true"); observer.observe(element); }
    });
    return () => observer.disconnect();
  }, [activeCategory]);
  return <><Hero compact /><main ref={root} className={styles.page}>
    <header className={styles.opening}>
      <h1>{copy.title}</h1>
    </header>
    <section id="projects" aria-label={copy.projectsLabel}>
      <div className={styles.toolbar}><nav ref={filters} aria-label={copy.filterLabel} className={styles.filters} data-ready={indicator.ready} onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest('a');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (link.pathname !== pathname) window.history.pushState(null, '', link.pathname);
      }}>
        <span className={styles.filterIndicator} aria-hidden="true" style={{ width: indicator.width, transform: `translate(${indicator.left}px, ${indicator.top}px)` }} />
        <Link href="/work" aria-current={!activeCategory ? "page" : undefined}><span>{copy.all}</span></Link>
        {workCategories.filter((category) => category.count > 0 || category.label === activeCategory).map((category) => <Link key={category.slug} href={`/work/category/${category.slug}`} aria-current={activeCategory === category.label ? "page" : undefined}><span>{category.label}</span></Link>)}
      </nav></div>
      <div className={styles.projects}>{items.map((item) => <article key={item.slug} className={styles.project} data-reveal>
        <Link href={`/work/${item.slug}`} className={styles.projectLink} aria-label={`${copy.view} — ${item.name}`}>
          <ProjectArtwork item={item} />
          <div className={styles.projectHeading}>
            <h2>{item.name}</h2>
            <span className={styles.viewProject}>{copy.view}</span>
          </div>
          <p className={styles.description}>{item.blurb}</p>
          <ul className={styles.services} aria-label="Project services">
            {workPresentations[item.slug]?.services.map((service) => <li key={service}>{service}</li>)}
          </ul>
        </Link>
      </article>)}</div>
      {items.length === 0 && <div className={styles.empty}><p>{copy.empty}</p><Link href="/work">{copy.showAll}</Link></div>}
    </section>
    <section className={styles.invitation} data-reveal><h2>{copy.nextTitle}</h2><a href={gmailComposeUrl()} target="_blank" rel="noopener noreferrer" className={styles.contact}>{copy.contact}</a></section>
  </main><Footer /></>;
}
