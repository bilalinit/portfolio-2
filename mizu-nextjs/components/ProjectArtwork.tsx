import type { WorkItem } from "@/data/projects";
import { workPresentations } from "@/data/work";
import ProjectThumb from "@/components/ProjectThumb";
import styles from "./ProjectArtwork.module.css";

export default function ProjectArtwork({ item }: { item: Pick<WorkItem, "slug" | "thumb" | "year"> }) {
  const presentation = workPresentations[item.slug];
  if (!presentation) return <div className={styles.fallback}><ProjectThumb kind={item.thumb} /></div>;
  if (item.thumb === "atlas") return <div className={`${styles.artwork} ${styles.atlasArt}`}>
    <img className={styles.atlasScreenshot} src={presentation.image} alt={presentation.alt} loading="lazy" />
  </div>;
  if (item.thumb === "warda" || item.thumb === "promptly" || item.thumb === "promptly-mobile" || item.thumb === "digital-fte") return <div className={`${styles.artwork} ${styles.illustratedArt} ${item.thumb === "warda" ? styles.wardaArt : ""} ${item.thumb === "digital-fte" ? styles.techflowArt : ""}`}>
    <img className={styles.projectIllustration} src={presentation.image} alt={presentation.alt} loading="lazy" />
  </div>;
  return <div className={`${styles.artwork} ${item.thumb === "dropsync" ? styles.dropArt : styles.gameArt}`}>
    {item.thumb === "dropsync" ? <>
      <div className={styles.dropBrand} aria-hidden="true"><span>◆</span> DropSync</div>
      <div className={styles.browserWindow}><div className={styles.browserChrome} aria-hidden="true"><span>● ● ●</span><span>dropsync / workspace</span></div><img src={presentation.image} alt={presentation.alt} width={1857} height={970} fetchPriority="high" /></div>
      <span className={styles.orbit} aria-hidden="true" />
    </> : <>
      <div className={styles.gameBrand} aria-hidden="true">Game <span>cam</span></div>
      <div className={styles.scene} aria-hidden="true"><svg viewBox="0 0 500 400" fill="none"><g stroke="currentColor" strokeWidth="1"><path d="M0 300L500 300M0 330L500 330M0 370L500 370M250 190L0 400M250 190L80 400M250 190L180 400M250 190L320 400M250 190L420 400M250 190L500 400" opacity=".25" /><path d="M90 190L200 130L310 190L200 250Z M90 190V290L200 350L310 290V190M200 250V350" /><path d="M350 120L400 95L450 120L400 145ZM350 120V165L400 190L450 165V120M400 145V190" opacity=".5" /><path d="M40 275C80 110 210 70 355 150" stroke="#fa443b" strokeDasharray="4 7" /><circle cx="40" cy="275" r="5" fill="#fa443b" stroke="none" /><path d="M337 141L358 151L339 161" stroke="#fa443b" /></g></svg><span className={styles.axis}>Y ↑<br />↳ X</span></div>
      <img className={styles.gameInterface} src={presentation.image} alt={presentation.alt} width={548} height={734} />
    </>}
  </div>;
}
