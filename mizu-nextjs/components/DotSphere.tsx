"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/* The chat mark as a real 3D object: COUNT dots distributed on a unit
   sphere (fibonacci lattice), projected every frame with a tilted,
   slowly precessing axis and a yaw driven by a smoothed angular
   velocity. Depth drives scale and opacity — near dots read big and
   bright, far ones small and dim — so it's actual balls orbiting a
   sphere, not a flat disc spinning.

   ONE PARAMETER SYSTEM, FIVE MODES. Every visual channel (yaw speed,
   precession, breathing, squash-stretch, traveling wave, sparkle,
   spread) is a number that EXPONENTIALLY EASES toward the active
   mode's target, and all oscillation phases ACCUMULATE instead of
   reading the clock. Switching modes only swaps targets — nothing is
   restarted, phases continue, so every mode hand-off blends seamlessly
   with no cuts (see taste: no choppiness, continuous motion):

     rest      gentle drift + soft breathing (widget closed)
     hover     slightly faster, brighter, faint sparkle under cursor
     open      calm slow roll while the panel is up
     thinking  agitated: faster spin, ripple through the lattice,
               stronger squash-stretch, near-side dots flash white
               (fake lighting: bright amid gray, no glow)
     morph     "inhale": the whole lattice springs inward while the
               box morphs, then releases with a natural overshoot (the
               spread runs on an underdamped spring, so handing off to
               any other mode swings past its target before settling)

   Under prefers-reduced-motion the loop never starts; the dots sit at
   the deterministic initial frame. */

export type SphereMode = "rest" | "hover" | "open" | "thinking" | "morph";

type DotSphereProps = {
  className?: string;
  mode?: SphereMode;
};

/* ===== per-mode targets (the ONLY thing that changes between states) ===== */
type ParamKey =
  | "spin" /* yaw speed °/s */
  | "prec" /* precession phase speed rad/s */
  | "precAmp" /* tilt oscillation amplitude ° */
  | "rollAmp" /* screen-roll oscillation amplitude ° */
  | "bAmp" /* breathing radial amplitude */
  | "bHz" /* breathing frequency Hz */
  | "str" /* squash-stretch amount */
  | "wAmp" /* traveling-wave amplitude */
  | "wHz"; /* traveling-wave frequency Hz */

/* spark amount rides alongside; the radial spread runs on its own spring */
type Params = Record<ParamKey, number>;

const MODES: Record<SphereMode, { spark: number; spread: number } & Params> = {
  /*        spin prec precA rollA bAmp bHz  str  wAmp wHz  spark spr */
  rest:     { spin: 22, prec: 0.09, precAmp: 4.5, rollAmp: 6,  bAmp: 0.055, bHz: 0.45, str: 0.05, wAmp: 0,    wHz: 0,   spark: 0,    spread: 1 },
  hover:    { spin: 34, prec: 0.14, precAmp: 5,   rollAmp: 7,  bAmp: 0.08,  bHz: 0.8,  str: 0.09, wAmp: 0.04, wHz: 0.6, spark: 0.25, spread: 1.02 },
  open:     { spin: 16, prec: 0.12, precAmp: 5.5, rollAmp: 8,  bAmp: 0.06,  bHz: 0.5,  str: 0.06, wAmp: 0.03, wHz: 0.4, spark: 0,    spread: 1 },
  thinking: { spin: 92, prec: 0.38, precAmp: 7,   rollAmp: 12, bAmp: 0.1,   bHz: 1.5,  str: 0.13, wAmp: 0.17, wHz: 1.1, spark: 1,    spread: 1.05 },
  morph:    { spin: 6,  prec: 0.1,  precAmp: 3,   rollAmp: 4,  bAmp: 0.03,  bHz: 0.5,  str: 0.04, wAmp: 0,    wHz: 0,   spark: 0,    spread: 0.72 },
};

