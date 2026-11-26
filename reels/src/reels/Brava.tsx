import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import T from "../timing/brava.json";
import { BoilFilter } from "../lib/ink";
import { clamp, easeOut, springZ } from "../lib/motion";
import { Impact } from "../lib/sakuga";
import { Breath, Capture, Ground, MaskWords, Phone, Stamp } from "../lib/ui";
import { Signature } from "../lib/end";

// Sakuga energy: 150 BPM (beat = 12 frames), every word lands on a beat on a 0.5 spring, impacts with SFX lettering.
const GREEN = "#1d2b17", PAPER = "#fbeed0", MUST = "#ffc21a", RED = "#c92c15";
export const BravaReel: React.FC = () => {
  const f = useCurrentFrame(); const { fps, width } = useVideoConfig(); const s = f / fps;
  const shake = (at: number) => { const t = s - at; return t > 0 && t < 0.25 ? Math.sin(t * 90) * 14 * (1 - t / 0.25) : 0; }; // shake only on the impact
  const sh = shake(T.smash) + shake(T.cruje) + T.stamps.reduce((a, st) => a + shake(st.t) * 0.6, 0);
  return (
    <AbsoluteFill style={{ background: GREEN }}>
      <Breath><Ground color={GREEN} grain={0.14} vignette={0.4}>
        <div style={{ position: "absolute", inset: 0, transform: `translate(${sh}px, ${sh * 0.4}px)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs><BoilFilter id="boil" scale={3.5} hold={2} /></defs>
            <Impact at={T.pow * fps} x={540} y={1330} size={270} ink={GREEN} fill={PAPER} accent={MUST} sfx="¡CRUNCH!" seed={2} filter="url(#boil)" />
          </svg>
          {s < 2.7 && <>
            <Stamp at={T.smash * fps} style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", fontFamily: "Bowlby", fontSize: 205, color: MUST, lineHeight: 1, opacity: 1 - clamp((s - T.title_out) / 0.15) }} rot={-5}>SMASH</Stamp>
            <Stamp at={T.cruje * fps} style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: "Bowlby", fontSize: 150, color: PAPER, lineHeight: 1, opacity: 1 - clamp((s - T.title_out) / 0.15) }} rot={3}>QUE CRUJE</Stamp>
            <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: "Familjen", fontWeight: 700, fontSize: 38, color: PAPER, opacity: clamp((s - 1.4) / 0.2) * (1 - clamp((s - T.title_out) / 0.15)), letterSpacing: "0.02em" }}>Brava Smash Club · Guadalajara · demo</div>
          </>}
          {s > 2.3 && s < 10.6 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${easeOut((s - T.phone_out) / 0.4) * 1900}px)` }}>
            <Phone x={540} y={1000} w={600} at={T.phone_in * fps} ink={PAPER} filter="url(#boil)" tilt={-4}>
              <Capture demo="45-smash-burger" from={T.scroll[0] * fps} to={T.scroll[1] * fps} />
            </Phone>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {T.stamps.map((st, i) => <Impact key={i} at={st.t * fps} x={i % 2 ? 860 : 220} y={420 + i * 120} size={200} ink={GREEN} fill={PAPER} accent={i === 1 ? RED : MUST} sfx={st.sfx} seed={10 + i} filter="url(#boil)" />)}
            </svg>
            {T.stamps.map((st, i) => { const on = s >= st.t && s < st.t + 2.3;
              return on ? <Stamp key={i} at={st.t * fps} rot={i % 2 ? 4 : -4} style={{ position: "absolute", left: 90, right: 90, top: 1700, textAlign: "center" }}>
                <span style={{ display: "inline-block", background: i === 1 ? RED : MUST, color: i === 1 ? PAPER : GREEN, fontFamily: "Bowlby", fontSize: 64, padding: "14px 34px", border: `6px solid ${GREEN}`, boxShadow: `8px 8px 0 ${PAPER}` }}>{st.text}</span>
              </Stamp> : null; })}
          </div>}
          {s > T.end_in && <>
            <div style={{ position: "absolute", left: 70, right: 70, top: 420, textAlign: "center" }}>
              <MaskWords text="TU HAMBURGUESERÍA," at={T.end_in * fps} style={{ fontFamily: "Bowlby", fontSize: 80, color: PAPER, justifyContent: "center", lineHeight: 1.05 }} />
              <MaskWords text="CON ANTOJO INCLUIDO." at={(T.end_in + 0.4) * fps} style={{ fontFamily: "Bowlby", fontSize: 80, color: MUST, justifyContent: "center", lineHeight: 1.05 }} />
            </div>
            <Signature at={(T.end_in + 1.2) * fps} ink={PAPER} accent={MUST} y={900} width={width} url="0xdapa.github.io/escalatam-web-lab/45-smash-burger" filter="url(#boil)" />
          </>}
          {/* beat pulse: a mustard bar that ticks on every beat (energy from the grid, not from zooms) */}
          <div style={{ position: "absolute", left: 60, right: 60, bottom: 70, height: 10, display: "flex", gap: 10 }}>
            {Array.from({ length: 16 }, (_, i) => { const b = Math.floor(s / T.beat) % 16; const on = i === b; return <div key={i} style={{ flex: 1, background: on ? MUST : PAPER, opacity: on ? 1 : 0.18, transform: `scaleY(${on ? 1 + 0.8 * (1 - springZ((s % T.beat), 1, 30)) : 1})` }} />; })}
          </div>
        </div>
      </Ground></Breath>
    </AbsoluteFill>
  );
};
