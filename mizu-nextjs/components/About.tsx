"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { about } from "@/data/about";
import { CONTACT_EMAIL } from "@/data/pricing";
import styles from "./About.module.css";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!elements || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.setAttribute("data-pending", "true");
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={root} className={styles.page}>
      <section className={styles.opening} aria-labelledby="about-title">
        <div className={styles.kicker}><span>{about.eyebrow}</span><span>{about.independent}</span></div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1 id="about-title" className={styles.title}>{about.title.map((line, i) => <span key={line} style={{ "--delay": `${i * 130}ms` } as CSSProperties}>{line}</span>)}</h1>
            <p className={styles.introduction}>{about.introduction}</p>
            <div className={styles.heroBottom}><span className={styles.micro}>{about.mindset[0]}<br />{about.mindset[1]}</span><a href="#story" className={styles.scrollLink}>{about.storyLink} <span aria-hidden="true">↓</span></a></div>
          </div>
          <div className={styles.study}>
            <div className={styles.studyTop}><span>{about.study.label}</span></div>
            <div className={styles.motionCanvas} aria-hidden="true">
              <div className={styles.typeFrame}>
                <span className={styles.registration} />
                <div className={styles.kineticType}>
                  {about.study.words.map((word, i) => (
                    <span key={word} className={styles.typeLine} style={{ "--line": i } as CSSProperties}>
                      <span className={styles.typeEcho}>{word}</span>
                      <span className={styles.typeFace}>{word}</span>
                    </span>
                  ))}
                </div>
                <span className={styles.frameIndex}>[01—03]</span>
              </div>
              <div className={styles.timeline}>
                <div className={styles.timelineRuler}><span>↳</span><span>{about.study.time}</span></div>
                <div className={styles.tracks}>
                  {about.study.tracks.map((track) => <div className={styles.track} key={track}><span>{track}</span><i /></div>)}
                  <span className={styles.playhead} />
                </div>
              </div>
            </div>
            <div className={styles.studyBottom}><span>{about.study.caption}</span><span>{about.study.index}</span></div>
          </div>
        </div>
        <div className={styles.openingFoot}><span>{about.disciplines}</span><p>{about.description}</p></div>
      </section>
      <section id="story" className={styles.story} aria-labelledby="story-title">
        <div className={styles.sectionLabel} data-reveal>{about.storyLabel}</div>
        <div className={styles.storyGrid}>
          <h2 id="story-title" className={styles.sectionTitle} data-reveal>{about.storyTitle}</h2>
          <div className={styles.storyText} data-reveal>{about.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
        <div className={styles.disciplineLine} aria-hidden="true"><span>Frame.</span><span>Form.</span><span>Function.</span><span className={styles.disciplineStar}>✳</span></div>
      </section>
      <section className={styles.chapters} aria-labelledby="chapters-title">
        <div className={styles.chapterHeader} data-reveal><span className={styles.micro}>{about.chapterLabel}</span><h2 id="chapters-title">{about.chapterTitle}</h2><span className={styles.micro}>{about.chapterPeriod}</span></div>
        {about.chapters.map((chapter, i) => <article className={styles.chapter} key={chapter.year} data-reveal><span className={styles.year}>{chapter.year}<sup>[0{i + 1}]</sup></span><div><span className={styles.micro}>{chapter.discipline}</span><h3>{chapter.label}</h3></div><p>{chapter.copy}</p><span className={styles.chapterArrow} aria-hidden="true">↗</span></article>)}
      </section>
      <section className={styles.practice} aria-labelledby="practice-title">
        <div className={styles.practiceIntro} data-reveal><span className={styles.sectionLabel}>{about.practiceLabel}</span><h2 id="practice-title" className={styles.sectionTitle}>{about.practiceTitle}</h2><p>{about.practiceCopy}</p><Link href="/work" className={styles.textLink}>{about.workLabel} <span aria-hidden="true">↗</span></Link></div>
        <div className={styles.principles}>{about.principles.map((principle) => <article key={principle.number} data-reveal><span className={styles.micro}>[{principle.number}]</span><h3>{principle.title}</h3><p>{principle.copy}</p></article>)}</div>
      </section>
      <section className={styles.invitation} aria-labelledby="invitation-title" data-reveal><div><span className={styles.micro}>{about.invitationLabel}</span><h2 id="invitation-title">{about.invitation}</h2></div><div className={styles.invitationSide}><p>{about.invitationCopy}</p><a href={`mailto:${CONTACT_EMAIL}`} className={styles.contact}>{about.contactLabel}<span aria-hidden="true">↗</span></a></div></section>
    </main>
  );
}
