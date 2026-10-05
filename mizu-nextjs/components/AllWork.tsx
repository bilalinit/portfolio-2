"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { allWork, totalWork, workCategories, type WorkItem } from "@/data/projects";
import { workPageCopy as copy, workPresentations } from "@/data/work";
import { gmailComposeUrl } from "@/lib/contact";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ProjectThumb from "@/components/ProjectThumb";
import styles from "./AllWork.module.css";

function ProjectArtwork({ item }: { item: WorkItem }) {
  const presentation = workPresentations[item.slug];
  if (!presentation) return <div className={styles.fallback}><ProjectThumb kind={item.thumb} /></div>;
  if (item.thumb === "warda" || item.thumb === "promptly" || item.thumb === "promptly-mobile") return <div className={`${styles.artwork} ${styles.illustratedArt} ${item.thumb === "warda" ? styles.wardaArt : ""}`}>
    <img className={styles.projectIllustration} src={presentation.image} alt={presentation.alt} loading="lazy" />
    <div className={styles.artTop}><span>{presentation.label}</span></div>
    <div className={styles.artBottom}><span>{presentation.caption}</span><span>{item.year}</span></div>
  </div>;
  return <div className={`${styles.artwork} ${item.thumb === "dropsync" ? styles.dropArt : styles.gameArt}`}>
    <div className={styles.artTop}><span>{presentation.label}</span></div>
    {item.thumb === "dropsync" ? <>
      <div className={styles.dropBrand} aria-hidden="true"><span>◆</span> DropSync</div>
      <div className={styles.browserWindow}><div className={styles.browserChrome} aria-hidden="true"><span>● ● ●</span><span>dropsync / workspace</span></div><img src={presentation.image} alt={presentation.alt} width={1857} height={970} fetchPriority="high" /></div>
      <span className={styles.orbit} aria-hidden="true" />
    </> : <>
      <div className={styles.gameBrand} aria-hidden="true">Game <span>cam</span></div>
      <div className={styles.scene} aria-hidden="true"><svg viewBox="0 0 500 400" fill="none"><g stroke="currentColor" strokeWidth="1"><path d="M0 300L500 300M0 330L500 330M0 370L500 370M250 190L0 400M250 190L80 400M250 190L180 400M250 190L320 400M250 190L420 400M250 190L500 400" opacity=".25" /><path d="M90 190L200 130L310 190L200 250Z M90 190V290L200 350L310 290V190M200 250V350" /><path d="M350 120L400 95L450 120L400 145ZM350 120V165L400 190L450 165V120M400 145V190" opacity=".5" /><path d="M40 275C80 110 210 70 355 150" stroke="#fa443b" strokeDasharray="4 7" /><circle cx="40" cy="275" r="5" fill="#fa443b" stroke="none" /><path d="M337 141L358 151L339 161" stroke="#fa443b" /></g></svg><span className={styles.axis}>Y ↑<br />↳ X</span></div>
      <img className={styles.gameInterface} src={presentation.image} alt={presentation.alt} width={548} height={734} />
    </>}
    <div className={styles.artBottom}><span>{presentation.caption}</span><span>{item.year}</span></div>
  </div>;
}

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
      <div className={styles.intro}><h1>{copy.title}</h1><p>{copy.introduction}</p></div>
    </header>
    <section id="projects" aria-label={copy.projectsLabel}>
      <div className={styles.toolbar}><nav ref={filters} aria-label={copy.filterLabel} className={styles.filters} data-ready={indicator.ready} onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest('a');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (link.pathname !== pathname) window.history.pushState(null, '', link.pathname);
      }}>
        <span className={styles.filterIndicator} aria-hidden="true" style={{ width: indicator.width, transform: `translate(${indicator.left}px, ${indicator.top}px)` }} />
        <Link href="/work" aria-current={!activeCategory ? "page" : undefined}>{copy.all}<sup>{String(totalWork).padStart(2, "0")}</sup></Link>
        {workCategories.filter((category) => category.count > 0 || category.label === activeCategory).map((category) => <Link key={category.slug} href={`/work/category/${category.slug}`} aria-current={activeCategory === category.label ? "page" : undefined}>{category.label}<sup>{String(category.count).padStart(2, "0")}</sup></Link>)}
      </nav><span className={styles.indexLabel}>{String(items.length).padStart(2, "0")} {copy.indexLabel}</span></div>
      <div className={styles.projects}>{items.map((item) => <article key={item.slug} className={styles.project} data-reveal>
        <Link href={`/work/${item.slug}`} className={styles.projectLink} aria-label={`${copy.view} — ${item.name}`}>
          <div className={styles.projectTop}><span>[{String(allWork.findIndex((project) => project.slug === item.slug) + 1).padStart(2, "0")}]</span><span>{item.category} / {item.tag}</span></div>
          <ProjectArtwork item={item} />
          <div className={styles.projectHeading}><h2>{item.name}</h2><span className={styles.caseLink}>{copy.view}</span></div>
          <p className={styles.description}>{item.blurb}</p>
          <div className={styles.projectFoot}>{(workPresentations[item.slug]?.services || [item.category]).map((service) => <span className={styles.serviceTag} key={service}>{service}</span>)}</div>
        </Link>
      </article>)}</div>
      {items.length === 0 && <div className={styles.empty}><p>{copy.empty}</p><Link href="/work">{copy.showAll}</Link></div>}
    </section>
    <section className={styles.invitation} data-reveal><div><span className={styles.micro}>{copy.nextLabel}</span><h2>{copy.nextTitle}</h2></div><a href={gmailComposeUrl()} target="_blank" rel="noopener noreferrer" className={styles.contact}>{copy.contact}</a></section>
  </main><Footer /></>;
}
