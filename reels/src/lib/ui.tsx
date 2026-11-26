import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeIn, springZ } from "./motion";
import { Rough } from "./ink";

/** Paper or cloth ground with static grain + vignette (grain never animates: moving grain reads as video noise). */
export const Ground: React.FC<{ color: string; grain?: number; vignette?: number; children?: React.ReactNode }> = ({ color, grain = 0.08, vignette = 0.35, children }) => (
  <AbsoluteFill style={{ background: color }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "multiply" }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={3} seed={3} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
    {children}
    <AbsoluteFill style={{ background: `radial-gradient(115% 85% at 50% 45%, transparent 55%, rgba(0,0,0,${vignette}))`, pointerEvents: "none" }} />
  </AbsoluteFill>
);

/** Image sequence captured frame-by-frame from a live demo (tools/capture_demos.py). */
export const Capture: React.FC<{ demo: string; from: number; to: number; frames?: number; style?: React.CSSProperties }> = ({ demo, from, to, frames = 150, style }) => {
  const f = useCurrentFrame();
  const u = clamp((f - from) / (to - from));
  const idx = Math.round(u * (frames - 1));
  return <Img src={staticFile(`caps/${demo}/${String(idx).padStart(4, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />;
};

/** Hand-drawn phone: rough.js outline that draws on, screen springs in (zeta 0.8: products get one small bounce). */
export const Phone: React.FC<{ x: number; y: number; w: number; at: number; ink: string; filter?: string; children: React.ReactNode; tilt?: number }> = ({ x, y, w, at, ink, filter, children, tilt = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const h = w * 2.12; const t = (f - at) / fps;
  const s = springZ(t, 0.8, 11); const draw = easeIn(t / 0.7);
  const scr = clamp((t - 0.35) / 0.25);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `translateY(${(1 - s) * 140 + Math.sin(t * 2.2) * 9 * clamp(t)}px) rotate(${tilt * (1 - s * 0.6) + Math.sin(t * 1.3) * 0.6 * clamp(t)}deg)`, opacity: clamp(t / 0.12) }}>
      <div style={{ position: "absolute", left: w * 0.055, top: w * 0.055, right: w * 0.055, bottom: w * 0.055, borderRadius: w * 0.11, overflow: "hidden", opacity: scr, background: "#000", boxShadow: `0 ${w * 0.06}px ${w * 0.12}px rgba(0,0,0,.28)` }}>{children}</div>
      <svg width={w + 40} height={h + 40} style={{ position: "absolute", left: -20, top: -20, overflow: "visible" }}>
        <g transform="translate(20 20)"><Rough kind="path" args={`M ${w * 0.15} 0 L ${w * 0.85} 0 Q ${w} 0 ${w} ${w * 0.15} L ${w} ${h - w * 0.15} Q ${w} ${h} ${w * 0.85} ${h} L ${w * 0.15} ${h} Q 0 ${h} 0 ${h - w * 0.15} L 0 ${w * 0.15} Q 0 0 ${w * 0.15} 0 Z`} opts={{ stroke: ink, strokeWidth: 4.5, roughness: 1.1, seed: 4 }} p={draw} filter={filter} /></g>
      </svg>
    </div>
  );
};

/** Words rising out of a baseline mask, 90 ms stagger, zeta 1.0 (people read it: no overshoot). */
export const MaskWords: React.FC<{ text: string; at: number; style: React.CSSProperties; stagger?: number; out?: number }> = ({ text, at, style, stagger = 0.09, out }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const words = text.split(" ");
  return <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.25em", ...style }}>{words.map((w, i) => {
    const t = (f - at) / fps - i * stagger; const s = springZ(t, 1, 13);
    const o = out !== undefined ? clamp(((f - out) / fps - i * 0.04) / 0.22) : 0;
    return <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
      <span style={{ display: "inline-block", transform: `translateY(${(1 - s) * 110 - o * 110}%)` }}>{w}</span></span>;
  })}</div>;
};

/** Rubber stamp: lands big and settles on a 0.5 spring (two small bounces), slight rotation. */
export const Stamp: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; rot?: number }> = ({ at, children, style, rot = -4 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = (f - at) / fps;
  if (t < 0) return null; const s = springZ(t, 0.5, 20);
  return <div style={{ ...style, transform: `${style?.transform ?? ""} rotate(${rot}deg) scale(${1.35 - 0.35 * s})`, opacity: clamp(t / 0.05) }}>{children}</div>;
};

/** Camera breath: the whole frame drifts a few px on two slow sines (like a handheld macro rig).
 *  A hold should breathe, never freeze. Scale 1.012 so the edges never show. */
export const Breath: React.FC<{ amp?: number; children: React.ReactNode }> = ({ amp = 5, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const x = Math.sin(t * 0.83) * amp + Math.sin(t * 2.1 + 1) * amp * 0.25, y = Math.cos(t * 0.61) * amp * 1.2;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(1.012) rotate(${Math.sin(t * 0.47) * 0.12}deg)` }}>{children}</AbsoluteFill>;
};
