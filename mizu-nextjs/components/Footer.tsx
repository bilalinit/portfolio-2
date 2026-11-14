import Link from "next/link";
import { MizuMark } from "@/components/icons";
import { footerCopy } from "@/data/footer";
import { gmailComposeUrl } from "@/lib/contact";
import styles from "./Footer.module.css";

export default function Footer() {
  return <footer className={styles.footer}>
    <div className={styles.main} data-scroll-reveal="fade">
      <div className={styles.identity}>
        <Link href="/" className={styles.brand} aria-label="Mizu home">
          <MizuMark className={styles.mark} /><span>Mizu</span>
        </Link>
      </div>
      <nav className={styles.links} aria-label="Footer navigation">
        {footerCopy.navigation.map((link) => <Link key={link.href} href={link.href} className={styles.link}><span>{link.label}</span></Link>)}
        <a href={gmailComposeUrl()} target="_blank" rel="noopener noreferrer" className={styles.link}><span>{footerCopy.contact}</span></a>
      </nav>
    </div>
    <div className={styles.bottom} data-scroll-reveal="fade" data-reveal-step="1">
      <div className={styles.legal}>
        <p>© {new Date().getUTCFullYear()} Mizu</p>
        <Link href="/privacy-policy" className={styles.link}><span>{footerCopy.privacy}</span></Link>
      </div>
      <nav className={styles.social} aria-label="Social profiles">
        {footerCopy.social.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.link}><span>{link.label}</span></a>)}
      </nav>
    </div>
  </footer>;
}
