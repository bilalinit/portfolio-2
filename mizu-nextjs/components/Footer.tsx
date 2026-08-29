import { ReactNode } from "react";

/* Footer — light-gray card with rounded top corners, inset from the page edges:
   statement heading on the left, three link columns, an underlined
   "Contact us", and a muted legal row along the bottom. */

type FooterLink = { label: string; href: string; arrow?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Work", href: "/work" },
      { label: "Services", href: "#" },
      { label: "Process", href: "#" },
      { label: "Press kit", href: "#", arrow: true },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "News", href: "#" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "X (Twitter)", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
];

/* underline drawn via ::after, same language as the nav links */
const linkCls =
  "group relative w-fit text-[clamp(15px,1.15vw,18px)] text-[#1a1a1a] no-underline " +
  "after:content-[''] after:absolute after:left-0 after:-bottom-[3px] after:h-px after:w-full after:bg-current " +
  "after:origin-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "hover:after:origin-left hover:after:scale-x-100";

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-[clamp(14px,1.1vw,17px)] font-normal text-[#8f8f8f]">
        {title}
      </h3>
      <ul className="mt-[clamp(28px,3vw,48px)] flex flex-col items-start gap-[clamp(20px,2.6vw,38px)]">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className={linkCls}>
              {link.label}
              {link.arrow && (
                <span
                  aria-hidden="true"
                  className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cell({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export default function Footer() {
  return (
    <footer className="bg-[#f0f0f0] px-[clamp(12px,1.5vw,24px)] pt-[clamp(12px,1.5vw,24px)]">
      <div className="rounded-t-[clamp(24px,3vw,44px)] bg-[#e7e7e7] px-[clamp(24px,5vw,96px)] py-[clamp(44px,6vw,88px)]">
        <div className="grid gap-y-14 min-[901px]:grid-cols-[1.35fr_1fr_1fr_1fr] min-[901px]:gap-x-12">
          {/* statement + tagline */}
          <Cell>
            <p className="max-w-[440px] text-[clamp(26px,2.7vw,40px)] font-medium leading-[1.15] tracking-[-0.015em] text-[#1a1a1a]">
              MIZU — a studio that builds digital employees and the products
              they live in.
            </p>
            <p className="mt-[clamp(40px,5vw,80px)] text-[clamp(15px,1.15vw,18px)] leading-[1.5] text-[#8f8f8f]">
              Designed with intent.
              <br />
              Built to work.
            </p>
          </Cell>

          {/* link columns */}
          {columns.map((col) => (
            <Cell key={col.title}>
              <LinkColumn title={col.title} links={col.links} />
              {/* Contact us lives under the first column, like the reference */}
              {col.title === "Explore" && (
                <a
                  href="mailto:hello@mizu.studio"
                  className="mt-[clamp(56px,7vw,128px)] inline-block text-[clamp(15px,1.15vw,18px)] text-[#1a1a1a] underline decoration-1 underline-offset-[6px] transition-colors duration-300 hover:text-[#8f8f8f]"
                >
                  Contact us
                </a>
              )}
            </Cell>
          ))}
        </div>

        {/* legal row */}
        <div className="mt-[clamp(64px,9vw,150px)] grid gap-y-6 text-[clamp(14px,1.05vw,16px)] text-[#8f8f8f] min-[901px]:grid-cols-[1.35fr_1fr_1fr_1fr] min-[901px]:gap-x-12">
          <p>&copy; 2026 MIZU Inc</p>
          <div>
            <a
              href="#"
              className="w-fit transition-colors duration-300 hover:text-[#1a1a1a]"
            >
              Privacy Policy
            </a>
          </div>
          <div>
            <a
              href="#"
              className="w-fit transition-colors duration-300 hover:text-[#1a1a1a]"
            >
              Data Processing Addendum
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
