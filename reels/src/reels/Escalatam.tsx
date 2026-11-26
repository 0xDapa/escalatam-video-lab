import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import T from "../timing/escalatam.json";
import { BoilFilter, DrawPath, Rough } from "../lib/ink";
import { clamp, easeIn, easeOut, outExpo } from "../lib/motion";
import { Impact } from "../lib/sakuga";
import { Breath, Ground, MaskWords } from "../lib/ui";
import { Signature } from "../lib/end";

const PAPER = "#f5f0e6", INK = "#1c1c1c", ACC = "#e4572e";
const FX = 190, FY = 520, FW = 700, FH = 1160; // the sketched browser/phone window

export const EscalatamReel: React.FC = () => {
  const f = useCurrentFrame(); const { fps, width } = useVideoConfig(); const s = f / fps;
  const sk = (a: number, d = 0.6) => easeIn((s - a) / d);
  // montage index on the beat grid
  const mi = Math.floor((s - T.montage[0]) / T.beat);
  const inMont = s >= T.montage[0] && s < T.montage[1];
  const hero = s >= T.montage[1] ? T.heroes[T.heroes.length - 1] : inMont ? T.heroes[Math.min(T.heroes.length - 1, mi)] : T.heroes[0];
  const wipe = outExpo((s - T.fill) / 0.9); // sketch -> real: circle grows from the pen point
  const winOut = easeOut((s - T.montage[1]) / 0.5);
  const beatPunch = inMont ? 1 + 0.025 * Math.exp(-((s - T.montage[0]) % T.beat) * 14) : 1; // 1-frame kick on every cut
  return (
    <AbsoluteFill>
      <Breath><Ground color={PAPER} grain={0.1} vignette={0.18}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><defs><BoilFilter id="boil" scale={2.6} /><BoilFilter id="boilS" scale={1.6} /></defs></svg>
        {/* the window */}
        {s < T.montage[1] + 0.6 && <div style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, transform: `translateY(${winOut * 1500}px) rotate(${winOut * 8}deg) scale(${beatPunch})` }}>
          <div style={{ position: "absolute", left: 14, top: 86, right: 14, bottom: 14, overflow: "hidden", clipPath: `circle(${wipe * 140}% at 18% 30%)`, borderRadius: 10 }}>
            <Img src={staticFile(`caps/heroes/${hero[0]}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
          <svg width={FW + 60} height={FH + 60} style={{ position: "absolute", left: -30, top: -30, overflow: "visible" }}>
            <g transform="translate(30 30)">
              <Rough kind="rect" args={[0, 0, FW, FH]} opts={{ stroke: INK, strokeWidth: 5, seed: 3 }} p={sk(T.sketch[0], 0.9)} filter="url(#boil)" />
              <Rough kind="line" args={[0, 72, FW, 72]} opts={{ stroke: INK, strokeWidth: 4, seed: 5 }} p={sk(0.7, 0.3)} filter="url(#boil)" />
              {[0, 1, 2].map((i) => <Rough key={i} kind="circle" args={[40 + i * 44, 36, 24]} opts={{ stroke: INK, strokeWidth: 3.5, seed: 8 + i, fill: i === 0 ? ACC : undefined, fillStyle: "solid" }} p={sk(0.9 + i * 0.1, 0.25)} filter="url(#boil)" />)}
              {/* wireframe of a hero section, erased by the real screenshot */}
              <g opacity={1 - clamp((s - T.fill) / 0.8)}>
                <Rough kind="rect" args={[50, 140, FW - 100, 380]} opts={{ stroke: INK, strokeWidth: 3, seed: 21, hachureGap: 18, fill: "rgba(28,28,28,.5)", fillStyle: "hachure" }} p={sk(1.1, 0.8)} filter="url(#boilS)" />
                {[0, 1, 2].map((i) => <Rough key={i} kind="line" args={[50, 600 + i * 56, FW - 120 - i * 120, 600 + i * 56]} opts={{ stroke: INK, strokeWidth: 9, seed: 30 + i }} p={sk(1.5 + i * 0.15, 0.3)} filter="url(#boilS)" />)}
                <Rough kind="rect" args={[50, 820, 260, 90]} opts={{ stroke: ACC, strokeWidth: 4, seed: 40, fill: ACC, fillStyle: "zigzag", hachureGap: 10 }} p={sk(2.0, 0.4)} filter="url(#boilS)" />
              </g>
            </g>
          </svg>
          {inMont && <div style={{ position: "absolute", left: 0, right: 0, top: FH + 30, display: "flex", justifyContent: "space-between", alignItems: "baseline", color: INK }}>
            <span style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 84 }}>{hero[1]}</span>
            <span style={{ fontFamily: "SpaceMono", fontSize: 30 }}>{hero[0]} / 52</span></div>}
        </div>}
        {/* the line */}
        {s < 6.2 && <div style={{ position: "absolute", left: 80, right: 80, top: 150 }}>
          <MaskWords text="Tu web," at={T.l1 * fps} out={T.text_out * fps} style={{ fontFamily: "Fraunces", fontWeight: 400, fontSize: 170, lineHeight: 1, letterSpacing: "-0.035em", color: INK }} />
          <MaskWords text="hecha a mano." at={T.l2 * fps} out={(T.text_out + 0.05) * fps} style={{ fontFamily: "FrauncesI", fontWeight: 400, fontSize: 150, lineHeight: 1.05, letterSpacing: "-0.03em", color: ACC }} />
        </div>}
        {s > T.montage[0] - 0.2 && s < T.montage[0] + 1.2 && <div style={{ position: "absolute", left: 80, top: 210 }}>
          <MaskWords text="Para tu negocio." at={(T.montage[0] - 0.1) * fps} out={(T.montage[0] + 0.9) * fps} style={{ fontFamily: "Fraunces", fontSize: 110, letterSpacing: "-0.03em", color: INK }} /></div>}
        {/* checks */}
        {s > 13 && s < T.checks_out + 0.8 && <div style={{ position: "absolute", left: 90, top: 640, width: 900 }}>
          {T.checks.map((c, i) => { const t = s - c.t; const o = easeOut((s - T.checks_out - i * 0.06) / 0.35);
            return <div key={i} style={{ display: "flex", alignItems: "center", gap: 40, height: 220, transform: `translateX(${o * -1200}px)` }}>
              <svg width={130} height={130} style={{ overflow: "visible", flex: "none" }}>
                <Rough kind="rect" args={[8, 8, 110, 110]} opts={{ stroke: INK, strokeWidth: 5, seed: 50 + i }} p={easeIn(t / 0.35)} filter="url(#boil)" />
                <DrawPath d="M 22 66 L 55 100 L 125 6" p={easeIn((t - 0.3) / 0.25)} stroke={ACC} w={13} filter="url(#boil)" />
                <Impact at={(c.t + 0.5) * fps} x={20} y={110} size={60} ink={INK} fill={PAPER} accent={ACC} seed={i + 9} filter="url(#boil)" />
              </svg>
              <MaskWords text={c.text} at={(c.t + 0.1) * fps} style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: 62, lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }} />
            </div>; })}
        </div>}
        {/* end */}
        {s > T.end_title - 0.1 && <div style={{ position: "absolute", left: 80, right: 80, top: 360 }}>
          <MaskWords text="52 demos." at={T.end_title * fps} style={{ fontFamily: "Fraunces", fontSize: 210, letterSpacing: "-0.045em", lineHeight: 1, color: INK }} />
          <MaskWords text="Una es la tuya." at={(T.end_title + 0.45) * fps} style={{ fontFamily: "FrauncesI", fontSize: 130, letterSpacing: "-0.03em", lineHeight: 1.1, color: ACC }} />
          <svg width={900} height={180} style={{ overflow: "visible", position: "absolute", left: -30, top: 250 }}>
            <Rough kind="path" args="M 40 150 C 250 120, 520 175, 840 135" opts={{ stroke: INK, strokeWidth: 6, seed: 61, roughness: 1.4 }} p={easeIn((s - T.end_title - 0.8) / 0.5)} filter="url(#boil)" /></svg>
        </div>}
        {s > T.end_sig && <Signature at={T.end_sig * fps} ink={INK} accent={ACC} y={1080} width={width} url="0xdapa.github.io/escalatam-web-lab" filter="url(#boil)" line="webs hechas a mano, para personas" />}
      </Ground></Breath>
    </AbsoluteFill>
  );
};
