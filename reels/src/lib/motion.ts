// Motion math. Every value is a closed-form function of the frame: no state between frames,
// so any frame can be rendered alone (Remotion renders frames out of order, in parallel).
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const outExpo = (t: number) => { t = clamp(t); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
export const inCubic = (t: number) => { t = clamp(t); return t * t * t; };
// cubic-bezier(0.16,1,0.3,1) approximated by outExpo-ish quart; exact bezier for entrances:
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  return (x: number) => { x = clamp(x); let t = x; for (let i = 0; i < 8; i++) { const d = 3 * ax * t * t + 2 * bx * t + cx; if (Math.abs(d) < 1e-6) break; t -= (sx(t) - x) / d; } return sy(clamp(t)); };
}
export const easeIn = bezier(0.16, 1, 0.3, 1);   // entrances
export const easeOut = bezier(0.7, 0, 0.84, 0);  // exits, 40-50% shorter than entrances
/** Damped spring step response. zeta = damping ratio (1.0 text/UI, 0.8 products, 0.5 characters), w = rad/s. */
export function springZ(tSec: number, zeta = 1, w = 14) {
  if (tSec <= 0) return 0;
  if (zeta >= 1) return 1 - (1 + w * tSec) * Math.exp(-w * tSec);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * tSec) * (Math.cos(wd * tSec) + (zeta * w / wd) * Math.sin(wd * tSec));
}
export function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
/** frames per beat = fps * 60 / bpm */
export const fpb = (fps: number, bpm: number) => (fps * 60) / bpm;
