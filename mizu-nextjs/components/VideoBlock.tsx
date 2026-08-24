"use client";

import { useEffect, useRef, useState } from "react";

/* showreel fills the frame; hidden until scrolled into view */
export default function VideoBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  /* scroll-in reveal (same threshold as the original) */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative w-[min(1080px,86vw)] mx-auto aspect-video bg-[#060504] overflow-hidden flex items-center justify-center transition-[opacity,translate] duration-1000 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <video
        className="block w-full h-full object-cover"
        src="/showreel.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}