const PKEYS: ParamKey[] = [
  "spin", "prec", "precAmp", "rollAmp", "bAmp", "bHz", "str", "wAmp", "wHz",
];
/* per-channel ease rates (higher = snappier hand-off) */
const RATE: Record<ParamKey | "spark", number> = {
  spin: 3.2, prec: 2.4, precAmp: 3, rollAmp: 3,
  bAmp: 4.5, bHz: 4.5, str: 6, wAmp: 5, wHz: 5, spark: 3.5,
};
const SPARK_HZ = 1.35;
/* spread spring (underdamped → elastic inhale/release) */
const SPRING_K = 110;
const SPRING_C = 13;

const COUNT = 19;
const RADIUS = 10.5; /* px inside the 28px box */
const TILT = (-16 * Math.PI) / 180;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const INITIAL_ANGLE = -38;
const DOT = 3.2; /* px diameter at scale 1 */
const H_DEG = 0.75; /* finite-difference step for velocity sampling */
const H_RAD = (H_DEG * Math.PI) / 180;

/* even unit-sphere distribution */
const BASE: { x: number; y: number; z: number }[] = Array.from(
  { length: COUNT },
  (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / COUNT;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = i * GOLDEN;
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  }
);

type Proj = { sx: number; sy: number; d: number };

/* rotate around Y (yaw), around X (live tilt), then roll the projection
   in screen space — the moving axis is what makes it read as a solid
   ball tumbling rather than a disc spinning on a wire */
function project(
  p: { x: number; y: number; z: number },
  angleDeg: number,
  tilt: number,
  roll: number
): Proj {
  const a = (angleDeg * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const x1 = p.x * ca + p.z * sa;
  const z1 = -p.x * sa + p.z * ca;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  let sx = x1;
  let sy = p.y * ct - z1 * st;
  const d = p.y * st + z1 * ct;
  if (roll !== 0) {
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const rx = sx * cr - sy * sr;
    sy = sx * sr + sy * cr;
    sx = rx;
  }
  return { sx, sy, d };
}

type Phases = { prec: number; breath: number; wave: number; spark: number };

type Framed = Pick<CSSProperties, "transform" | "opacity">;

/* pure per-dot painter shared by the live loop and the static/reduced
   first paint — nothing here touches state */
function dotFrame(
  i: number,
  angle: number,
  pr: Params & { spark: number },
  spreadX: number,
  ph: Phases
): Framed {
  const base = BASE[i];
  const tilt = TILT + pr.precAmp * Math.sin(ph.prec);
  const roll = pr.rollAmp * Math.cos(ph.prec * 0.83);

  const p0 = project(base, angle, tilt, roll);
  const depth = (p0.d + 1) / 2; /* 0 = far pole, 1 = near pole */

  /* traveling wave: ripple sweeps pole-to-pole through the lattice */
  const wLoc = pr.wAmp * Math.sin(ph.wave - i * 0.62);
  /* breathing: per-dot phase offset keeps it organic, not mechanical */
  const bLoc = pr.bAmp * Math.sin(ph.breath + i * 0.37);

  const radius = RADIUS * spreadX * (1 + bLoc + wLoc);
  const x = p0.sx * radius;
  const y = p0.sy * radius;

  /* sparkle: sharp sparse peaks (golden-angle offsets) gated to the
     near side — a few dots flash fully white amid the dimmed ones */
  let sparkFlash = 0;
  if (pr.spark > 0) {
    const gate = Math.min(1, Math.max(0, (depth - 0.55) / 0.3));
    sparkFlash =
      pr.spark *
      gate *
      Math.pow(Math.max(0, Math.sin(ph.spark + i * 2.399)), 24);
  }

  const opacity = Math.min(
    1,
    (0.24 + 0.58 * depth) * (1 + wLoc * 0.35) +
      sparkFlash * (1 - (0.24 + 0.58 * depth))
  );

  let scale = 0.62 + 0.42 * depth;
  scale *= 1 + wLoc * 0.7;
  scale *= 1 + sparkFlash * 0.35;

  /* squash-stretch: elongate along the dot's on-screen orbital
     velocity, compress perpendicular (fade with screen speed so poles
     — which barely move — stay round); volume roughly preserved */
  const p1 = project(base, angle + H_DEG, tilt, roll);
  const vx = (p1.sx - p0.sx) / H_RAD;
  const vy = (p1.sy - p0.sy) / H_RAD;
  const spd = Math.hypot(vx, vy);
  const rotW = Math.min(1, Math.max(0, (spd - 0.1) / 0.25)); /* speed gate */
  const strAmt = pr.str * (0.45 + 0.55 * depth) * rotW;

  let transform: string;
  if (rotW > 0.02) {
    const deg = ((Math.atan2(vy, vx) * 180) / Math.PI).toFixed(1);
    transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${deg}deg) scale(${(
      scale * (1 + strAmt)
    ).toFixed(3)}, ${(scale * (1 - strAmt * 0.82)).toFixed(3)})`;
  } else {
    transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${(
      scale * (1 + strAmt * 0.4)
    ).toFixed(3)}, ${(scale * (1 - strAmt * 0.33)).toFixed(3)})`;
  }

  return { transform, opacity: Number(opacity.toFixed(3)) };
}

