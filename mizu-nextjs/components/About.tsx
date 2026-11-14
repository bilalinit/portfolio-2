"use client";

import Link from "next/link";
import { about } from "@/data/about";
import { gmailComposeUrl } from "@/lib/contact";
import styles from "./About.module.css";
import GithubActivity from "./GithubActivity";
import SkillIcon from "./SkillIcon";

export default function About() {
  return <main className={`${styles.page} page-enter`}>
    <section className={styles.opening} aria-labelledby="about-title">
      <h1 id="about-title">{about.title}</h1>
      <div className={styles.introduction}>
        {about.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <a href={gmailComposeUrl()} target="_blank" rel="noopener noreferrer" className={styles.textLink}>{about.contactLabel}</a>
      </div>
    </section>

    <section className={styles.journey} aria-label="Experience">
      <div className={styles.journeyStart} data-scroll-reveal="fade">
        <ul className={styles.tags} aria-label="Creative background">{about.background.map((item) => <li key={item}>{item}</li>)}</ul>
        <div>
          <p className={styles.startYear}>{about.chapters[0].year}</p>
          <h2>{about.experienceTitle}</h2>
          <p className={styles.journeyCaption}>{about.chapters[0].copy}</p>
        </div>
      </div>
      <div className={styles.journeyDetails} data-scroll-reveal="text" data-reveal-step="1">
        <p className={styles.journeyLead}>{about.experienceIntroduction}</p>
        <div>{about.chapters.slice(1).map((chapter) => <article key={chapter.year} className={styles.chapter}>
          <span className={styles.year}>{chapter.year}</span>
          <div><h3>{chapter.label}</h3><p>{chapter.copy}</p></div>
        </article>)}</div>
        <Link href="/work" className={styles.workLink}>{about.workLabel}<span aria-hidden="true">↗</span></Link>
      </div>
    </section>

    <GithubActivity />
    <section className={styles.expertise} aria-labelledby="expertise-title">
      <header data-scroll-reveal="text"><h2 id="expertise-title" className={styles.sectionTitle}>{about.expertiseTitle}</h2><p>{about.expertiseIntroduction}</p></header>
      <div className={styles.expertiseGrid}>{about.expertise.map((group, index) => <article key={group.title} data-scroll-reveal="text" data-reveal-step={index % 3}>
        <h3>{group.title}</h3><ul>{group.skills.map((skill) => <li key={skill}><SkillIcon skill={skill} /><span>{skill}</span></li>)}</ul>
      </article>)}</div>
    </section>

    <section className={styles.practice} aria-labelledby="practice-title">
      <div className={styles.practiceIntro} data-scroll-reveal="text"><h2 id="practice-title" className={styles.sectionTitle}>{about.practiceTitle}</h2><p>{about.practiceCopy}</p></div>
      <div className={styles.principles}>{about.principles.map((principle, index) => <article key={principle.title} data-scroll-reveal="fade" data-reveal-step={index % 2}><h3>{principle.title}</h3><p>{principle.copy}</p></article>)}</div>
    </section>
    <section className={styles.invitation} aria-labelledby="invitation-title" data-scroll-reveal="text">
      <h2 id="invitation-title">{about.invitation}</h2>
      <div><p>{about.invitationCopy}</p><a href={gmailComposeUrl()} target="_blank" rel="noopener noreferrer" className={styles.contact}>{about.contactLabel}<span aria-hidden="true">↗</span></a></div>
    </section>
  </main>;
}
