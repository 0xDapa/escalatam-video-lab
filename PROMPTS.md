# Prompts para videos (copiar, cambiar los sustantivos, mantener los números)

## 1. Brief maestro de un reel de demo (10 piedras)
```
Haz un reel Remotion de 18 s para <NEGOCIO> (<nicho>, <ciudad>), 1080x1350, 30 fps = 540 frames.
SUJETO   una idea: "la web de <NEGOCIO> se ve en un teléfono dibujado a mano y su función estrella se señala".
TIEMPO   96 BPM, frames por beat = 30*60/96 = 18,75. Escenas: 0-3,8 apertura; 3,8-12,4 teléfono con scroll real; 12,4-18 cierre.
PALETA   fondo <#hex>, tinta <#hex>, un acento <#hex> (de su DESIGN.md). Nada más.
TIPO     titulares <familia> <peso> <px> tracking <-0.02em>; notas <familia> <px>; URL Space Mono 30 px.
PLANOS   apertura: <dibujo de línea del nicho> se traza en 1,6 s (stroke-dasharray), titular sube palabra a palabra (90 ms).
         3,8 s: teléfono rough.js (seed 4) entra con muelle 0,8; captura caps/<demo>/ de 4,4 a 12,2 s.
         5,4 / 7,8 / 10,2 s: tres notas: <función 1>, <función 2>, <función 3>.
EASING   entradas cubic-bezier(0.16,1,0.3,1); salidas cubic-bezier(0.7,0,0.84,0), 40 % más cortas.
MUELLES  texto 1.0, teléfono 0.8, sellos 0.5. Forma cerrada en t, sin estado entre frames.
PAUSAS   cada frase queda legible 0,3 s por palabra + 0,5 s.
PROHIBIDO orbes de brillo, degradados morados, fade-in en todo, zooms, contadores, estadísticas o testimonios inventados, emojis.
QA       fotos en 1,5 / 6 / 9 / 12,5 / 16 s; freezedetect sin congelados no pedidos; texto nunca cortado en el borde.
Solo aparece en pantalla el texto de este brief. Terminado = MP4 renderizado y cada check con su número.
```

## 2. Película 3D estilo bordado ("puntada a puntada")
```
Haz film.html: un solo archivo, three.js, 1080x1350, 30 fps, 31 s = 930 frames, renderAt(t) puro en t, __ready tras fuentes y texturas.
SUJETO   una aguja de acero arrastra hilo negro de parche en parche sobre lino; cada parche es <una web>, bordado en satén.
TIEMPO   120 BPM, beat 15 frames. Parada i llega en 0,5 + 2,0·i s, se queda 0,9 s, la aguja da 2 puntadas (0,15 y 0,6 s tras llegar).
CÁMARA   fov 30, elevación 56°, a 2,45 u del parche, travelling sin cortes con smootherstep; respiración 3 cm; foco = distancia real a la aguja.
LUZ      spot cálido #ffcf98 con gobo de hojas y ventana, sombras suaves; ACES; hemisférica 0,32.
PARCHE   tarjeta satén 1,0 u con borde crema, icono cosido (hilo 6,2 px, filas 5,6 px, puntadas 20-34 px, brillo de 3 trazos), nombre en Outfit 800 cosido a 1,42 rad; etiqueta de tela con puntada roja y URL en Space Mono roja, clavada con alfiler.
FINAL    19,4-22,6 s la cámara sube y revela el anillo de parches; 21,6-23,9 s hilo amarillo emisivo serpentea; 25 s corte a tarjeta "52 webs. Puntada a puntada." con lista 01-10 (stagger 70 ms).
PROHIBIDO zooms durante el travelling, texto extra, logos, purpurina.
QA       fotos 0,6 / 3 / 9,4 / 21,5 / 24,5 / 28,5 s; héroe (parche) ≥ 60 % del ancho en cada parada; freezedetect limpio.
```

## 3. Reel de agencia ("tu web, hecha a mano")
```
Reel 1080x1920, 24 s, papel #f5f0e6, tinta #1c1c1c, acento #e4572e. Una ventana de navegador rough.js se boceta (0-2,2 s), el boceto se convierte en la web real con un círculo que crece desde la punta del lápiz (3,2 s), montaje de 14 demos cortando en cada beat (0,5 s, 120 BPM) con el nicho escrito a mano en Caveat, 3 casillas que se tachan con impacto sakuga, cierre "52 demos. Una es la tuya." + firma escalatam.
Líneas que hierven: feTurbulence seed = floor(frame/3), escala 2,6.
```

## 4. Notas de seguimiento que más arreglan (pegar tal cual)
- "El héroe es un punto: mide su ancho por plano y reporta los números; mínimo 60 % del ancho."
- "Hay gráficos congelados: corre freezedetect en un borrador a 30 fps y arregla cada congelado que no pedí."
- "El sonido va antes o después: cada golpe se lee de timing.json y cae 1 frame después de su evento visual."
- "Texto cortado en el borde: cada palabra está entera dentro del cuadro o entera fuera."
- "Agregó etiquetas que no pedí: solo aparece el texto listado aquí."
- "El muelle se ve distinto en preview y render: todo muelle es función cerrada de t."
