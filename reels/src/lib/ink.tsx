import React from "react";
import { useCurrentFrame } from "remotion";
import { getLength } from "@remotion/paths";
import rough from "roughjs";
import { clamp } from "./motion";

/** Boiling line: the turbulence seed changes every `hold` frames (10 fps at 30 fps), like hand-drawn animation on 3s. */
export const BoilFilter: React.FC<{ id: string; scale?: number; hold?: number; freq?: number }> = ({ id, scale = 2.2, hold = 3, freq = 0.035 }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / hold) % 7;
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
};

/** A path that draws itself: stroke-dasharray = length, dashoffset = length*(1-progress). */
export const DrawPath: React.FC<{ d: string; p: number; stroke?: string; w?: number; fill?: string; filter?: string; opacity?: number; cap?: "round" | "butt" }> = ({ d, p, stroke = "#1c1c1c", w = 4, fill = "none", filter, opacity = 1, cap = "round" }) => {
  let len = 1000;
  try { len = getLength(d); } catch { /* rough.js paths with multiple M segments still work */ }
  const pp = clamp(p);
  if (pp <= 0) return null;
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={w} strokeLinecap={cap} strokeLinejoin="round" strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - pp)} filter={filter} opacity={opacity} />;
};

const gen = rough.generator();
type Op = { d: string; stroke: string; strokeWidth: number; fill?: string };
const cache = new Map<string, Op[]>();
/** rough.js shapes as SVG path data, seeded -> identical every frame. */
export function roughOps(kind: "rect" | "circle" | "line" | "path" | "ellipse", args: number[] | string, opts: Record<string, unknown>): Op[] {
  const key = kind + JSON.stringify(args) + JSON.stringify(opts);
  const hit = cache.get(key); if (hit) return hit;
  const o = { seed: 7, roughness: 1.2, bowing: 1, ...opts } as never;
  let dr;
  if (kind === "rect") { const [x, y, w, h] = args as number[]; dr = gen.rectangle(x, y, w, h, o); }
  else if (kind === "circle") { const [x, y, d] = args as number[]; dr = gen.circle(x, y, d, o); }
  else if (kind === "ellipse") { const [x, y, w, h] = args as number[]; dr = gen.ellipse(x, y, w, h, o); }
  else if (kind === "line") { const [a, b, c, d] = args as number[]; dr = gen.line(a, b, c, d, o); }
  else dr = gen.path(args as string, o);
  const ops = gen.toPaths(dr).map((x) => ({ d: x.d, stroke: x.stroke, strokeWidth: x.strokeWidth, fill: x.fill }));
  cache.set(key, ops); return ops;
}
/** Draws a rough shape progressively (each sub-path in turn). */
export const Rough: React.FC<{ kind: "rect" | "circle" | "line" | "path" | "ellipse"; args: number[] | string; opts?: Record<string, unknown>; p?: number; filter?: string }> = ({ kind, args, opts = {}, p = 1, filter }) => {
  const ops = roughOps(kind, args, opts);
  const n = ops.length;
  return <g filter={filter}>{ops.map((o, i) => {
    const local = clamp(p * n - i);
    if (o.fill && o.fill !== "none" && (o.stroke === "none" || !o.stroke)) return <path key={i} d={o.d} fill={o.fill} opacity={local} />;
    return <DrawPath key={i} d={o.d} p={local} stroke={o.stroke} w={o.strokeWidth} fill="none" />;
  })}</g>;
};
