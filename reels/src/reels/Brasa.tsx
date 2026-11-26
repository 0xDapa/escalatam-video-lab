import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import T from "../timing/brasa.json";
import { BoilFilter, DrawPath, Rough } from "../lib/ink";
import { clamp, easeIn, easeOut, lerp, rng, smooth } from "../lib/motion";
import { Impact } from "../lib/sakuga";
import { Breath, Capture, Ground, MaskWords, Phone } from "../lib/ui";
import { Signature } from "../lib/end";

const BG = "#120d0a", INK = "#f4ece2", ACC = "#ff5a1f";
// flame in three strokes (outer, inner, core), drawn with one pen
const FLAME = ["M540 140 C 650 260 730 380 690 520 C 665 610 600 650 540 650 C 450 650 385 600 378 515 C 368 420 440 370 462 280 C 482 350 520 360 540 140 Z",
  "M545 330 C 610 410 625 480 598 545 C 578 590 512 592 488 548 C 466 505 505 460 545 330 Z",
  "M420 700 L 660 700 M 450 735 L 630 735"];

export const BrasaReel: React.FC = () => {
  const f = useCurrentFrame(); const { fps, width } = useVideoConfig(); const s = f / fps;
  // flame travels from hero position to a small corner mark when the phone arrives
  const k = smooth((s - 3.3) / 0.6);
  const fx = lerp(0, -330, k), fy = lerp(380, -40, k), fs = lerp(1.25, 0.42, k);
  const R = rng(9);
  const sparks = Array.from({ length: 26 }, () => ({ x: 380 + R() * 320, sp: 0.25 + R() * 0.5, ph: R(), r: 3 + R() * 5 }));
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Breath><Ground color={BG} grain={0.12} vignette={0.55}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs><BoilFilter id="boil" scale={3} /></defs>
          <g transform={`translate(${fx + 540 * (1 - fs)} ${fy}) scale(${fs})`} filter="url(#boil)">
            {FLAME.map((d, i) => <DrawPath key={i} d={d} p={easeIn((s - T.flame_draw[0] - i * 0.35) / 1.0)} stroke={i === 1 ? ACC : INK} w={i === 1 ? 7 : 6} />)}
            {sparks.map((p, i) => { const u = ((s * p.sp + p.ph) % 1); const a = clamp((s - 1) / 0.5) * (1 - u) * (s < 12 ? 1 : 0);
              return <circle key={i} cx={p.x + Math.sin(u * 9 + i) * 18} cy={640 - u * 560} r={p.r * (1 - u)} fill={i % 3 ? ACC : "#ffb36b"} opacity={a} />; })}
          </g>
        </svg>
        {/* scene 1 title */}
        <div style={{ position: "absolute", left: 70, right: 70, top: 1330 }}>
          <MaskWords text="FUEGO LENTO," at={T.title * fps} out={T.title_out * fps} style={{ fontFamily: "BrasaDisplay", fontSize: 172, lineHeight: 0.9, color: INK, letterSpacing: "-0.01em" }} />
          <MaskWords text="SABOR ETERNO" at={(T.title + 0.25) * fps} out={(T.title_out + 0.05) * fps} style={{ fontFamily: "BrasaDisplay", fontSize: 172, lineHeight: 0.9, color: ACC, letterSpacing: "-0.01em" }} />
          <div style={{ fontFamily: "SpaceMono", fontSize: 30, color: INK, opacity: clamp((s - T.kicker) / 0.3) * (1 - clamp((s - T.title_out) / 0.2)), marginTop: 30, letterSpacing: "0.08em" }}>BRASA NORTE · ASADOR · DEMO</div>
        </div>
        {/* scene 2: phone + hand-drawn callouts */}
        {s > 3.4 && s < 12.6 && (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${easeOut((s - T.phone_out) / 0.45) * -1100}px)` }}>
            <Phone x={680} y={1000} w={560} at={T.phone_in * fps} ink={INK} filter="url(#boil2)" tilt={3}>
              <Capture demo="01-webgl2-puro" from={T.scroll[0] * fps} to={T.scroll[1] * fps} />
            </Phone>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <defs><BoilFilter id="boil2" scale={2.5} /></defs>
              {T.callouts.map((c, i) => { const t = s - c.t; if (t < -0.8) return null; const y = c.y;
                return <g key={i}>
                  <DrawPath d={`M 250 ${y + 70} C 300 ${y + 120}, 340 ${y + 110}, 385 ${y + 60}`} p={easeIn((t + 0.6) / 0.5)} stroke={ACC} w={6} filter="url(#boil2)" />
                  <DrawPath d={`M 360 ${y + 58} L 388 ${y + 58} L 382 ${y + 86}`} p={easeIn((t + 0.15) / 0.2)} stroke={ACC} w={6} filter="url(#boil2)" />
                  <Impact at={c.t * fps} x={395} y={y + 60} size={120} ink={INK} fill={BG} accent={ACC} seed={i + 3} filter="url(#boil2)" />
                </g>; })}
            </svg>
            {T.callouts.map((c, i) => <div key={i} style={{ position: "absolute", left: 40, top: c.y - 110, width: 330 }}>
              <MaskWords text={c.text} at={(c.t - 0.7) * fps} style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 70, lineHeight: 0.95, color: INK }} />
            </div>)}
          </div>)}
        {/* scene 3: one line */}
        {s > 12 && s < 16.4 && <div style={{ position: "absolute", left: 80, right: 80, top: 760 }}>
          <MaskWords text="una web que" at={T.line_in * fps} out={15.7 * fps} style={{ fontFamily: "BrasaDisplay", fontSize: 150, lineHeight: 0.92, color: INK }} />
          <MaskWords text="huele a brasa." at={(T.line_in + 0.35) * fps} out={15.75 * fps} style={{ fontFamily: "BrasaDisplay", fontSize: 150, lineHeight: 0.92, color: ACC }} />
          <svg width={920} height={120} style={{ overflow: "visible" }}><defs><BoilFilter id="boil3" scale={3} /></defs>
            <g filter="url(#boil3)" opacity={1 - clamp((s - 15.7) / 0.25)}><Rough kind="line" args={[10, 50, 860, 70]} opts={{ stroke: INK, strokeWidth: 5, seed: 12 }} p={easeIn((s - 13.3) / 0.6)} /></g></svg>
        </div>}
        {s > 16 && <Signature at={T.end_in * fps} ink={INK} accent={ACC} y={760} width={width} url="0xdapa.github.io/escalatam-web-lab/01-webgl2-puro" filter="url(#boil)" />}
      </Ground></Breath>
    </AbsoluteFill>
  );
};
