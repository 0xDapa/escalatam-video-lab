# Método de videos Escalatam — ingeniería inversa de @flxrnc

> Fuente: el post de @flxrnc (x.com/flxrnc/status/2125681086722097551, 36 s, 1440×1800, 60 fps) y su X Article
> *"The Fable 5.2 Motion Playbook: One Prompt, One Film"* (9 lecciones, 40 películas). Los 15 repos del post se
> clonaron en una carpeta de investigación **ignorada por git** (`research/`); aquí solo hay explicación y código propio.

## 0. Qué es de verdad el video de referencia

No es animación 2D de línea. Es **un solo plano 3D fotorrealista, macro, de bordado sobre lino**:

| Rasgo | Medida en el video | Cómo lo replicamos |
|---|---|---|
| Formato | 4:5 vertical, 1440×1800, 60 fps, 35,97 s | 1080×1350, 30 fps, 31 s (`embroidery/timing.json`) |
| Cámara | un travelling continuo, cenital inclinado (~55°), lente larga, DOF muy corto | `PerspectiveCamera` fov 30°, elevación 56°, distancia 2,45 u, `BokehPass` con foco = distancia real a la aguja en cada frame |
| Ritmo | ~1,5–2 s por parche, ease-in/out en cada parada, sin cortes | 10 paradas cada 2,0 s (= 4 beats a 120 BPM): 0,9 s quieto + 1,1 s de viaje con *smootherstep* |
| Héroe | aguja metálica que arrastra hilo negro de parche en parche | aguja de acero (metalness 1, roughness 0,12) + hilo `TubeGeometry` que es **la historia de la aguja**: se muestrea `needleAt(t)` de 0 a t |
| Parches | logos/UI bordados en satén, nombre grande azul marino bordado, etiqueta de tela con borde de puntada roja + URL en mono roja, alfiler | texturas procedurales Canvas2D (color + bump): `stitch()` y `runStitch()` |
| Utilería | carretes de madera, alfileres, alfiletero, tijeras doradas, botones | carretes (cilindros + textura rayada), botones, alfiletero, alfileres, todos con sombra |
| Luz | sol cálido bajo desde una ventana, sombras moteadas de hojas | `SpotLight` 3200 K aprox. (#ffcf98) con `light.map` = *gobo* de hojas/ventana, `PCFSoftShadowMap`, ACES |
| Final | tirón hacia arriba: los 15 parches en círculo, hilo amarillo brillante serpenteando; corte a tarjeta 2D "15 repos. Stitch by stitch." | cámara sube a (0, 4,3, 7,0), fov 30→42, tubo emisivo amarillo que se dibuja con `setDrawRange`; tarjeta "52 webs. Puntada a puntada." en DOM sobre lino |
| Audio | pizzicato + marimba + percusión ligera, sin voz | sintetizado en código (`audio/synth.py`): Karplus-Strong + marimba modal, 0 samples |

Probablemente se hizo en Blender/C4D. Nosotros lo hacemos **100 % en código en el navegador** (Three.js r187) y se
renderiza frame a frame con Chromium headless: sin GPU, sin After Effects, sin licencias.

## 1. Las 9 lecciones del playbook, traducidas a nuestro flujo

1. **Esfuerzo alto, no máximo.** Para el agente: planificar en medio, construir en alto. Max piensa más y no rinde más.
2. **Números en vez de adjetivos.** "premium" no se puede leer; `roughness 0.38` sí.
   | adjetivo | número |
   |---|---|
   | premium | roughness 0.38, clearcoat 0.35 |
   | cálido | key 3200 K, rim 7500 K |
   | moderno | 35 mm, f/2.8, corte en el beat |
   | suave | `cubic-bezier(0.16, 1, 0.3, 1)` |
   | con rebote | spring, damping ratio 0.5, 2 rebotes |
   | cortes rápidos | frames por beat = fps × 60 / BPM |
3. **Muelles (springs): un número decide el aterrizaje.** `ratio = c / (2·√(k·m))`.
   - **1.0** sin rebote → texto, UI, todo lo que se lee (todas las palabras de nuestros reels).
   - **0.8** un rebote pequeño → productos, tarjetas, logos (los teléfonos de los reels).
   - **0.5** dos rebotes → personajes, mascotas, comedia (los sellos "PIDE POR WHATSAPP", el SFX ¡ZAS!).
   - Siempre **forma cerrada en t** (`springZ(t, zeta, w)` en `reels/src/lib/motion.ts`): un muelle que integra velocidad frame a frame da otro resultado si el renderizador salta al frame 300. Remotion renderiza en paralelo y desordenado: la forma cerrada es obligatoria.
   - Otros números: entrada `cubic-bezier(0.16,1,0.3,1)`; salida `cubic-bezier(0.7,0,0.84,0)` y 40–50 % más corta; pop `cubic-bezier(0.34,1.56,0.64,1)`; UI 100–200 ms; revelado de héroe 600–900 ms; stagger letras 1 frame, palabras 60–120 ms (usamos 90 ms), listas 40–80 ms (usamos 70 ms); squash 1.2×0.75 → 0.85×1.28 → 1.25×0.75.
4. **Motion QA: las fotos mienten, mide el movimiento.** Cinco revisiones aprobaron una película con 100 s congelados. Por eso nuestro `tools/motion_qa.py` corre `freezedetect=n=-60dB:d=0.5`, grafica el cambio por frame y falla ante cualquier congelado no declarado. **Nos pasó**: la primera pasada de los 5 reels tenía 3–7 tramos congelados cada uno (finales de tarjeta, esperas de texto). Se arreglaron con diseño (teléfono que flota, tarjetas que derivan, "respiración" de cámara de 4–5 px), no apagando el detector.
5. **Primero el tiempo, y define "terminado".** El archivo de tiempos es el reloj maestro y es el archivo nº 1 (`embroidery/timing.json`, `reels/src/timing/*.json`). La imagen **y** el sonido leen el mismo archivo; cada golpe de sonido cae **1 frame después** de su evento visual (el ojo ve, el oído confirma). "Terminado" = el MP4 renderiza y cada check de QA pasa con su número.
6. **Pocas reglas, mejores.** Nada de MAYÚSCULAS y "NUNCA". Una frase de propiedad ("esta pieza es tuya...") y la lista exacta de lo que está aprobado sin preguntar.
7. **Blender por script** (`blender -b --factory-startup -P script.py`) para mascotas/props, exportar GLB a three.js. No lo usamos aún (no hay GPU en la caja); queda como vía para piezas de cliente.
8. **Equipos de agentes**: quien revisa no construye. Límites como números ("máximo 2 renders a la vez" — así lo hicimos: 2 procesos de captura en paralelo).
9. **Coste**: iterar en fotos fijas (segundos), renderizar completo solo al final (minutos). Una ronda de notas sobre fotos antes del primer render completo.

## 2. El contrato `renderAt(t)` (película A)

```js
window.renderAt = (t) => {         // dibuja exactamente el tiempo t, en segundos
  updateEverythingFrom(t);         // sin relojes, sin Math.random, sin estado acumulado
  composer.render();
};
window.__ready = true;             // solo después de fuentes y texturas
```
`embroidery/render.py` abre la página con `?render=1`, llama `renderAt(i/30)` para i = 0…N-1 (**nunca el frame N**, que es el 0 otra vez en un loop), hace screenshot JPEG y lo pasa por tubería a ffmpeg. La grabación de pantalla pierde frames; esto no. En la caja (sin GPU, SwiftShader) cuesta ~1,3 s por frame a 1080×1350 con DOF: 930 frames ≈ 12 min en 2 procesos.

## 3. Técnicas, una por una

### 3.1 Bordado procedural (Canvas2D → textura three.js)
- **Satén** (`stitch()`): se rota el canvas al ángulo de la puntada, se recorren filas cada `gap` px y se trazan segmentos de 20–34 px con desfase de ladrillo entre filas. Cada segmento son 3 trazos: borde oscuro (0,62×), cuerpo (1,0×), brillo fino (1,22×) desplazado 0,5–1 px → el hilo "brilla". Una variación ±8 % por puntada evita el aspecto de patrón.
- El mismo trazado se pinta en un **canvas de altura** (gris 120 + cresta 235) que va a `bumpMap`: la luz rasante hace el relieve.
- Máscara con `globalCompositeOperation = 'destination-in'` (forma o texto). Sombra de contacto: la máscara desenfocada 3 px, desplazada (1,5, 3) px, 38 % de opacidad.
- **Velocidad**: se calcula el *bounding box* de la máscara a 1/4 de resolución y solo se cosen esas filas → la preparación bajó de ~180 s a ~39 s.
- Texto bordado: el nombre se cose con satén casi vertical (ángulo 1,42 rad), `gap 6.2`, hilo de 6,8 px, como el "Remotion" del original.
- **Lino**: tejido plano: primero las filas de trama con degradado (sombra-luz-sombra), después la urdimbre pasando por encima en celdas alternas (`(i+j)%2`). Repetido ×16, `anisotropy 16`.
- **Etiqueta**: tela con trama fina + texto impreso + puntada corrida roja (`setLineDash([18,10])`), en una caja de 6 mm de grosor que proyecta sombra, clavada con alfiler.

### 3.2 Línea de tinta + `stroke-dasharray` (dibujo que se dibuja solo)
`strokeDasharray = L`, `strokeDashoffset = L·(1-p)` con `L = getLength(d)` (`@remotion/paths`). `p` sale de `easeIn((t - t0)/dur)`. Varios trazos con 0,28–0,35 s de solape (la llama, la ramita, el plano). Componente `DrawPath` en `reels/src/lib/ink.tsx`.

### 3.3 rough.js (bocetos a mano)
`rough.generator()` → `toPaths()` da SVG `d` con **semilla fija** (`seed`), así cada frame dibuja el mismo boceto. Combinado con `DrawPath` cada sub-trazo se dibuja en orden. Usado para la ventana del navegador, el teléfono, las casillas ✓, rayados `hachure`/`zigzag`.

### 3.4 Líneas que hierven (*boiling lines*)
Animación a mano en "dos" o "tres": el dibujo se re-traza cada 2–3 frames. En código: filtro SVG `feTurbulence` + `feDisplacementMap` (escala 1,4–3,5 px) cuyo `seed = floor(frame / hold)`. hold 3 a 30 fps = 10 fps de hervor (calma: hold 4 y escala 1,4; hamburguesa: hold 2 y escala 3,5). `BoilFilter` en `ink.tsx`. La librería line-art-animation usa la misma idea (turbulencia 0,6, desplazamiento 0,45) pero estática; nosotros cambiamos la semilla para que hierva.

### 3.5 Sakuga: humo e impactos
Patrón de Sakuga VFX, re-escrito en forma cerrada (`reels/src/lib/sakuga.tsx`):
1. **frame 0**: disco invertido de 1 frame (flash), 50 % el frame 1;
2. **cuñas de velocidad**: 11 triángulos que salen con `outExpo` en 0,35 s y se afinan;
3. **bocanadas de humo**: 7 grupos de 2 círculos relleno papel + trazo tinta 5 px que salen, suben y encogen en 0,7–1,1 s;
4. **rotulación SFX** (¡ZAS!, ¡PUM!, ¡ÑAM!, ¡CRUNCH!) que aterriza con muelle **0,5**;
5. **temblor de cámara solo en el impacto** (0,25 s, 14 px, decae lineal) — la regla del artículo: "comedia y catástrofe en un plano fijo; temblor solo en el golpe".

### 3.6 Captura determinista de demos reales
`tools/capture_demos.py`: viewport móvil 390×844 @2x, `scrollY = smootherstep(i/(N-1)) · objetivo`, una captura por frame → secuencia de imágenes que Remotion muestra con `<Img>` según el frame. Así el scroll de la demo real va **sincronizado al timing** y nunca pierde frames.

### 3.7 Remotion vs Motion Canvas vs HyperFrames (vs `renderAt` propio)
| | Remotion | Motion Canvas | HyperFrames | HTML + `renderAt` |
|---|---|---|---|---|
| Modelo | React: cada frame = función de `useCurrentFrame()` | generadores TS (`yield* all(...)`), editor con línea de tiempo | HTML/CSS/JS + animaciones "seekables" → MP4 determinista (Apache 2.0), hecho para agentes | una página con `renderAt(t)` y captura propia |
| Fuerte en | plantillas por cliente (props), texto, capturas, render paralelo, Lambda | explicadores tipo Manim, timing en código | agentes que editan HTML; bloques/plantillas; GSAP | 3D pesado (three.js), control total del render |
| Licencia | gratis hasta 3 personas por empresa; equipos mayores pagan | MIT | Apache 2.0 (Studio con plan Pro) | — |
| Lo usamos para | reels 02–06 | (no; documentado) | (no; documentado) | película A (bordado 3D) |
Regla: **reels de venta con plantillas = Remotion; una pieza 3D tipo "obra" = `renderAt` + three.js**. Para 3D dentro de Remotion existe `@remotion/three` (react-three-fiber), útil si se quiere mezclar 3D con plantillas.

### 3.8 Sonido sin samples
`audio/synth.py`: marimba modal (parciales 1, 3,93, 9,24 con decaimientos 0,45/0,08/0,025 s), pizzicato Karplus-Strong, bombo con barrido de frecuencia, ruido filtrado (shaker), campana FM, reverb con 5 filtros peine, saturación tanh suave en el master. La base (bajo + marimba + percusión) cae en la rejilla de beats; los golpes vienen del JSON de tiempos.

### 3.9 Exportación para IG / X / WhatsApp (FFmpeg)
```
-c:v libx264 -profile:v high -preset slow -crf 19 -maxrate 14M -bufsize 28M
-vf "scale=out_range=tv,format=yuv420p" -color_range tv -r 30
-c:a aac -b:a 192k -ar 48000 -movflags +faststart
```
- **yuv420p rango TV** (las capturas JPEG salen en `yuvj420p` rango completo: hay que convertir, si no algunos reproductores lavan los negros).
- **Loudness −14 LUFS y pico real ≤ −2 dBTP medido DESPUÉS del AAC** (el AAC sube el pico). `tools/finish.py` codifica, mide con `ebur128=peak=true`, corrige ganancia/limitador y repite (≤ 4 iteraciones).
- IG Reels / WhatsApp Estados: 1080×1920 (9:16); feed IG / X: 1080×1350 (4:5). WhatsApp recomprime: mantener < 16 MB para estados → nuestros reels pesan 3–9 MB. La película A pesa ~37 MB (X y IG la aceptan; para WhatsApp exportar con `-crf 26`).
- Loops: renderizar frames 0…N-1, nunca N.

### 3.10 Motion QA (cómo medimos)
`tools/motion_qa.py video.mp4 [--allow a-b]`: ffprobe (códec, perfil, pix_fmt, fps, duración, faststart), `freezedetect -60 dB 0,5 s`, cambio medio por frame (gris a 1/4) → `_motion.png`, contact sheet 1 fps → `_contact.png`, loudness/pico del archivo final → `_qa.json`. Un congelado no declarado = bug.

## 4. Anti-AI-slop aplicado a video (de `escalatam-web-lab/ANTI-AI-SLOP.md`)
- 5 decisiones escritas antes: tipografía, color, layout, densidad, tono — **por reel** (ver `SOP.md`). Cada reel usa la tipografía y la paleta de su demo (Bowlby One + mostaza en la hamburguesería, Newsreader + salvia/vino en la clínica, Bodoni + marino/ámbar en la inmobiliaria).
- Prohibido: orbes de brillo, degradados morados, *fade-in* en todo, zooms para fingir energía, contadores animados, estadísticas o testimonios inventados (solo afirmaciones verificables: "carga en menos de 3 s" se apoya en Lighthouse > 90 de las demos).
- Una sola técnica de entrada no basta: mezclamos máscara de línea base, sello con muelle 0,5, trazo que se dibuja, tipeo mono.
- Solo aparece en pantalla el texto que está en el JSON de tiempos.
