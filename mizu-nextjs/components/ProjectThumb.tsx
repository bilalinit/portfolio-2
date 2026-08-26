import type { ThumbKind } from "@/data/projects";

/* SVG placeholder artwork for the featured-project rows and the /work
   grid. The first three (dime/sopfeu/halo) are landscape 140×120 for
   the menu rows; the rest are portrait 140×180 posters for the grid.
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

    /* ===== portrait posters (the /work grid) ===== */

    case "noir":
      /* stacked type bars on near-black, like a swiss type poster */
      return (
        <svg viewBox="0 0 140 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="180" fill="#161310" />
          <g fill="#c9c1b1">
            <rect x="22" y="34" width="96" height="17" />
            <rect x="22" y="59" width="70" height="17" />
            <rect x="22" y="84" width="84" height="17" />
            <rect x="22" y="109" width="52" height="17" />
          </g>
          <rect x="22" y="146" width="34" height="3" fill="#c9c1b1" opacity=".45" />
        </svg>
      );
    case "sunburst":
      /* radiating mark on beige */
      return (
        <svg viewBox="0 0 140 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="180" fill="#c9c1b1" />
          <g stroke="#131009" strokeWidth="4" strokeLinecap="round">
            <line x1="70" y1="28" x2="70" y2="50" />
            <line x1="70" y1="122" x2="70" y2="144" />
            <line x1="12" y1="86" x2="34" y2="86" />
            <line x1="106" y1="86" x2="128" y2="86" />
            <line x1="31" y1="47" x2="47" y2="63" />
            <line x1="93" y1="109" x2="109" y2="125" />
            <line x1="109" y1="47" x2="93" y2="63" />
            <line x1="47" y1="109" x2="31" y2="125" />
          </g>
          <circle cx="70" cy="86" r="15" fill="#131009" />
          <circle cx="70" cy="86" r="6" fill="#c9c1b1" />
          <rect x="22" y="158" width="30" height="3" fill="#131009" opacity=".4" />
        </svg>
      );
    case "eye":
      /* concentric rings around a pupil on dark */
      return (
        <svg viewBox="0 0 140 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="180" fill="#15130f" />
          <g fill="none" stroke="#c9c1b1">
            <circle cx="70" cy="90" r="54" opacity=".3" />
            <circle cx="70" cy="90" r="41" opacity=".5" />
            <circle cx="70" cy="90" r="28" opacity=".75" />
          </g>
          <circle cx="70" cy="90" r="14" fill="#c9c1b1" />
          <circle cx="70" cy="90" r="5" fill="#131009" />
        </svg>
      );
    case "stairs":
      /* ascending steps on warm dark */
      return (
        <svg viewBox="0 0 140 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="180" fill="#23201b" />
          <g fill="#c9c1b1">
            <rect x="24" y="128" width="26" height="26" />
            <rect x="50" y="102" width="26" height="52" />
            <rect x="76" y="76" width="26" height="78" />
            <rect x="102" y="50" width="26" height="104" />
          </g>
          <rect x="24" y="34" width="44" height="3" fill="#c9c1b1" opacity=".4" />
        </svg>
      );
    case "grid":
      /* swiss plus-sign grid with one accent block */
      return (
        <svg viewBox="0 0 140 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="180" fill="#dcd6c8" />
          <g stroke="#131009" strokeWidth="2.5" strokeLinecap="round">
            {[38, 63, 88, 113, 138].map((y) =>
              [28, 53, 78, 103].map((x) => (
                <path key={`${x}-${y}`} d={`M${x - 5} ${y} H${x + 5} M${x} ${y - 5} V${y + 5}`} fill="none" />
              ))
            )}
          </g>
          <rect x="90" y="86" width="26" height="26" fill="#ff5a1f" />
        </svg>
      );
    case "arcs":
      /* rising concentric arcs from the bottom edge */
      return (
        <svg viewBox="0 0 140 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="180" fill="#141210" />
          <g fill="none" stroke="#c9c1b1">
            <circle cx="70" cy="168" r="76" opacity=".85" />
            <circle cx="70" cy="168" r="58" opacity=".6" />
            <circle cx="70" cy="168" r="40" opacity=".4" />
            <circle cx="70" cy="168" r="22" opacity=".25" />
          </g>
        </svg>
      );
  }
}
