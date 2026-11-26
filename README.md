# escalatam-video-lab

Videos hechos con código para vender webs: una película 3D de bordado (réplica del estilo de @flxrnc) y 5 reels de venta
para Instagram, X y Estados de WhatsApp. Todo en el navegador (three.js + Remotion), sonido sintetizado sin samples,
con QA de movimiento medido.

**Galería:** https://0xdapa.github.io/escalatam-video-lab/

| # | Video | Formato | Técnica |
|---|---|---|---|
| 01 | Puntada a puntada — 10 demos bordadas | 1080×1350, 31 s | three.js, bordado procedural, DOF, `renderAt(t)` + captura |
| 02 | Brasa Norte — restaurante | 1080×1920, 20 s | línea que se dibuja, líneas que hierven, impactos sakuga, scroll real |
| 03 | Escalatam — tu web, hecha a mano | 1080×1920, 24 s | rough.js boceto → web real, montaje en el beat |
| 04 | Lúa Clínica — estética | 1080×1350, 18 s | ramita botánica, todo con muelle 1.0 (calma) |
| 05 | Mirador del Faro — inmobiliaria | 1080×1350, 18 s | plano técnico que se traza, cota animada, día → noche |
| 06 | Brava Smash — hamburguesería | 1080×1920, 15 s | 150 BPM, sellos con muelle 0.5, SFX manga, temblor solo en el golpe |

## Documentos
- [METODO-VIDEOS.md](METODO-VIDEOS.md) — la ingeniería inversa: qué es el video de referencia, las 9 lecciones del playbook, cada técnica explicada.
- [SOP.md](SOP.md) — paso a paso para hacer el video de un cliente.
- [PROMPTS.md](PROMPTS.md) — prompts con números, listos para copiar.

## Estructura
```
embroidery/   película 3D (film.html + timing.json + render.py; three.js r187 vendorizado, MIT)
reels/        proyecto Remotion (src/lib = piezas reutilizables, src/reels = un archivo por reel, src/timing = relojes)
audio/        synth.py: marimba, pizzicato, percusión — leídos del mismo timing.json
tools/        capture_demos.py, render_reels.sh, finish.py (máster + export), motion_qa.py
docs/         galería GitHub Pages con los MP4 y sus contact sheets
fonts/        fuentes OFL (Outfit, Fraunces, Space Mono, Caveat)
```
Las capturas (`reels/public/caps/`, no versionadas, ~se regeneran con `tools/capture_demos.py`) salen de [escalatam-web-lab](https://github.com/0xDapa/escalatam-web-lab). Las marcas de los reels son las de las demos conceptuales (no son clientes reales).
Remotion es gratis para individuos y empresas de hasta 3 personas.
