import type { ThumbKind } from "@/data/projects";

/* SVG placeholder artwork for the featured-project rows.
   Swap these for real <Image /> thumbnails when assets exist. */
export default function ProjectThumb({ kind }: { kind: ThumbKind }) {
  switch (kind) {
    case "dime":
      return (
        <svg viewBox="0 0 140 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="th-dime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a99f8e" />
              <stop offset="1" stopColor="#57514a" />
            </linearGradient>
          </defs>
          <rect width="140" height="120" fill="url(#th-dime)" />
          <rect width="140" height="26" fill="#b3aa99" opacity=".5" />
          <circle cx="70" cy="47" r="16" fill="#3f3a34" />
          <path d="M40 120 C40 88 52 73 70 73 C88 73 100 88 100 120 Z" fill="#33302b" />
        </svg>
      );
    case "sopfeu":
      return (
        <svg viewBox="0 0 140 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="th-sop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9fb0a8" />
              <stop offset="1" stopColor="#4a5a52" />
            </linearGradient>
          </defs>
          <rect width="140" height="120" fill="url(#th-sop)" />
          <g fill="#3c4a42" opacity=".85">
            <path d="M18 120 L26 58 L34 120 Z" />
            <path d="M44 120 L54 40 L64 120 Z" />
            <path d="M76 120 L84 52 L92 120 Z" />
            <path d="M104 120 L114 64 L124 120 Z" />
          </g>
          <rect y="86" width="140" height="34" fill="#2f3a34" opacity=".55" />
        </svg>
      );
    case "halo":
      return (
        <svg viewBox="0 0 140 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="th-halo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff5a1f" />
              <stop offset="1" stopColor="#dd3110" />
            </linearGradient>
          </defs>
          <rect width="140" height="120" fill="url(#th-halo)" />
          <rect x="52" y="66" width="10" height="54" rx="5" fill="#17130f" transform="rotate(24 57 66)" />
          <g transform="rotate(-30 78 50)">
            <ellipse cx="78" cy="50" rx="27" ry="20" fill="#141210" />
            <ellipse cx="78" cy="50" rx="20" ry="13" fill="#2a241f" />
            <path d="M60 45 A20 13 0 0 1 94 40" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      );
  }
}
