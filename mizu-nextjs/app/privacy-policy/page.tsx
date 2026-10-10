import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { CONTACT_EMAIL } from "@/data/pricing";
import { gmailComposeUrl } from "@/lib/contact";
import { privacyCopy as copy, privacySections } from "@/data/privacy";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy policy — MIZU",
  description: "How MIZU handles website visits, conversations with Nami and project enquiries, and the choices you have about your information.",
};

export default function PrivacyPolicyPage() {
  return <>
    <Cursor />
    <Hero compact />
    <main className={styles.page}>
      <header className={styles.opening}>
        <div><p className={styles.eyebrow}>{copy.label}</p><h1>{copy.title}</h1></div>
        <div className={styles.introduction}><p>{copy.introduction}</p><span className={styles.updated}>Last updated <time dateTime={copy.updatedDate}>{copy.updated}</time></span></div>
      </header>
      <section className={styles.summary} aria-labelledby="privacy-essentials">
        <h2 id="privacy-essentials" className={styles.eyebrow}>{copy.summaryTitle}</h2>
        <div className={styles.summaryGrid}>{copy.summary.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
      </section>
      <div className={styles.document}>
        <aside className={styles.index}><nav aria-label={copy.index}><p className={styles.eyebrow}>{copy.index}</p><ol>{privacySections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.title}</a></li>)}</ol><a className={styles.indexContact} href="#privacy-contact">{copy.contactLabel}</a></nav></aside>
        <div className={styles.content}>
          {privacySections.map((section, index) => <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
            <span className={styles.sectionNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {"links" in section && section.links.map((link) => <a key={link.href} className={styles.sourceLink} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>)}
          </section>)}
          <section id="privacy-contact" className={styles.contact} aria-labelledby="privacy-contact-title"><p className={styles.eyebrow}>{copy.contactLabel}</p><h2 id="privacy-contact-title">{copy.contactTitle}</h2><p>{copy.contactText}</p><a href={gmailComposeUrl("Privacy enquiry")} target="_blank" rel="noopener noreferrer">{CONTACT_EMAIL}</a></section>
        </div>
      </div>
    </main>
    <Footer />
  </>;
}
