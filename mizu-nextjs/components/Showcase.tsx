"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { allWork } from "@/data/projects";
import { homeContent } from "@/data/home";
import { workPresentations } from "@/data/work";
import ProjectArtwork from "@/components/ProjectArtwork";
import styles from "./Showcase.module.css";

export default function Showcase() {
  const root = useRef<HTMLDivElement>(null);
  const projects = homeContent.projects.map((slug) => allWork.find((project) => project.slug === slug)).filter((project) => project !== undefined);
  const [selectedProject, setSelectedProject] = useState(0);
  const activeProject = projects[selectedProject];
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.setAttribute("data-visible", "true"); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    root.current?.querySelectorAll<HTMLElement>("[data-home-reveal]").forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) { element.setAttribute("data-pending", "true"); observer.observe(element); }
    });
    return () => observer.disconnect();
  }, []);

  return <div ref={root} className={styles.showcase}>
    <section className={styles.introduction} aria-labelledby="home-intro-title">
      <h2 id="home-intro-title" className="sr-only">{homeContent.title}</h2>
      <div className={styles.introCopy} data-home-reveal>
        <p className={styles.introStatement}>{homeContent.statement.map((part, index) => part.emphasis ? <strong key={index}>{part.text}</strong> : <span key={index}>{part.text}</span>)}</p>
        <Link href="/about" className={styles.textLink}><span>{homeContent.about}</span></Link>
      </div>
      <aside className={styles.capabilities} aria-labelledby="home-capabilities-title" data-home-reveal>
        <h3 id="home-capabilities-title">{homeContent.capabilitiesTitle}</h3>
        <ul>{homeContent.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
      </aside>
    </section>

    <section id="work" className={styles.work} aria-labelledby="home-work-title">
      <div className={styles.workDetails} data-home-reveal>
        <h2 id="home-work-title">{homeContent.workTitle}</h2>
        <div className={styles.projectChoices} role="group" aria-label={homeContent.projectChoiceLabel}>
          {projects.map((project, index) => <button key={project.slug} type="button" className={styles.projectChoice} aria-pressed={selectedProject === index}
            onClick={() => setSelectedProject(index)} onFocus={() => setSelectedProject(index)}
            onPointerEnter={(event) => { if (event.pointerType === "mouse") setSelectedProject(index); }}>
            <span className={styles.choiceTitle}>{project.name}</span><span className={styles.choiceDescription}>{project.blurb}</span>
          </button>)}
        </div>
        <Link href="/work" className={styles.allWork}>{homeContent.allWork}</Link>
      </div>
      <div className={styles.workVisual} data-home-reveal>
        <ul className={styles.projectTags} aria-label={`${activeProject.name} services`}>{workPresentations[activeProject.slug]?.services.map((service) => <li key={service}>{service}</li>)}</ul>
        <Link href={`/work/${activeProject.slug}`} className={styles.projectLink} aria-label={`View ${activeProject.name} project`}>
          <div className={styles.previewFrame}>{projects.map((project, index) => <div key={project.slug} className={styles.previewImage} data-active={selectedProject === index} aria-hidden={selectedProject !== index}><ProjectArtwork item={project} /></div>)}</div>
          <div className={styles.projectHeading} aria-live="polite"><h3>{activeProject.name}</h3><span className={styles.textLink}>{homeContent.viewProject}</span></div>
        </Link>
      </div>
    </section>

    <section className={styles.nextProject} aria-labelledby="home-next-project-title">
      <h2 id="home-next-project-title" data-home-reveal>{homeContent.nextProjectTitle}<span>{homeContent.nextProjectEmphasis}</span></h2>
      <div className={styles.conversation} data-home-reveal>
        <p>{homeContent.nextProjectDescription}</p>
        <ul className={styles.conversationPrompts}>{homeContent.nextProjectPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>
        <Link href="#pricing" className={`${styles.textLink} ${styles.conversationLink}`}>{homeContent.nextProjectAction}</Link>
      </div>
    </section>

    <section id="services" className={styles.services} aria-labelledby="home-services-title">
      <h2 id="home-services-title" data-home-reveal>{homeContent.servicesTitle}</h2>
      <ul className={styles.serviceList}>{homeContent.services.map((service) => <li key={service.title} data-home-reveal><h3>{service.title}</h3><p>{service.description}</p></li>)}</ul>
    </section>
  </div>;
}
