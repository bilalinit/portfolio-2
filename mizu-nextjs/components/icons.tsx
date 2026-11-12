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

/* MIZU's mark — three crossing strokes (a six-spoke asterisk). Water made
   geometric; sits ahead of the wordmark in the nav lockup. */
export function MizuMark({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.6v18.8" />
      <path d="M3.6 7.2 20.4 16.8" />
      <path d="M20.4 7.2 3.6 16.8" />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
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
  /* round to 10 decimals: trig results differ in the last ulp between
     the Node server and the browser, which tripped React hydration */
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    dots.push({
      x: Number((Math.cos(a) * 7).toFixed(10)),
      y: Number((Math.sin(a) * 7).toFixed(10)),
    });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    dots.push({
      x: Number((Math.cos(a) * 14).toFixed(10)),
      y: Number((Math.sin(a) * 14).toFixed(10)),
    });
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
