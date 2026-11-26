import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import T from "../timing/mirador.json";
import { DrawPath } from "../lib/ink";
import { clamp, easeIn, easeOut, lerp, smooth } from "../lib/motion";
import { Breath, Capture, MaskWords, Phone } from "../lib/ui";
import { Signature } from "../lib/end";

// Blueprint: precise lines (no wobble: architecture is measured), dimension lines with ticks, day -> night.
const DAY = "#14213a", NIGHT = "#0b1220", LINE = "#e9eef2", AMBER = "#f2c36b", SEA = "#0f6f73";
const WALLS = ["M 120 260 L 960 260 L 960 900 L 120 900 Z", "M 520 260 L 520 600", "M 120 600 L 700 600", "M 700 600 L 700 900", "M 300 600 L 300 900"];
const DOORS = ["M 520 520 A 80 80 0 0 1 600 600", "M 300 820 A 80 80 0 0 0 380 900", "M 700 680 A 80 80 0 0 1 780 600"];
const WIN = [[160, 260, 320, 260], [600, 260, 900, 260], [960, 380, 960, 520]];
export const MiradorReel: React.FC = () => {
  const f = useCurrentFrame(); const { fps, width } = useVideoConfig(); const s = f / fps;
  const night = smooth((s - T.night[0]) / (T.night[1] - T.night[0]));
  const bg = interpolateColors(night, [0, 1], [DAY, NIGHT]);
  const k = smooth((s - 3.8) / 0.9);
  const k2 = smooth((s - 12.4) / 1.0); // plan returns for the night shot: the windows light up
  const planT = `translate(${lerp(-250 * k, 243, k2)} ${lerp(120 * k, 780, k2)}) scale(${lerp(1 - 0.45 * k, 0.55, k2)})`;
  const lights = night;
  return (
    <AbsoluteFill style={{ background: bg }}><Breath amp={4}>
      <svg width={1080} height={1350} style={{ position: "absolute", inset: 0 }}>
        <defs><pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={LINE} strokeOpacity={0.07} strokeWidth={1} /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={planT}>
          <rect x={120} y={260} width={840} height={640} fill={AMBER} opacity={lights * 0.13} />
          {WALLS.map((d, i) => <DrawPath key={i} d={d} p={easeIn((s - i * 0.3) / 0.8)} stroke={LINE} w={i === 0 ? 9 : 5} cap="butt" />)}
          {DOORS.map((d, i) => <DrawPath key={i} d={d} p={easeIn((s - 1.4 - i * 0.2) / 0.5)} stroke={LINE} w={2.5} opacity={0.8} />)}
          {WIN.map(([a, b, c, d], i) => <g key={i}><DrawPath d={`M ${a} ${b} L ${c} ${d}`} p={easeIn((s - 1.8 - i * 0.2) / 0.4)} stroke={interpolateColors(lights, [0, 1], [SEA, AMBER])} w={14} cap="butt" />
            <rect x={Math.min(a, c) - 6} y={Math.min(b, d) - 6} width={Math.abs(c - a) + 12} height={Math.abs(d - b) + 12} fill={AMBER} opacity={lights * 0.85} style={{ filter: "blur(6px)" }} /></g>)}
          {/* dimension line */}
          <g opacity={clamp((s - 2.2) / 0.3)}>
            <DrawPath d="M 120 980 L 960 980" p={easeIn((s - 2.2) / 0.6)} stroke={AMBER} w={2} />
            <path d="M 120 965 L 120 995 M 960 965 L 960 995" stroke={AMBER} strokeWidth={2} />
            <text x={540} y={1025} textAnchor="middle" fill={AMBER} fontFamily="Archivo" fontSize={30} letterSpacing="0.08em">{`${(8.4 * clamp((s - 2.2) / 0.6)).toFixed(2).replace(".", ",")} m`}</text>
          </g>
          {["SALÓN", "DORM. 1", "COCINA", "BAÑO", "DORM. 2"].map((r, i) => { const pos = [[320, 440], [740, 440], [210, 760], [500, 760], [830, 760]][i];
            return <text key={r} x={pos[0]} y={pos[1]} textAnchor="middle" fill={LINE} fontFamily="Archivo" fontSize={26} letterSpacing="0.14em" opacity={clamp((s - 2.6 - i * 0.12) / 0.3)}>{r}</text>; })}
        </g>
      </svg>
      {s < 4.4 && <div style={{ position: "absolute", left: 80, right: 80, top: 1080 }}>
        <MaskWords text="Doce viviendas," at={T.title * fps} out={T.title_out * fps} style={{ fontFamily: "Bodoni", fontSize: 96, lineHeight: 1, color: LINE }} />
        <MaskWords text="un horizonte." at={(T.title + 0.3) * fps} out={(T.title_out + 0.05) * fps} style={{ fontFamily: "BodoniI", fontSize: 96, lineHeight: 1.05, color: AMBER }} />
      </div>}
      {s > 4 && s < 13 && <div style={{ position: "absolute", inset: 0, transform: `translateX(${easeOut((s - T.phone_out) / 0.45) * 900}px)` }}>
        <Phone x={790} y={680} w={470} at={T.phone_in * fps} ink={LINE}>
          <Capture demo="47-residencial-costa" from={T.scroll[0] * fps} to={T.scroll[1] * fps} />
        </Phone>
        {T.notes.map((n, i) => { const t = s - n.t; if (t < -0.2) return null; const y = 780 + i * 170;
          return <div key={i} style={{ position: "absolute", left: 60, top: y, width: 480, color: LINE }}>
            <svg width={480} height={14} style={{ overflow: "visible" }}><DrawPath d="M 0 7 L 470 7" p={easeIn(t / 0.5)} stroke={AMBER} w={2} cap="butt" /><path d="M 0 0 L 0 14" stroke={AMBER} strokeWidth={2} opacity={clamp(t / 0.1)} /></svg>
            <MaskWords text={n.text} at={n.t * fps + 4} style={{ fontFamily: "Archivo", fontWeight: 600, fontSize: 46, marginTop: 10, letterSpacing: "-0.01em" }} />
            <div style={{ fontFamily: "Archivo", fontSize: 26, opacity: 0.7 * clamp((t - 0.4) / 0.3), letterSpacing: "0.06em", marginTop: 6 }}>{n.sub}</div>
          </div>; })}
      </div>}
      {s > T.end_in && <>
        <div style={{ position: "absolute", left: 80, right: 80, top: 120, textAlign: "center", color: LINE }}>
          <MaskWords text="De día y de noche," at={T.end_in * fps} style={{ fontFamily: "Bodoni", fontSize: 80, justifyContent: "center", lineHeight: 1.05 }} />
          <MaskWords text="tu proyecto se vende solo." at={(T.end_in + 0.4) * fps} style={{ fontFamily: "BodoniI", fontSize: 78, justifyContent: "center", lineHeight: 1.08, color: AMBER }} />
        </div>
        <Signature at={(T.end_in + 1.2) * fps} ink={LINE} accent={AMBER} y={470} width={width} url="0xdapa.github.io/escalatam-web-lab/47-residencial-costa" />
      </>}
    </Breath></AbsoluteFill>
  );
};
