"use client";

import { useEffect, useRef, useState } from "react";
import { skillGroups, skillsContent, skillsIntro } from "@/data/skills";
import styles from "./SkillSets.module.css";

function SkillVisual({ index }: { index: number }) {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.visualLabel}><span>[0{index + 1}]</span><span>{skillsContent.chapters[index].visualLabel}</span></div>
      {index === 0 && <div className={styles.designCanvas}>
        <span className={styles.designType}>Aa</span>
        <div className={styles.designGrid} />
        <span className={styles.designMark}>✳</span>
        <div className={styles.swatches}><i /><i /><i /><i /></div>
      </div>}
      {index === 1 && <div className={styles.browserFrame}>
        <div className={styles.browserBar}><span /><span /><span /><i /></div>
        <div className={styles.browserBody}><span className={styles.codeMark}>{skillsContent.chapters[index].symbol}</span><div className={styles.codeLines}><i /><i /><i /></div><div className={styles.interfaceGrid}><i /><i /><i /></div></div>
        <div className={styles.browserLayer} />
      </div>}
      {index === 2 && <div className={styles.agentCanvas}>
        <svg className={styles.connections} viewBox="0 0 300 220" fill="none" preserveAspectRatio="none"><path d="M40 110H150M150 110V40H260M150 110H260M150 110V180H260" /><path className={styles.signal} d="M40 110H150V40H260" /><path className={styles.signal} d="M40 110H150V180H260" /></svg>
        <span className={styles.inputNode} /><span className={styles.agentNode}>✳</span><span className={`${styles.outputNode} ${styles.outputTop}`}>01</span><span className={`${styles.outputNode} ${styles.outputMiddle}`}>02</span><span className={`${styles.outputNode} ${styles.outputBottom}`}>03</span>
      </div>}
    </div>
  );
}

export default function SkillSets() {
  const root = useRef<HTMLDivElement>(null);
  const [openKey, setOpenKey] = useState<string | null>("0-0");

  useEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>("[data-skill-reveal]");
    if (!elements || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.setAttribute("data-pending", "true");
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header} data-skill-reveal>
          <div><p className={styles.micro}>{skillsContent.label}</p><h2>{skillsContent.title}</h2></div>
          <div className={styles.intro}><span className={styles.micro}>{skillsContent.note}</span><p>{skillsIntro}</p></div>
        </header>
        {skillGroups.map((group, gi) => (
          <section key={group.title} className={styles.chapter} aria-labelledby={`skills-group-${gi}`} data-skill-reveal>
            <div className={styles.chapterHeading}>
              <span className={styles.micro}>[0{gi + 1}] / {group.skills.length.toString().padStart(2, "0")} capabilities</span>
              <h3 id={`skills-group-${gi}`}>{group.title}</h3>
              <p className={styles.statement}>{skillsContent.chapters[gi].statement}</p>
              <p className={styles.summary}>{skillsContent.chapters[gi].summary}</p>
            </div>
            <SkillVisual index={gi} />
            <ul className={styles.skills}>
              {group.skills.map((skill, i) => {
                const key = `${gi}-${i}`;
                const open = openKey === key;
                return <li key={skill.name} className={styles.skill} data-open={open}>
                  <button type="button" aria-expanded={open} aria-controls={`skill-panel-${key}`} id={`skill-trigger-${key}`} onClick={() => setOpenKey(open ? null : key)}>
                    <span className={styles.skillIndex}>{String(i + 1).padStart(2, "0")}</span><span>{skill.name}</span><span className={styles.toggle} aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                  <div className={styles.detail} id={`skill-panel-${key}`} role="region" aria-labelledby={`skill-trigger-${key}`} aria-hidden={!open}><div><p>{skill.detail}</p></div></div>
                </li>;
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
