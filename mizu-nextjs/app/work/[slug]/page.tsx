import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import ProjectThumb from "@/components/ProjectThumb";
import { allWork } from "@/data/projects";
import { workPresentations } from "@/data/work";
import { caseStudies, projectBuilds, caseStudyCopy as copy } from "@/data/caseStudies";
import styles from "./project.module.css";

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
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.wordmark}>Mizu</Link>
        <Link href="/work" className={styles.back}>{copy.allWork}<span>{String(allWork.length).padStart(2, "0")}</span></Link>
      </header>
      <main>
        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{work.category} / {work.tag}</p>
            <h1 id="project-title">{work.name}</h1>
            <p className={styles.credit}>{copy.credit}</p>
            <p className={styles.lead}>{work.blurb}</p>
            {(work.liveUrl || work.github || work.demo) && <div className={styles.actions}>
              {work.liveUrl && <a className={styles.primary} href={work.liveUrl} target="_blank" rel="noopener noreferrer">{study.liveLabel}</a>}
              {!work.liveUrl && work.demo && <a className={styles.primary} href={work.demo.url} target="_blank" rel="noopener noreferrer">{work.demo.label}</a>}
              {work.github && <a className={styles.secondary} href={work.github} target="_blank" rel="noopener noreferrer">{copy.source}</a>}
            </div>}
            <dl className={styles.facts}>
              <div><dt>{copy.year}</dt><dd>{work.year}</dd></div>
              <div><dt>{copy.contribution}</dt><dd>{presentation.services.join(" / ")}</dd></div>
            </dl>
          </div>
          <figure className={styles.visual} data-tone={study.tone} data-kind={work.thumb}>
            <div className={styles.media}><img src={media.src} alt={media.alt} fetchPriority="high" /></div>
            <figcaption><span>{presentation.caption}</span><span>{String(index + 1).padStart(2, "0")}</span></figcaption>
          </figure>
        </section>
        <section className={styles.story} aria-labelledby="idea-title">
          <div><span className={styles.eyebrow}>{copy.overview}</span><h2 id="idea-title">{presentation.label}</h2></div>
          <p>{work.overview[0]}</p>
        </section>
        <section className={styles.features} aria-labelledby="features-title">
          <h2 id="features-title" className={styles.eyebrow}>{copy.capabilities}</h2>
          <div className={styles.featureGrid}>{study.features.map((feature, i) => <article key={feature.title}>
            <span className={styles.featureNumber}>{String(i + 1).padStart(2, "0")}</span>
            <h3>{feature.title}</h3><p>{feature.text}</p>
          </article>)}</div>
        </section>
        {work.demo && <section className={styles.demo} aria-labelledby="example-title">
          <div><span className={styles.eyebrow}>{copy.example}</span><h2 id="example-title">{work.demo.label}</h2><p>{work.demo.description}</p><a className={styles.primary} href={work.demo.url} target="_blank" rel="noopener noreferrer">{work.demo.label}</a></div>
          {work.demo.image && <a className={styles.demoImage} href={work.demo.url} target="_blank" rel="noopener noreferrer" aria-label={work.demo.label}><img src={work.demo.image.src} alt={work.demo.image.alt} loading="lazy" /></a>}
        </section>}
        <section className={styles.technical} aria-labelledby="build-title">
          <h2 id="build-title">{copy.technical}</h2>
          <div><p>{build.summary}</p><ul className={styles.buildTools}>{build.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul></div>
        </section>
        <Link href={`/work/${next.slug}`} className={styles.next}>
          <div><span className={styles.eyebrow}>{copy.next}</span><h2>{next.name}</h2><p>{next.blurb}</p><span className={styles.nextLink}>{copy.view}</span></div>
          <div className={styles.nextVisual}><ProjectThumb kind={next.thumb}/></div>
        </Link>
      </main>
    </div>
    <Footer />
  </>;
}