const DOT_SHELL: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: DOT,
  height: DOT,
  margin: -DOT / 2,
  borderRadius: "9999px",
  backgroundColor: "currentColor",
  willChange: "transform, opacity",
};

/* deterministic initial snapshot = reduced-motion frame */
const ZERO_PHASES: Phases = { prec: 0, breath: 0, wave: 0, spark: 0 };

export default function DotSphere({ className = "", mode = "rest" }: DotSphereProps) {
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);

  /* latest props + animation state without restarting the loop */
  const target = useRef(mode);
  target.current = mode;
  const anim = useRef({
    angle: INITIAL_ANGLE,
    cur: { ...MODES.rest, spark: MODES.rest.spark },
    spark: 0,
    spreadX: 1,
    spreadV: 0,
    phases: { ...ZERO_PHASES },
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = anim.current;
      const tgt = MODES[target.current];

      /* ease every channel toward its target; phases keep accumulating
         so hand-offs blend instead of popping */
      for (const k of PKEYS) {
        s.cur[k] += (tgt[k] - s.cur[k]) * Math.min(1, dt * RATE[k]);
      }
      s.spark += (tgt.spark - s.spark) * Math.min(1, dt * RATE.spark);

      s.phases.prec += s.cur.prec * dt;
      s.phases.breath += s.cur.bHz * 2 * Math.PI * dt;
      s.phases.wave += s.cur.wHz * 2 * Math.PI * dt;
      s.phases.spark += SPARK_HZ * 2 * Math.PI * dt;
      s.angle = (s.angle + s.cur.spin * dt) % 360;

      /* underdamped spring for the radial spread → the morph inhale
         lands softly and releases with a natural overshoot */
      const ax = SPRING_K * (tgt.spread - s.spreadX) - SPRING_C * s.spreadV;
      s.spreadV += ax * dt;
      s.spreadX += s.spreadV * dt;

      for (let i = 0; i < COUNT; i++) {
        const el = dotsRef.current[i];
        if (!el) continue;
        const framed = dotFrame(
          i,
          s.angle,
          { ...s.cur, spark: s.spark },
          s.spreadX,
          s.phases
        );
        el.style.transform = framed.transform as string;
        el.style.opacity = String(framed.opacity);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden="true" className={`relative ${className}`}>
      {BASE.map((_, i) => {
        const framed = dotFrame(i, INITIAL_ANGLE, MODES.rest, 1, ZERO_PHASES);
        return (
          <span
            key={i}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            style={{ ...DOT_SHELL, ...framed }}
          />
        );
      })}
    </div>
  );
}
