import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Cursor from "@/components/Cursor";
import { allWork } from "@/data/projects";

/* /work/[slug] — one case study per project, modeled on the overview
   reference (overview page.png): minimal top bar, giant stacked display
   title, red handwritten byline, centered media block, then the
   (Overview) label + paragraph. Shell-less like /work: no hero, no
   footer; the cursor stays for the site-wide cursor:none rule.
   Media is the shared showreel until per-project footage exists. */

interface ProjectProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allWork.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: ProjectProps): Promise<Metadata> {
  const { slug } = await params;
  const work = allWork.find((w) => w.slug === slug);
  if (!work) return {};
  return { title: `${work.name} — MIZU`, description: work.overview };
}

/* staggered load-in, same rise as the hero (guard: .pp .rise in globals) */
const rise = "rise animate-[riseIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both]";

export default async function ProjectPage({ params }: ProjectProps) {
  const { slug } = await params;
  const work = allWork.find((w) => w.slug === slug);
  if (!work) notFound();

  /* multi-word names stack, like the reference's two-line title */
  const titleLines = work.name.split(" ");

  return (
    <div className="pp">
      <Cursor />

      {/* top bar: wordmark left, all-work link right */}
      <header className="flex items-center justify-between px-6 pt-5 max-[860px]:px-[18px] max-[860px]:pt-[18px]">
        <Link
          href="/"
          className="font-display text-[clamp(20px,1.8vw,26px)] uppercase leading-none text-ink no-underline"
        >
          Mizu
        </Link>
        <Link
          href="/work"
          className="inline-flex items-center py-2 text-[12px] font-medium uppercase tracking-[0.05em] text-ink no-underline transition-colors duration-200 hover:text-ink/60"
        >
          <span aria-hidden="true" className="mr-1">
            [+]
          </span>{" "}
          All work
        </Link>
      </header>

      <main className="px-6 pb-[clamp(80px,10vw,160px)] text-center max-[860px]:px-[18px]">
        {/* stacked display title */}
        <h1
          className={`${rise} mx-auto mt-[clamp(48px,7vw,110px)] font-display text-[clamp(46px,8vw,118px)] leading-[0.92] tracking-[0.005em] uppercase text-ink`}
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        {/* handwritten byline, red like the reference */}
        <p
          className={`${rise} [animation-delay:0.12s] mt-5 font-hand text-[clamp(20px,1.8vw,26px)] text-[#ff5a1f]`}
        >
          By MIZU Studio
        </p>

        {/* media block */}
        <div
          className={`${rise} [animation-delay:0.22s] mx-auto mt-[clamp(36px,5vw,64px)] aspect-video w-[min(640px,100%)] overflow-hidden bg-[#e7e7e7]`}
        >
          <video
            className="block h-full w-full object-cover"
            src="/showreel.mp4"
            controls
            playsInline
            preload="metadata"
            aria-label={`Showreel — ${work.name}`}
          />
        </div>

        {/* overview */}
        <p
          className={`${rise} [animation-delay:0.32s] mt-[clamp(48px,6vw,88px)] font-hand text-[clamp(18px,1.6vw,24px)] text-ink`}
        >
          (Overview)
        </p>
        <p
          className={`${rise} [animation-delay:0.4s] mx-auto mt-[clamp(20px,2.5vw,36px)] max-w-[600px] text-[clamp(16px,1.4vw,19px)] leading-[1.6] text-ink`}
        >
          {work.overview}
        </p>

        <p
          className={`${rise} [animation-delay:0.48s] mt-[clamp(40px,5vw,72px)] text-[12px] font-medium uppercase tracking-[0.05em] text-ink/50`}
        >
          {work.category} — {work.year}
        </p>
      </main>
    </div>
  );
}
