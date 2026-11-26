import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { DrawPath } from "./ink";
import { clamp, easeIn } from "./motion";
import { MaskWords } from "./ui";

/** Escalatam signature card: wordmark rises, a hand-drawn underline draws under it, URL types on in mono. */
export const Signature: React.FC<{ at: number; ink: string; accent: string; y: number; url: string; filter?: string; width: number; line?: string }> = ({ at, ink, accent, y, url, filter, width, line = "webs hechas a mano" }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = (f - at) / fps;
  const chars = Math.floor(clamp((t - 0.9) / 1.1) * url.length);
  return (
    <div style={{ position: "absolute", left: 0, width, top: y - Math.max(0, t) * 7, display: "flex", flexDirection: "column", alignItems: "center", color: ink }}>
      <MaskWords text="escalatam" at={at} style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 150, letterSpacing: "-0.045em", justifyContent: "center" }} />
      <svg width={520} height={46} style={{ overflow: "visible", marginTop: -6 }}>
        <DrawPath d="M10 26 C 120 8, 260 40, 380 18 S 500 22, 510 20" p={easeIn((t - 0.35) / 0.6)} stroke={accent} w={9} filter={filter} />
      </svg>
      <MaskWords text={line} at={at + 0.5 * fps / fps} style={{ fontFamily: "Caveat", fontWeight: 600, fontSize: 64, justifyContent: "center", marginTop: 4 }} />
      <div style={{ fontFamily: "SpaceMono", fontSize: 30, marginTop: 26, opacity: 0.85, letterSpacing: "-0.02em", height: 40 }}>{url.slice(0, chars)}<span style={{ opacity: t > 0.9 && Math.floor(f / 8) % 2 === 0 ? 1 : 0 }}>▍</span></div>
    </div>
  );
};
