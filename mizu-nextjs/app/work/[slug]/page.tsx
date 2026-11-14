import type { Metadata } from "next";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { notFound } from "next/navigation";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { allWork } from "@/data/projects";
import { workPresentations } from "@/data/work";
import { caseStudies, projectBuilds, caseStudyCopy as copy } from "@/data/caseStudies";
import styles from "./project.module.css";

const creditFont = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

interface ProjectProps { params: Promise<{ slug: string }> }
export function generateStaticParams() { return allWork.map((work) => ({ slug: work.slug })); }
export async function generateMetadata({ params }: ProjectProps): Promise<Metadata> {
  const { slug } = await params;
  const work = allWork.find((item) => item.slug === slug);
  return work ? { title: `${work.name} — MIZU`, description: work.blurb } : {};
}

export default async function ProjectPage({ params }: ProjectProps) {
  const { slug } = await params;
  const index = allWork.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();
  const work = allWork[index];
  const study = caseStudies[slug];
  const presentation = workPresentations[slug];
  const media = work.media || { src: presentation.image, alt: presentation.alt };
  const next = allWork[(index + 1) % allWork.length];
  const build = projectBuilds[slug];
  return <>
    <Cursor />
    <Hero compact />
    <div className={`${styles.page} page-enter`}>
      <main>
        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.intro}>
            <h1 id="project-title">{work.name}</h1>
            <p className={`${styles.credit} ${creditFont.variable}`}>{copy.credit}</p>
            <div className={styles.heroDetails}>
              <p className={styles.lead}>{work.blurb}</p>
              {(work.liveUrl || work.github || work.demo) && <div className={styles.actions}>
                {work.liveUrl && <a className={styles.primary} href={work.liveUrl} target="_blank" rel="noopener noreferrer">{study.liveLabel}</a>}
                {!work.liveUrl && work.demo && <a className={styles.primary} href={work.demo.url} target="_blank" rel="noopener noreferrer">{work.demo.label}</a>}
                {work.github && <a className={styles.secondary} href={work.github} target="_blank" rel="noopener noreferrer">{copy.source}</a>}
              </div>}
            </div>
            <dl className={styles.facts}>
              <div><dt>{copy.year}</dt><dd>{work.year}</dd></div>
              <div><dt>{copy.contribution}</dt><dd>{presentation.services.join(" / ")}</dd></div>
            </dl>
          </div>
          <figure className={styles.visual} data-tone={study.tone} data-kind={work.thumb}>
            <div className={styles.media}><img src={media.src} alt={media.alt} fetchPriority="high" /></div>
          </figure>
        </section>
        <section className={styles.story} aria-labelledby="idea-title">
          <h2 id="idea-title" data-scroll-reveal="text">{presentation.label}</h2>
          <p data-scroll-reveal="fade" data-reveal-step="1">{work.overview[0]}</p>
        </section>
        <section className={styles.features} aria-labelledby="features-title">
          <h2 id="features-title" data-scroll-reveal="text">{copy.capabilities}</h2>
          <div className={styles.featureGrid}>{study.features.map((feature, index) => <article key={feature.title} data-scroll-reveal="text" data-reveal-step={index % 2}>
            <h3>{feature.title}</h3><p>{feature.text}</p>
          </article>)}</div>
        </section>
        {work.demo && <section className={styles.demo} aria-labelledby="example-title">
          <div data-scroll-reveal="text"><h2 id="example-title">{work.demo.label}</h2><p>{work.demo.description}</p><a className={styles.primary} href={work.demo.url} target="_blank" rel="noopener noreferrer">{work.demo.label}</a></div>
          {work.demo.image && <a className={styles.demoImage} href={work.demo.url} target="_blank" rel="noopener noreferrer" aria-label={work.demo.label} data-scroll-reveal="image" data-reveal-step="1"><img src={work.demo.image.src} alt={work.demo.image.alt} loading="lazy" /></a>}
        </section>}
        <section className={styles.technical} aria-labelledby="build-title">
          <h2 id="build-title" data-scroll-reveal="text">{copy.technical}</h2>
          <div data-scroll-reveal="fade" data-reveal-step="1"><p>{build.summary}</p><ul className={styles.buildTools}>{build.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul></div>
        </section>
        <section className={styles.next} aria-labelledby="next-project-title">
          <div data-scroll-reveal="text"><span className={styles.nextLabel}>{copy.next}</span><h2 id="next-project-title">{next.name}</h2><p>{next.blurb}</p></div>
          <Link href={`/work/${next.slug}`} className={styles.nextButton} aria-label={`${copy.view}: ${next.name}`} data-scroll-reveal="fade" data-reveal-step="1">
            <span>{copy.view}</span>
          </Link>
        </section>
      </main>
    </div>
    <Footer />
  </>;
}
