# SOP — cómo hacemos un video Escalatam (de cero a MP4 publicable)

Tiempo real medido en la caja (8 CPU, sin GPU): reel Remotion 15–24 s ≈ 1–2 min de render; película 3D 31 s ≈ 12 min (2 procesos).

## 1. Brief en números (10 min)
Escribe estas 10 líneas antes de tocar código (plantilla en `PROMPTS.md`):
SUJETO · TIEMPO (s, fps, BPM, frames por beat = fps×60/BPM) · PALETA (hex exactos, 1 acento) · TIPO (familia, peso, px, tracking) · PLANOS (qué se mueve de qué frame a qué frame) · EASING (curva) · MUELLES (damping ratio por tipo de objeto) · PAUSAS (0,3 s por palabra + 0,5 s) · PROHIBIDO · QA.
Las 5 decisiones anti-slop van dentro: tipografía, color, layout, densidad, tono. Usa la tipografía y la paleta de la demo del cliente (están en `escalatam-web-lab/<demo>/DESIGN.md`).

## 2. El reloj primero (5 min)
Crea `reels/src/timing/<cliente>.json`: escenas, cada aparición, cada golpe de sonido (`hits`). Todo lo demás lee de aquí. Nada se cronometra a mano.

## 3. Capturar la demo real (3 min)
```
python3 -m http.server 8766 --bind 127.0.0.1   # dentro de escalatam-web-lab
python3 tools/capture_demos.py scroll 46-clinica-botanica 150 5
python3 tools/capture_demos.py heroes 01-webgl2-puro,24-dental-premium
```
Con un cliente real: usa SUS fotos y SU web (o la demo adaptada a su marca).

## 4. Componer (Remotion)
Copia el reel más parecido de `reels/src/reels/` (Brasa = oscuro/brasa, Lua = calma, Mirador = plano técnico, Brava = sakuga/energía, Escalatam = boceto→real). Piezas en `reels/src/lib/`: `DrawPath`, `Rough`, `BoilFilter`, `Impact`, `Phone`, `Capture`, `MaskWords`, `Stamp`, `Breath`, `Signature`. Regístralo en `Root.tsx`.

## 5. Una ronda de notas sobre fotos fijas (antes de renderizar)
```
cd reels && npx remotion still <Id> /tmp/s_120.jpg --frame=120
```
Saca 6 fotos (inicio, cada escena, final). Revisa: texto cortado en el borde, superposiciones, héroe demasiado pequeño, cosas que se tapan. Arregla aquí: cuesta segundos.

## 6. Render en segundo plano con log
```
nohup tools/render_reels.sh <Id> > /tmp/render.log 2>&1 &
# película 3D: 2 procesos, cada uno su tramo de frames
python3 embroidery/render.py "http://127.0.0.1:8765/embroidery/film.html?render=1" parts/a1.mp4 0 465 &
```

## 7. Sonido + máster + exportación
```
python3 tools/finish.py parts/<Id>_silent.mp4 reels/src/timing/<cliente>.json reel <brasa|calm|blue|punch|paper> renders/<nombre>.mp4
```
Sonido sintetizado del mismo JSON, −14 LUFS / ≤ −2 dBTP medidos en el AAC final, H.264 High yuv420p, faststart.

## 8. Motion QA (obligatorio, con números)
```
python3 tools/motion_qa.py renders/<nombre>.mp4 [--allow 30.4-31.0]
```
Pasa si: `unplanned_freezes == []`, `pix_fmt == yuv420p`, `faststart == true`, loudness entre −15 y −13,5 LUFS, pico ≤ −2 dBTP, tamaño < 16 MB para WhatsApp (< 50 MB para el repo). Mira el `_contact.png` y **dale play tú** con sonido.

## 9. Entregar
- IG Reels / Estados de WhatsApp / TikTok: 1080×1920. Feed IG / X: 1080×1350.
- Al cliente: el video con SU demo, nunca "hecho con IA". Primero se le muestra a David.
