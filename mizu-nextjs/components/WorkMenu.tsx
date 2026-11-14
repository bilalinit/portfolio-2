"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { featuredProjects, workCategories, workMenuCopy } from "@/data/projects";
import ProjectArtwork from "@/components/ProjectArtwork";
import styles from "./WorkMenu.module.css";

type WorkMenuProps = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onCloseAll: () => void;
  onMenuMouseEnter?: () => void;
  onMenuMouseLeave?: () => void;
};
const categoriesWithWork = workCategories.filter((category) => category.count > 0);

export default function WorkMenu({
  open, onClose, onBack, onCloseAll, onMenuMouseEnter, onMenuMouseLeave,
}: WorkMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const trigger = document.getElementById("work-trigger");
      if (rootRef.current?.contains(target) || trigger?.contains(target)) return;
      onClose();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open, onClose]);

  return (
    <>
      <div aria-hidden="true" className={styles.backdrop} data-open={open} />
      <div ref={rootRef} id="work-menu" data-lenis-prevent data-open={open}
        aria-hidden={!open} inert={!open} className={styles.panel}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") onMenuMouseEnter?.(); }}
        onPointerLeave={(event) => { if (event.pointerType === "mouse") onMenuMouseLeave?.(); }}
      >
        <div className={styles.content}>
          <button type="button" onClick={onBack} className={styles.back}>
            <span aria-hidden="true">←</span> {workMenuCopy.back}
          </button>
          <div className={styles.heading}>
            <h2>{workMenuCopy.title}</h2>
            <button type="button" onClick={onClose} aria-label={workMenuCopy.close} className={styles.closeDesktop}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <button type="button" onClick={onCloseAll} aria-label={workMenuCopy.close} className={styles.closeMobile}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <div className={styles.projects}>
            {featuredProjects.map((project) => (
              <Link key={project.slug} href={`/work/${project.slug}`} className={styles.project}>
                <div className={styles.artwork} aria-hidden="true"><ProjectArtwork item={project} /></div>
                <span className={styles.projectHeading}>
                  <span>{project.name}</span>
                </span>
                <span className={styles.description}>{project.blurb}</span>
              </Link>
            ))}
          </div>
          <nav className={styles.categories} aria-label={workMenuCopy.categories}>
            {categoriesWithWork.map((category) => (
              <Link key={category.slug} href={`/work/category/${category.slug}`}>{category.label}</Link>
            ))}
          </nav>
          <Link href="/work" className={styles.allWork}>
            <span>{workMenuCopy.allWork}</span><span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
