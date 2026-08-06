"use client";

import { useEffect, useRef } from "react";

/**
 * HERO: un balón 3D gira solo mientras el usuario no ha hecho scroll; en cuanto
 * empieza a bajar, el balón se desvanece y el escudo de Ballerz se arma con
 * partículas.
 *
 * Cómo funciona:
 *  0. Un balón gira sobre su eje en un canvas aparte: una esfera con textura
 *     equirectangular de balón real (paneles, costuras y grano de cuero)
 *     muestreada píxel a píxel con la rotación del momento, más luz difusa,
 *     borde oscuro y brillo especular. Gira por tiempo, no por scroll, para
 *     que se vea vivo antes de interactuar.
 *  1. Se carga /logo-512.png en un canvas fuera de pantalla.
 *  2. Se muestrean sus píxeles: cada píxel visible se convierte en una partícula
 *     que guarda su posición final y su color real dentro del escudo.
 *  3. El avance del scroll dentro de la sección (0 a 1) interpola cada partícula
 *     desde una posición dispersa hasta su lugar exacto; durante la primera
 *     mitad del recorrido el balón crece hacia cámara y se disuelve mientras
 *     las partículas aparecen, para que las dos animaciones se solapen.
 *  4. Al final, el escudo real en alta resolución aparece encima para que quede
 *     perfectamente nítido.
 *
 * No usa video ni librerías externas: es todo canvas 2D.
 */
