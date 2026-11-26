import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, outExpo, rng, springZ } from "./motion";

/** Sakuga impact: 1-frame inverted flash disc, tapered speed wedges, smoke puffs that roll out and shrink,
 *  optional manga-style SFX lettering that lands on a 0.5 spring. All closed-form in (frame - at). */
export const Impact: React.FC<{ at: number; x: number; y: number; size?: number; ink?: string; fill?: string; accent?: string; sfx?: string; seed?: number; font?: string; filter?: string }> =
({ at, x, y, size = 260, ink = "#1c1c1c", fill = "#ffffff", accent = "#ff5fa8", sfx, seed = 1, font = "Bowlby", filter }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = (f - at) / fps; if (t < 0 || t > 1.1) return null;
  const R = rng(seed);
  const wedges = Array.from({ length: 11 }, (_, i) => ({ a: (i / 11) * Math.PI * 2 + R() * 0.3, l: 0.6 + R() * 0.6, w: 0.05 + R() * 0.05 }));
  const puffs = Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2 + R() * 0.5, r: 0.16 + R() * 0.12, d: 0.55 + R() * 0.35 }));
  const u = outExpo(t / 0.35);
  const fade = clamp(1 - (t - 0.45) / 0.5);
  return (
    <g transform={`translate(${x} ${y})`} filter={filter}>
      {f - at < 2 && <circle r={size * 0.55} fill={ink} opacity={f === at ? 1 : 0.5} />}
      {wedges.map((w, i) => {
        const r0 = size * (0.25 + 0.55 * u), r1 = size * (0.25 + (0.55 + w.l) * u);
        const ca = Math.cos(w.a), sa = Math.sin(w.a), pa = w.w * fade;
        if (t > 0.5) return null;
        return <path key={i} d={`M${ca * r0} ${sa * r0} L${Math.cos(w.a + pa) * r1} ${Math.sin(w.a + pa) * r1} L${Math.cos(w.a - pa) * r1} ${Math.sin(w.a - pa) * r1}Z`} fill={i % 3 === 0 ? accent : ink} />;
      })}
      {puffs.map((p, i) => {
        const k = outExpo(t / 0.7); const rr = size * p.r * (0.4 + 0.9 * k) * (1 - clamp((t - 0.5) / 0.6));
        const dx = Math.cos(p.a) * size * p.d * k, dy = Math.sin(p.a) * size * p.d * k - size * 0.15 * t;
        if (rr <= 0) return null;
        return <g key={i}><circle cx={dx} cy={dy} r={rr} fill={fill} stroke={ink} strokeWidth={5} />
          <circle cx={dx + rr * 0.25} cy={dy + rr * 0.3} r={rr * 0.45} fill={fill} stroke={ink} strokeWidth={3.5} /></g>;
      })}
      {sfx && (() => { const s = springZ(t, 0.5, 18); return <text x={0} y={-size * 0.95} textAnchor="middle" fontFamily={font} fontSize={size * 0.55} fill={accent} stroke={ink} strokeWidth={8} paintOrder="stroke" transform={`rotate(-8) scale(${0.4 + 0.6 * s})`} opacity={clamp(1 - (t - 0.8) / 0.3)}>{sfx}</text>; })()}
    </g>
  );
};
