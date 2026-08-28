type IconProps = {
  className?: string;
};

export function FolderIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      className={className}
    >
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.6l1.9 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-10Z" />
    </svg>
  );
}

export function AccessibilityIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="4.4" r="2.05" />
      <path d="M12 7.6c-2.6 0-5.1-.46-5.1-.46l.36 1.9s2 .4 3.34.47c.06.92.02 1.94-.16 2.8-.27 1.34-1.66 4.42-1.66 4.42l1.82.78s1.28-3.06 1.4-3.34c.12.28 1.4 3.34 1.4 3.34l1.82-.78s-1.39-3.08-1.66-4.42c-.18-.86-.22-1.88-.16-2.8 1.34-.07 3.34-.47 3.34-.47l.36-1.9s-2.5.46-5.1.46Z" />
    </svg>
  );
}

/* dot-matrix circle — the portrait mark in the chat panel's greet view.
   With `bloom`, each dot scales in with a stagger (delay = bloomBase +
   index * 24ms), blooming outward from the center — used when the chat
   panel opens. (The animated strip mark is DotSphere.) */
export function DotsIcon({
  className,
  bloom = false,
  bloomBase = 0,
}: IconProps & { bloom?: boolean; bloomBase?: number }) {
  const dots: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    dots.push({ x: Math.cos(a) * 7, y: Math.sin(a) * 7 });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    dots.push({ x: Math.cos(a) * 14, y: Math.sin(a) * 14 });
  }
  return (
    <svg
      viewBox="-16 -16 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r="1.9"
          className={bloom ? "chat-dot" : undefined}
          style={
            bloom ? { animationDelay: `${bloomBase + i * 24}ms` } : undefined
          }
        />
      ))}
    </svg>
  );
}