export default function HeroLogo({ nombre, lema, datos = [] }) {
  const seccionRef = useRef(null);
  const canvasRef = useRef(null);
  const bolaCanvasRef = useRef(null);
  const nitidoRef = useRef(null);
  const textoRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    const seccion = seccionRef.current;
    const canvas = canvasRef.current;
    const bola = bolaCanvasRef.current;
    const nitido = nitidoRef.current;
    const texto = textoRef.current;
    const cue = cueRef.current;
    if (!seccion || !canvas) return;

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido) {
      if (nitido) nitido.style.opacity = "1";
      if (texto) texto.style.opacity = "1";
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    const bolaCtx = bola ? bola.getContext("2d", { alpha: true }) : null;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let ancho = 0;
    let alto = 0;
    let raf = 0;
    let vivo = true;

    /* ---- partículas ---- */
    let tx, ty, sx, sy, retardo, colorBucket;
    let total = 0;
    let buckets = [];
    let logoRect = { x: 0, y: 0, w: 0, h: 0 };
    let listo = false;
    let relacion = 1;

    const img = new Image();
    img.decoding = "async";

    function medir() {
      const r = seccion.getBoundingClientRect();
      ancho = window.innerWidth;
      alto = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(ancho * dpr);
      canvas.height = Math.floor(alto * dpr);
      canvas.style.width = ancho + "px";
      canvas.style.height = alto + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (bola && bolaCtx) {
        bola.width = Math.floor(ancho * dpr);
        bola.height = Math.floor(alto * dpr);
        bola.style.width = ancho + "px";
        bola.style.height = alto + "px";
        bolaCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      return r;
    }

    function calcularRect() {
      let h = alto * (ancho < 720 ? 0.42 : 0.52);
      let w = h * relacion;
      const maxW = ancho * (ancho < 720 ? 0.88 : 0.62);
      if (w > maxW) {
        w = maxW;
        h = w / relacion;
      }
      logoRect = { x: (ancho - w) / 2, y: alto * 0.46 - h / 2, w, h };
    }

    function construir() {
      calcularRect();

      // canvas fuera de pantalla al tamaño final del escudo
      const off = document.createElement("canvas");
      const ow = Math.max(120, Math.round(logoRect.w));
      const oh = Math.max(120, Math.round(logoRect.h));
      off.width = ow;
      off.height = oh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      octx.drawImage(img, 0, 0, ow, oh);
      const data = octx.getImageData(0, 0, ow, oh).data;

      // paso de muestreo: apuntamos a ~7200 partículas en escritorio
      const objetivo = ancho < 720 ? 3600 : 7200;
      const paso = Math.max(2, Math.round(Math.sqrt((ow * oh) / objetivo)));

      const _tx = [];
      const _ty = [];
      const _col = [];
      for (let y = 0; y < oh; y += paso) {
        for (let x = 0; x < ow; x += paso) {
          const i = (y * ow + x) * 4;
          if (data[i + 3] < 60) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r + g + b < 42) continue; // descartamos el negro puro del contorno
          _tx.push(logoRect.x + x);
          _ty.push(logoRect.y + y);
          _col.push((r >> 5 << 10) | (g >> 5 << 5) | (b >> 5)); // bucket 32x32x32
        }
      }

      total = _tx.length;
      tx = new Float32Array(total);
      ty = new Float32Array(total);
      sx = new Float32Array(total);
      sy = new Float32Array(total);
      retardo = new Float32Array(total);
      colorBucket = new Int32Array(total);

      // orden por bucket de color para pintar en lotes
      const indices = _col.map((c, i) => i).sort((a, b) => _col[a] - _col[b]);

      const diag = Math.hypot(ancho, alto);
      for (let k = 0; k < total; k++) {
        const i = indices[k];
        tx[k] = _tx[i];
        ty[k] = _ty[i];
        colorBucket[k] = _col[i];

        // posición inicial: anillo disperso alrededor del centro
        const ang = Math.random() * Math.PI * 2;
        const rad = diag * (0.14 + Math.random() * 0.4);
        sx[k] = ancho / 2 + Math.cos(ang) * rad;
        sy[k] = alto * 0.46 + Math.sin(ang) * rad * 0.7;
        retardo[k] = Math.random() * 0.38;
      }

      // lotes de color contiguos
      buckets = [];
      let ini = 0;
      for (let k = 1; k <= total; k++) {
        if (k === total || colorBucket[k] !== colorBucket[ini]) {
          const c = colorBucket[ini];
          const r = ((c >> 10) & 31) * 8 + 4;
          const g = ((c >> 5) & 31) * 8 + 4;
          const b = (c & 31) * 8 + 4;
          buckets.push({ ini, fin: k, css: `rgb(${r},${g},${b})` });
          ini = k;
        }
      }

      // los buffers del bucle se recrean porque el número de partículas cambió
      dibujar._bx = null;
      dibujar._by = null;
      listo = true;
    }

    /* ---- balón 3D texturizado: gira por tiempo mientras no hay scroll ---- */
    // El patrón real de un balón (la costura recta central, el aro vertical y
    // los dos lazos con puntas en U que corren paralelos formando bandas
    // uniformes) se dibuja una sola vez en una textura
    // equirectangular; cada fotograma se muestrea esa textura píxel a píxel
    // sobre la esfera con la rotación del momento, más luz difusa fija, borde
    // oscurecido y brillo especular. Así las costuras giran pegadas a la
    // superficie en vez de flotar sobre un círculo plano.
    const TEXW = 1024;
    const TEXH = 512;
    let texData = null;
    let bolaBuf = null;
    let tsBalonInicio = 0;

    if (bolaCtx) {
      const t = document.createElement("canvas");
      t.width = TEXW;
      t.height = TEXH;
      const tc = t.getContext("2d");

      // cuero naranja
      tc.fillStyle = "#e97612";
      tc.fillRect(0, 0, TEXW, TEXH);

      // grano del cuero (más ancho cerca de los polos para compensar el mapeo)
      for (let i = 0; i < 15000; i++) {
        const x = Math.random() * TEXW;
        const y = Math.random() * TEXH;
        const lat = (y / TEXH - 0.5) * Math.PI;
        const rx = Math.min(14, (0.6 + Math.random() * 0.9) / Math.max(0.18, Math.cos(lat)));
        const ry = 0.6 + Math.random() * 0.9;
        tc.beginPath();
        tc.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        tc.fillStyle = Math.random() < 0.62 ? "rgba(96,42,10,0.28)" : "rgba(255,186,120,0.16)";
        tc.fill();
      }

      // costura vertical: el aro que pasa por arriba, abajo y los dos frentes
      // del patrón, con el grosor compensado hacia los polos de la textura
      const meridiano = (cxTex, w, estilo) => {
        tc.fillStyle = estilo;
        for (let y = 0; y < TEXH; y++) {
          const lat = ((y + 0.5) / TEXH - 0.5) * Math.PI;
          const ww = Math.min(120, w / Math.max(0.1, Math.cos(lat)));
          tc.fillRect(cxTex - ww / 2, y, ww, 1);
        }
      };
      meridiano(0, 8.5, "rgba(32,15,4,0.45)");
      meridiano(512, 8.5, "rgba(32,15,4,0.45)");
      meridiano(1024, 8.5, "rgba(32,15,4,0.45)");
      meridiano(0, 5.5, "#200f04");
      meridiano(512, 5.5, "#200f04");
      meridiano(1024, 5.5, "#200f04");

      // costura horizontal (el gran círculo que contiene el eje del patrón)
      tc.fillStyle = "rgba(32,15,4,0.45)";
      tc.fillRect(0, TEXH / 2 - 4.25, TEXW, 8.5);
      tc.fillStyle = "#200f04";
      tc.fillRect(0, TEXH / 2 - 2.75, TEXW, 5.5);

      // las dos costuras curvas: cada una es un lazo cerrado que corre paralelo
      // a la costura recta central (así los gajos del centro quedan como bandas
      // de ancho uniforme) y remata en las puntas con una vuelta en U
      // redondeada cerca de cada polo del patrón, como en un balón real
      tc.lineCap = "round";
      tc.lineJoin = "round";
      const DELTA = 0.35; // separación angular de la banda (~20°)
      const LAMBDA = 1.082; // medio largo del tramo recto (~62°)
      const cdl = Math.cos(DELTA);
      const sdl = Math.sin(DELTA);
      const puntoTex = (px, py, pz, desplazaX) => {
        const lon = Math.atan2(px, pz);
        const lat = Math.asin(Math.max(-1, Math.min(1, py)));
        return [(lon / (Math.PI * 2) + 0.5) * TEXW + desplazaX, (lat / Math.PI + 0.5) * TEXH];
      };
      const trazar = (pts) => {
        tc.lineWidth = 9;
        tc.strokeStyle = "rgba(32,15,4,0.45)";
        tc.beginPath();
        pts.forEach(([x, y], i) => (i ? tc.lineTo(x, y) : tc.moveTo(x, y)));
        tc.stroke();
        tc.lineWidth = 5.5;
        tc.strokeStyle = "#200f04";
        tc.beginPath();
        pts.forEach(([x, y], i) => (i ? tc.lineTo(x, y) : tc.moveTo(x, y)));
        tc.stroke();
      };
      const lazo = (desplazaX) => {
        const pts = [];
        // rama superior, paralela a la costura recta
        for (let i = 0; i <= 60; i++) {
          const l = -LAMBDA + (i / 60) * 2 * LAMBDA;
          pts.push(puntoTex(cdl * Math.sin(l), sdl, cdl * Math.cos(l), desplazaX));
        }
        // vuelta en U alrededor del extremo del tramo (la "punta" con forma)
        const punta = (dir, desdePhi, hastaPhi) => {
          const ex = Math.sin(LAMBDA) * dir;
          const ez = Math.cos(LAMBDA);
          const tx2 = Math.cos(LAMBDA) * dir;
          const tz2 = -Math.sin(LAMBDA) * dir;
          for (let i = 0; i <= 30; i++) {
            const phi = desdePhi + (i / 30) * (hastaPhi - desdePhi);
            const cph = Math.cos(phi);
            const sph = Math.sin(phi);
            pts.push(
              puntoTex(cdl * ex + sdl * cph * tx2, sdl * sph, cdl * ez + sdl * cph * tz2, desplazaX)
            );
          }
        };
        punta(1, Math.PI / 2, -Math.PI / 2);
        // rama inferior, de regreso
        for (let i = 0; i <= 60; i++) {
          const l = LAMBDA - (i / 60) * 2 * LAMBDA;
          pts.push(puntoTex(cdl * Math.sin(l), -sdl, cdl * Math.cos(l), desplazaX));
        }
        punta(-1, -Math.PI / 2, Math.PI / 2);
        trazar(pts);
      };
      lazo(0); // lazo frontal, centrado en el frente del patrón
      lazo(-TEXW / 2); // lazo trasero (dos copias para cubrir el empalme)
      lazo(TEXW / 2);

      texData = tc.getImageData(0, 0, TEXW, TEXH).data;
    }

    // tablas por píxel de la esfera: coordenada de textura base, fila, luz y
    // brillo. Solo dependen del tamaño, así que se recalculan al redimensionar;
    // por fotograma únicamente cambia el desplazamiento de longitud (el giro).
    function construirBolaBuf(S) {
      const lienzo = document.createElement("canvas");
      lienzo.width = S;
      lienzo.height = S;
      const lctx = lienzo.getContext("2d");
      const imgData = lctx.createImageData(S, S);
      const d = imgData.data;

      const n = S * S;
      const idx = new Int32Array(n);
      const uBase = new Int32Array(n);
      const texFila = new Int32Array(n);
      const luzQ = new Uint16Array(n);
      const espec = new Uint8Array(n);

      // inclinación fija del eje de giro (ligeramente ladeado y hacia cámara)
      const ax = 0.42;
      const az = -0.2;
      const cax = Math.cos(ax);
      const sax = Math.sin(ax);
      const caz = Math.cos(az);
      const saz = Math.sin(az);
      // luz desde arriba a la izquierda, hacia la cámara (normalizada)
      const Lx = -0.45;
      const Ly = -0.5;
      const Lz = 0.74;
      const Hx = -0.241;
      const Hy = -0.268;
      const Hz = 0.932;

      const mitad = S / 2;
      let cuenta = 0;
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const fx = (x + 0.5 - mitad) / mitad;
          const fy = (y + 0.5 - mitad) / mitad;
          const rr = fx * fx + fy * fy;
          if (rr > 1) continue;
          const nz = Math.sqrt(1 - rr);
          const di = (y * S + x) * 4;

          // borde suave (antialias del contorno)
          d[di + 3] = Math.round(255 * Math.min(1, ((1 - Math.sqrt(rr)) * mitad) / 1.4));

          // dirección en el marco del balón (deshace la inclinación del eje)
          const y1 = fy * cax - nz * sax;
          const z1 = fy * sax + nz * cax;
          const mx = fx * caz - y1 * saz;
          const my = fx * saz + y1 * caz;
          const lon = Math.atan2(mx, z1);
          const lat = Math.asin(Math.max(-1, Math.min(1, my)));
          uBase[cuenta] = (Math.round((lon / (Math.PI * 2) + 0.5) * TEXW) + TEXW) & (TEXW - 1);
          texFila[cuenta] =
            Math.max(0, Math.min(TEXH - 1, Math.round((lat / Math.PI + 0.5) * TEXH))) * TEXW;

          // iluminación fija en el marco de la cámara
          const dif = Math.max(0, fx * Lx + fy * Ly + nz * Lz);
          const limbo = 0.42 + 0.58 * Math.pow(nz, 0.65);
          luzQ[cuenta] = Math.round(256 * Math.min(1.08, (0.16 + 0.98 * dif) * limbo));
          const es = fx * Hx + fy * Hy + nz * Hz;
          espec[cuenta] = es > 0.6 ? Math.round(Math.pow(es, 60) * 150) : 0;

          idx[cuenta] = di;
          cuenta++;
        }
      }
      bolaBuf = { S, lienzo, lctx, imgData, d, idx, uBase, texFila, luzQ, espec, cuenta };
    }

    function dibujarBalon(ts, salida) {
      if (!bolaCtx || !texData) return;
      // el balón aguanta opaco el primer tramo de su salida y se disuelve al
      // final, mientras crece hacia cámara — así acompaña el armado del escudo
      // en lugar de dejar un hueco vacío
      const alpha = 1 - suave(Math.min(1, Math.max(0, (salida - 0.3) / 0.7)));
      bolaCtx.clearRect(0, 0, ancho, alto);
      if (alpha <= 0.002) return;
      if (!tsBalonInicio) tsBalonInicio = ts;
      const entrada = suave(Math.min(1, (ts - tsBalonInicio) / 550));

      const movil = ancho < 720;
      const radioBase = Math.min(ancho, alto) * (movil ? 0.26 : 0.19);
      const radio = radioBase * (0.85 + 0.15 * entrada) * (1 + 3 * salida);
      const cx = ancho / 2;
      const cy = alto * 0.46;

      const S = Math.max(96, Math.min(640, Math.round(radioBase * 2.5 * dpr)));
      if (!bolaBuf || bolaBuf.S !== S) construirBolaBuf(S);

      // fotograma: muestrear la textura con el giro actual (una vuelta ≈ 5 s)
      const { d, idx, uBase, texFila, luzQ, espec, cuenta } = bolaBuf;
      const off = (ts * 0.205) | 0;
      for (let i = 0; i < cuenta; i++) {
        const tb = (texFila[i] + ((uBase[i] + off) & (TEXW - 1))) << 2;
        const luz = luzQ[i];
        const sp = espec[i];
        const di = idx[i];
        d[di] = ((texData[tb] * luz) >> 8) + sp;
        d[di + 1] = ((texData[tb + 1] * luz) >> 8) + sp;
        d[di + 2] = ((texData[tb + 2] * luz) >> 8) + ((sp * 3) >> 2);
      }
      bolaBuf.lctx.putImageData(bolaBuf.imgData, 0, 0);

      bolaCtx.save();

      // sombra de contacto (se va antes que el balón, para que al crecer no
      // arrastre una elipse gigante por la parte baja)
      bolaCtx.globalAlpha = alpha * entrada * (1 - salida);
      const sombraY = cy + radio * 1.14;
      const sombra = bolaCtx.createRadialGradient(cx, sombraY, radio * 0.1, cx, sombraY, radio * 0.95);
      sombra.addColorStop(0, "rgba(0,0,0,0.4)");
      sombra.addColorStop(1, "rgba(0,0,0,0)");
      bolaCtx.fillStyle = sombra;
      bolaCtx.beginPath();
      bolaCtx.ellipse(cx, sombraY, radio * 0.9, radio * 0.2, 0, 0, Math.PI * 2);
      bolaCtx.fill();

      bolaCtx.globalAlpha = alpha * entrada;
      bolaCtx.drawImage(bolaBuf.lienzo, cx - radio, cy - radio, radio * 2, radio * 2);
      bolaCtx.restore();
    }

    /* ---- bucle de dibujo ---- */
    const suave = (t) => t * t * (3 - 2 * t);
    let pSuave = 0;
    const FIN_BALON = 0.55; // fracción del scroll en la que el balón ya cedió el paso del todo

    function dibujar(ts) {
      if (!vivo) return;
      raf = requestAnimationFrame(dibujar);

      const r = seccion.getBoundingClientRect();
      const recorrido = Math.max(1, r.height - alto);
      const bruto = Math.min(1, Math.max(0, -r.top / recorrido));
      pSuave += (bruto - pSuave) * 0.16;
      const p = pSuave;

      // el balón gira solo hasta que arranca el scroll; a partir de ahí se
      // desvanece mientras las partículas del escudo toman su lugar. No depende
      // de que el logo ya haya cargado, para que gire desde el primer fotograma.
      const salidaBalon = suave(Math.min(1, p / FIN_BALON));
      dibujarBalon(ts, salidaBalon);

      if (!listo) return;

      // fase 1 (0 → 0.62): armado.  fase 2 (0.62 → 1): reposo y texto.
      const armado = Math.min(1, p / 0.62);
      const fase2 = Math.max(0, Math.min(1, (p - 0.6) / 0.4));

      // el escudo sube y encoge para dejar sitio al nombre del club
      const escala = 1 - 0.46 * suave(fase2);
      const desplaza = -alto * 0.2 * suave(fase2);
      const cx = ancho / 2;
      const cy = alto * 0.46;

      ctx.clearRect(0, 0, ancho, alto);

      if (salidaBalon > 0.002) {
        const movil = ancho < 720;
        const tam = (3.4 - 1.3 * armado) * (movil ? 0.85 : 1);
        const desvanece = Math.min(1, Math.max(0, 1 - (p - 0.84) / 0.12));

        // posiciones de este fotograma (se reutilizan en las dos pasadas)
        const bufX = dibujar._bx || (dibujar._bx = new Float32Array(total));
        const bufY = dibujar._by || (dibujar._by = new Float32Array(total));
        for (let k = 0; k < total; k++) {
          const local = Math.min(1, Math.max(0, (armado - retardo[k]) / (1 - retardo[k])));
          const e = suave(local);
          const fx = cx + (tx[k] - cx) * escala;
          const fy = cy + (ty[k] - cy) * escala + desplaza;
          bufX[k] = sx[k] + (fx - sx[k]) * e;
          bufY[k] = sy[k] + (fy - sy[k]) * e;
        }

        // pasada 1: resplandor (partículas grandes, sumadas)
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.2 * desvanece * salidaBalon;
        const tamG = tam * 3.2;
        const medioG = tamG / 2 - tam / 2;
        for (const b of buckets) {
          ctx.fillStyle = b.css;
          for (let k = b.ini; k < b.fin; k++) {
            ctx.fillRect(bufX[k] - medioG, bufY[k] - medioG, tamG, tamG);
          }
        }

        // pasada 2: la partícula nítida
        ctx.globalCompositeOperation = armado < 0.9 ? "lighter" : "source-over";
        ctx.globalAlpha = (0.86 + 0.14 * armado) * desvanece * salidaBalon;
        for (const b of buckets) {
          ctx.fillStyle = b.css;
          for (let k = b.ini; k < b.fin; k++) {
            ctx.fillRect(bufX[k], bufY[k], tam, tam);
          }
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      // el escudo real, nítido, aparece al final del armado
      if (nitido) {
        const v = Math.max(0, Math.min(1, (p - 0.84) / 0.12));
        nitido.style.opacity = String(v);
        nitido.style.left = logoRect.x + "px";
        nitido.style.top = logoRect.y + desplaza + "px";
        nitido.style.width = logoRect.w + "px";
        nitido.style.height = logoRect.h + "px";
        nitido.style.transform = `scale(${escala})`;
        nitido.style.transformOrigin = "center center";
      }

      // texto
      if (texto) {
        const v = Math.max(0, Math.min(1, (p - 0.7) / 0.2));
        texto.style.opacity = String(v);
        texto.style.transform = `translateY(${(1 - suave(v)) * 40}px)`;
      }
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 5));
    }

    function alRedimensionar() {
      medir();
      if (img.complete && img.naturalWidth) construir();
    }

    img.onload = () => {
      relacion = img.naturalWidth / img.naturalHeight;
      medir();
      construir();
    };
    img.onerror = () => {
      // si el escudo no carga, mostramos el texto de todas formas
      if (texto) texto.style.opacity = "1";
    };
    img.src = "/logo-512.png";

    medir();
    raf = requestAnimationFrame(dibujar);
    window.addEventListener("resize", alRedimensionar);
    window.addEventListener("orientationchange", alRedimensionar);

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", alRedimensionar);
      window.removeEventListener("orientationchange", alRedimensionar);
    };
  }, []);

  return (
    <section className="hero" ref={seccionRef} aria-label={`${nombre}: escudo del club`}>
      <div className="hero-fijo">
        <canvas className="hero-canvas" ref={canvasRef} aria-hidden="true" />
        <canvas className="hero-ball-canvas" ref={bolaCanvasRef} aria-hidden="true" />

        <img
          ref={nitidoRef}
          src="/logo-512.png"
          alt={`Escudo del club de basquetbol ${nombre}`}
          className="hero-nitido"
          style={{ position: "absolute", opacity: 0, objectFit: "contain", zIndex: 2 }}
          fetchPriority="high"
        />

        <div className="hero-brillo" aria-hidden="true" />
        <div className="hero-vineta" aria-hidden="true" />

        <div className="hero-contenido" ref={textoRef} style={{ opacity: 0 }}>
          <p className="hero-sub">{lema}</p>
          <h1 className="cromado">{nombre}</h1>
          {datos.length > 0 && (
            <div className="hero-datos">
              {datos.map((d, i) => (
                <div key={i}>
                  {d.etiqueta} <b>{d.valor}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hero-cue mono" ref={cueRef} aria-hidden="true">
          Baja para armar el escudo
        </div>
      </div>

      <noscript>
        <div className="hero-logo-fallback">
          <img src="/logo-512.png" alt={`Escudo del club de basquetbol ${nombre}`} />
        </div>
      </noscript>
    </section>
  );
}
