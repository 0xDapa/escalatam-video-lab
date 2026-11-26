import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
const F: [string, string, string?, string?][] = [
  ["Outfit", "Outfit.ttf", "100 900"], ["Fraunces", "Fraunces.ttf", "100 900"], ["FrauncesI", "Fraunces-Italic.ttf", "100 900"],
  ["Caveat", "Caveat.ttf", "400 700"], ["SpaceMono", "SpaceMono-Regular.ttf", "400"], ["SpaceMono", "SpaceMono-Bold.ttf", "700"],
  ["Bowlby", "bowlby-one-normal-400.woff2", "400"], ["Familjen", "familjen-grotesk-normal-400-700.woff2", "400 700"],
  ["Newsreader", "newsreader-normal-300-600.woff2", "300 600"], ["NewsreaderI", "newsreader-italic-300-600.woff2", "300 600"],
  ["Hanken", "hanken-grotesk-normal-300-600.woff2", "300 600"], ["Bodoni", "bodoni-moda-normal-400-700.woff2", "400 700"],
  ["BodoniI", "bodoni-moda-italic-400-700.woff2", "400 700"], ["Archivo", "archivo-normal-300-700.woff2", "300 700"],
  ["BrasaDisplay", "brasa-display.woff2", "400"], ["BrasaBody", "brasa-body.woff2", "400"],
];
let p: Promise<unknown> | null = null;
export const loadAll = () => (p ??= Promise.all(F.map(([family, file, weight]) => loadFont({ family, url: staticFile("fonts/" + file), weight }))));
