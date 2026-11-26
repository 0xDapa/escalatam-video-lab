import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import T from "../timing/lua.json";
import { BoilFilter, DrawPath } from "../lib/ink";
import { clamp, easeIn, easeOut, smooth } from "../lib/motion";
import { Breath, Capture, Ground, MaskWords, Phone } from "../lib/ui";
import { Signature } from "../lib/end";

// Calm clinic: every spring at damping ratio 1.0, nothing bounces, no impacts. One pen, sage paper, wine accent.
const SAGE = "#e4e8df", INK = "#1d2420", WINE = "#7a2e3a";
const STEM = "M 300 1250 C 300 1050, 330 860, 300 640 C 285 520, 300 420, 330 330";
const LEAVES = [
  "M 302 1080 C 220 1040, 170 980, 160 900 C 240 920, 290 990, 302 1080 Z", "M 308 960 C 390 920, 440 860, 452 780 C 370 800, 320 870, 308 960 Z",
  "M 300 820 C 220 780, 180 710, 176 640 C 250 660, 292 730, 300 820 Z", "M 302 700 C 380 660, 420 600, 430 530 C 355 548, 312 615, 302 700 Z",
  "M 300 580 C 235 545, 205 485, 205 425 C 265 445, 296 505, 300 580 Z", "M 318 470 C 380 440, 410 390, 415 335 C 360 350, 325 400, 318 470 Z"];
const VEINS = ["M 302 1080 L 190 915", "M 308 960 L 430 795", "M 300 820 L 195 655", "M 302 700 L 415 545", "M 300 580 L 220 440", "M 318 470 L 405 350"];

export const LuaReel: React.FC = () => {
  const f = useCurrentFrame(); const { fps, width } = useVideoConfig(); const s = f / fps;
  const k = smooth((s - 3.4) / 1.0); // sprig moves aside for the phone
  const sway = Math.sin(s * 1.1) * 1.2;
  return (
    <AbsoluteFill>
      <Breath><Ground color={SAGE} grain={0.08} vignette={0.12}>
        <svg width={1080} height={1350} style={{ position: "absolute", inset: 0 }}>
          <defs><BoilFilter id="boil" scale={1.4} hold={4} /></defs>
          <g transform={`translate(${-130 * k} ${-80 * k}) scale(${1 - 0.25 * k}) rotate(${sway} 300 1250)`} filter="url(#boil)" opacity={(1 - 0.82 * k) * (s > 12.6 ? 1 - clamp((s - 12.6) / 0.5) : 1)}>
            <DrawPath d={STEM} p={easeIn(s / 1.6)} stroke={INK} w={4} />
            {LEAVES.map((d, i) => <DrawPath key={i} d={d} p={easeIn((s - 0.5 - i * 0.28) / 0.9)} stroke={i % 2 ? WINE : INK} w={3.5} />)}
            {VEINS.map((d, i) => <DrawPath key={i} d={d} p={easeIn((s - 1.0 - i * 0.28) / 0.6)} stroke={INK} w={2} opacity={0.6} />)}
          </g>
        </svg>
        {s < 4.2 && <div style={{ position: "absolute", left: 470, right: 60, top: 420 }}>
          <MaskWords text="Piel que se ve descansada," at={T.title * fps} out={T.title_out * fps} stagger={0.12} style={{ fontFamily: "NewsreaderI", fontWeight: 300, fontSize: 104, lineHeight: 1.02, color: INK, letterSpacing: "-0.02em" }} />
          <MaskWords text="no retocada." at={(T.title + 0.8) * fps} out={(T.title_out + 0.05) * fps} style={{ fontFamily: "NewsreaderI", fontWeight: 300, fontSize: 104, lineHeight: 1.05, color: WINE, letterSpacing: "-0.02em" }} />
          <div style={{ fontFamily: "Hanken", fontSize: 30, letterSpacing: "0.04em", marginTop: 34, color: INK, opacity: clamp((s - 2.0) / 0.6) * (1 - clamp((s - T.title_out) / 0.3)) }}>Lúa Clínica · Chamberí · demo</div>
        </div>}
        {s > 3.7 && s < 13 && <div style={{ position: "absolute", inset: 0, opacity: 1 - easeOut((s - T.phone_out) / 0.5) }}>
          <Phone x={760} y={690} w={500} at={T.phone_in * fps} ink={INK} filter="url(#boil)">
            <Capture demo="46-clinica-botanica" from={T.scroll[0] * fps} to={T.scroll[1] * fps} />
          </Phone>
          {T.notes.map((n, i) => { const t = s - n.t; if (t < 0) return null; const y = 300 + i * 290;
            return <div key={i} style={{ position: "absolute", left: 60, top: y, width: 400, color: INK }}>
              <div style={{ fontFamily: "Hanken", fontSize: 26, letterSpacing: "0.12em", color: WINE, opacity: clamp(t / 0.4) }}>{`0${i + 1}`}</div>
              <MaskWords text={n.text} at={n.t * fps + 6} stagger={0.1} style={{ fontFamily: "Newsreader", fontWeight: 400, fontSize: 56, lineHeight: 1.08, letterSpacing: "-0.015em", marginTop: 10 }} />
              <svg width={380} height={20} style={{ overflow: "visible", marginTop: 14 }}><DrawPath d="M 0 10 C 90 4, 220 16, 370 8" p={easeIn((t - 0.6) / 0.9)} stroke={WINE} w={2.5} filter="url(#boil)" /></svg>
            </div>; })}
        </div>}
        {s > T.end_in && <>
          <div style={{ position: "absolute", left: 90, right: 90, top: 250, textAlign: "center" }}>
            <MaskWords text="Webs para clínicas" at={T.end_in * fps} stagger={0.12} style={{ fontFamily: "Newsreader", fontSize: 92, lineHeight: 1.05, color: INK, justifyContent: "center", letterSpacing: "-0.02em" }} />
            <MaskWords text="que transmiten calma." at={(T.end_in + 0.6) * fps} stagger={0.12} style={{ fontFamily: "NewsreaderI", fontWeight: 300, fontSize: 92, lineHeight: 1.1, color: WINE, justifyContent: "center", letterSpacing: "-0.02em" }} />
          </div>
          <Signature at={(T.end_in + 1.4) * fps} ink={INK} accent={WINE} y={690} width={width} url="0xdapa.github.io/escalatam-web-lab/46-clinica-botanica" filter="url(#boil)" />
        </>}
      </Ground></Breath>
    </AbsoluteFill>
  );
};
