"use client";

import { useEffect, useRef } from "react";

/**
 * HERO: el escudo de Ballerz se arma con partículas conforme baja el scroll.
 *
 * Cómo funciona:
 *  1. Se carga /logo-512.png en un canvas fuera de pantalla.
 *  2. Se muestrean sus píxeles: cada píxel visible se convierte en una partícula
 *     que guarda su posición final y su color real dentro del escudo.
 *  3. El avance del scroll dentro de la sección (0 a 1) interpola cada partícula
 *     desde una posición dispersa hasta su lugar exacto.
 *  4. Al final, el escudo real en alta resolución aparece encima para que quede
 *     perfectamente nítido.
 *
 * No usa video ni librerías externas: es todo canvas 2D.
 */
export default function HeroLogo({ nombre, lema, datos = [] }) {
  const seccionRef = useRef(null);
  const canvasRef = useRef(null);
  const nitidoRef = useRef(null);
  const textoRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    const seccion = seccionRef.current;
    const canvas = canvasRef.current;
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

    /* ---- bucle de dibujo ---- */
    const suave = (t) => t * t * (3 - 2 * t);
    let pSuave = 0;

    function dibujar() {
      if (!vivo) return;
      raf = requestAnimationFrame(dibujar);
      if (!listo) return;

      const r = seccion.getBoundingClientRect();
      const recorrido = Math.max(1, r.height - alto);
      const bruto = Math.min(1, Math.max(0, -r.top / recorrido));
      pSuave += (bruto - pSuave) * 0.16;
      const p = pSuave;

      // fase 1 (0 → 0.62): armado.  fase 2 (0.62 → 1): reposo y texto.
      const armado = Math.min(1, p / 0.62);
      const fase2 = Math.max(0, Math.min(1, (p - 0.6) / 0.4));

      // el escudo sube y encoge para dejar sitio al nombre del club
      const escala = 1 - 0.46 * suave(fase2);
      const desplaza = -alto * 0.2 * suave(fase2);
      const cx = ancho / 2;
      const cy = alto * 0.46;

      ctx.clearRect(0, 0, ancho, alto);

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
      ctx.globalAlpha = 0.2 * desvanece;
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
      ctx.globalAlpha = (0.86 + 0.14 * armado) * desvanece;
      for (const b of buckets) {
        ctx.fillStyle = b.css;
        for (let k = b.ini; k < b.fin; k++) {
          ctx.fillRect(bufX[k], bufY[k], tam, tam);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

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
