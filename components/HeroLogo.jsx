"use client";

import { useEffect, useRef } from "react";

/**
 * HERO: un balón 3D gira solo mientras el usuario no ha hecho scroll; en cuanto
 * empieza a bajar, el balón se desvanece y el escudo de Ballerz se arma con
 * partículas.
 *
 * Cómo funciona:
 *  0. Un balón gira sobre su eje en un canvas aparte (geometría 3D proyectada a
 *     mano: costuras como aros orientados, sombreado con gradientes). Gira por
 *     tiempo, no por scroll, para que se vea vivo antes de interactuar.
 *  1. Se carga /logo-512.png en un canvas fuera de pantalla.
 *  2. Se muestrean sus píxeles: cada píxel visible se convierte en una partícula
 *     que guarda su posición final y su color real dentro del escudo.
 *  3. El avance del scroll dentro de la sección (0 a 1) interpola cada partícula
 *     desde una posición dispersa hasta su lugar exacto; los primeros puntos de
 *     scroll también funden el balón hacia afuera y las partículas hacia adentro.
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

    /* ---- balón 3D: gira por tiempo mientras no hay scroll ---- */
    // tres costuras (aros) con normales no alineadas al eje de giro, para que al
    // rotar sobre Y se vea un patrón cambiante y no un simple anillo fijo.
    const COSTURAS = [
      [1, 0.35, 0],
      [-0.5, 0.35, 0.87],
      [-0.5, 0.35, -0.87],
    ].map(([nx, ny, nz]) => {
      const len = Math.hypot(nx, ny, nz);
      const n = [nx / len, ny / len, nz / len];
      const ayuda = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const ux = n[1] * ayuda[2] - n[2] * ayuda[1];
      const uy = n[2] * ayuda[0] - n[0] * ayuda[2];
      const uz = n[0] * ayuda[1] - n[1] * ayuda[0];
      const ul = Math.hypot(ux, uy, uz);
      const u = [ux / ul, uy / ul, uz / ul];
      const v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
      const PASOS = 64;
      const pts = [];
      for (let i = 0; i <= PASOS; i++) {
        const t = (i / PASOS) * Math.PI * 2;
        const c = Math.cos(t);
        const s = Math.sin(t);
        pts.push([c * u[0] + s * v[0], c * u[1] + s * v[1], c * u[2] + s * v[2]]);
      }
      return pts;
    });

    // grano de cuero: textura sutil generada una sola vez, aplicada por encima
    // de la esfera con "multiply" a baja opacidad.
    let texturaGrano = null;
    if (bolaCtx) {
      const off = document.createElement("canvas");
      off.width = 90;
      off.height = 90;
      const octx = off.getContext("2d");
      for (let i = 0; i < 900; i++) {
        octx.beginPath();
        octx.arc(Math.random() * 90, Math.random() * 90, 0.5 + Math.random() * 1.1, 0, Math.PI * 2);
        octx.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.22)";
        octx.fill();
      }
      texturaGrano = bolaCtx.createPattern(off, "repeat");
    }

    let tsBalonInicio = 0;

    function dibujarBalon(ts, salida) {
      if (!bolaCtx) return;
      const alpha = 1 - salida;
      bolaCtx.clearRect(0, 0, ancho, alto);
      if (alpha <= 0.002) return;
      if (!tsBalonInicio) tsBalonInicio = ts;
      const entrada = suave(Math.min(1, (ts - tsBalonInicio) / 550));

      const movil = ancho < 720;
      const radioBase = Math.min(ancho, alto) * (movil ? 0.24 : 0.17);
      const radio = radioBase * (0.85 + 0.15 * entrada) * (1 + 0.22 * salida);
      const cx = ancho / 2;
      const cy = alto * 0.46;

      const giro = ts * 0.00055;
      const inclinacion = 0.26;
      const cosG = Math.cos(giro);
      const sinG = Math.sin(giro);
      const cosI = Math.cos(inclinacion);
      const sinI = Math.sin(inclinacion);
      const girar = ([x, y, z]) => {
        const x1 = x * cosG + z * sinG;
        const z1 = -x * sinG + z * cosG;
        const y2 = y * cosI - z1 * sinI;
        const z2 = y * sinI + z1 * cosI;
        return [x1, y2, z2];
      };

      bolaCtx.save();
      bolaCtx.globalAlpha = alpha * entrada;

      // sombra de contacto
      const sombraY = cy + radio * 1.12;
      const sombra = bolaCtx.createRadialGradient(cx, sombraY, radio * 0.1, cx, sombraY, radio * 0.95);
      sombra.addColorStop(0, "rgba(0,0,0,0.38)");
      sombra.addColorStop(1, "rgba(0,0,0,0)");
      bolaCtx.fillStyle = sombra;
      bolaCtx.beginPath();
      bolaCtx.ellipse(cx, sombraY, radio * 0.92, radio * 0.22, 0, 0, Math.PI * 2);
      bolaCtx.fill();

      // esfera base
      const grad = bolaCtx.createRadialGradient(
        cx - radio * 0.35,
        cy - radio * 0.42,
        radio * 0.06,
        cx,
        cy,
        radio * 1.04
      );
      grad.addColorStop(0, "#ff9a52");
      grad.addColorStop(0.45, "#f0740f");
      grad.addColorStop(0.8, "#c85708");
      grad.addColorStop(1, "#5e2703");
      bolaCtx.fillStyle = grad;
      bolaCtx.beginPath();
      bolaCtx.arc(cx, cy, radio, 0, Math.PI * 2);
      bolaCtx.fill();

      // grano de cuero
      if (texturaGrano) {
        bolaCtx.save();
        bolaCtx.beginPath();
        bolaCtx.arc(cx, cy, radio, 0, Math.PI * 2);
        bolaCtx.clip();
        bolaCtx.globalCompositeOperation = "multiply";
        bolaCtx.globalAlpha = alpha * entrada * 0.16;
        bolaCtx.fillStyle = texturaGrano;
        bolaCtx.fillRect(cx - radio, cy - radio, radio * 2, radio * 2);
        bolaCtx.restore();
      }

      // costuras, solo la mitad que mira a cámara (z >= 0)
      bolaCtx.strokeStyle = "#241206";
      bolaCtx.lineWidth = Math.max(1.2, radio * 0.045);
      bolaCtx.lineCap = "round";
      bolaCtx.lineJoin = "round";
      for (const curva of COSTURAS) {
        let trazando = false;
        bolaCtx.beginPath();
        for (const pt of curva) {
          const [x, y, z] = girar(pt);
          if (z < 0) {
            trazando = false;
            continue;
          }
          const sx2 = cx + x * radio;
          const sy2 = cy + y * radio;
          if (!trazando) {
            bolaCtx.moveTo(sx2, sy2);
            trazando = true;
          } else {
            bolaCtx.lineTo(sx2, sy2);
          }
        }
        bolaCtx.stroke();
      }

      // brillo especular (fijo, como si la luz viniera de arriba a la izquierda)
      const brillo = bolaCtx.createRadialGradient(
        cx - radio * 0.34,
        cy - radio * 0.4,
        0,
        cx - radio * 0.34,
        cy - radio * 0.4,
        radio * 0.55
      );
      brillo.addColorStop(0, "rgba(255,255,255,0.5)");
      brillo.addColorStop(1, "rgba(255,255,255,0)");
      bolaCtx.globalCompositeOperation = "lighter";
      bolaCtx.fillStyle = brillo;
      bolaCtx.beginPath();
      bolaCtx.arc(cx, cy, radio, 0, Math.PI * 2);
      bolaCtx.fill();

      bolaCtx.restore();
    }

    /* ---- bucle de dibujo ---- */
    const suave = (t) => t * t * (3 - 2 * t);
    let pSuave = 0;
    const FIN_BALON = 0.16; // fracción del scroll en la que el balón ya cedió el paso del todo

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
