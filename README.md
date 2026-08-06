# Ballerz — sitio oficial

Portal del club de basquetbol **Ballerz** (Mérida, Yucatán). Next.js 16 con App
Router, generación estática y cero dependencias de terceros en el navegador.

> **¿Vas a actualizar partidos o jugadores?** No necesitas leer esto.
> Ve directo a **[COMO-EDITAR.md](./COMO-EDITAR.md)**.

---

## Publicar en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repo.
3. Vercel detecta Next.js solo. No cambies nada de la configuración.
4. En **Settings → Environment Variables** agrega:

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://tudominio.com` |

   Esta variable alimenta los enlaces canónicos, el `sitemap.xml` y las vistas
   previas al compartir. Si no la pones, se usa `https://ballerz.mx`.
5. **Deploy**.

Cada `git push` a la rama principal vuelve a publicar el sitio automáticamente.

### Desarrollo local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # verifica que todo compile antes de publicar
```

---

## Estructura

```
app/                       Una carpeta por URL del sitio
  page.js                    /                         Inicio + animación del escudo
  equipo/page.js             /equipo                   Roster completo
  equipo/[slug]/page.js      /equipo/<jugador>         Ficha individual (una por jugador)
  cuerpo-tecnico/page.js     /cuerpo-tecnico           Staff y metodología
  calendario/page.js         /calendario               Partidos y resultados
  contacto/page.js           /contacto                 Pruebas, formulario y FAQ
  basquetbol-en-merida/…     /basquetbol-en-merida     Contenido editorial para SEO local
  sitemap.js  robots.js      /sitemap.xml  /robots.txt Generados automáticamente
  globals.css                Sistema visual completo

components/
  HeroLogo.jsx               La animación del escudo (canvas 2D, sin librerías)
  Nav.jsx  Footer.jsx        Menú y pie
  Partido.jsx  UI.jsx        Piezas reutilizables
  Aparece.jsx                Revelado al hacer scroll

contenido/                 ← LO ÚNICO QUE SE EDITA A DIARIO
  sitio.json                 Datos del club
  calendario.json            Partidos
  equipo.json                Roster
  cuerpo-tecnico.json        Staff

lib/
  contenido.js               Lee el contenido, ordena partidos, calcula el récord
  seo.js                     Metadatos y datos estructurados de cada página
```

---

## La animación del escudo

Está en `components/HeroLogo.jsx` y no usa video ni WebGL ni librerías externas.

El componente carga `/logo-512.png`, lo dibuja en un canvas fuera de pantalla y
lee sus píxeles. Cada píxel visible se convierte en una partícula que guarda su
posición final y **su color real dentro del escudo**. El avance del scroll dentro
de la sección (un valor de 0 a 1) interpola cada partícula desde una posición
dispersa hasta su lugar exacto, con un retardo distinto por partícula para que el
armado se sienta orgánico. Al llegar al final, el escudo real en alta resolución
aparece encima para que quede perfectamente nítido en cualquier pantalla.

Ventajas frente a un video o una secuencia de imágenes: pesa unos pocos KB, se ve
igual de bien en cualquier resolución, se adapta al tamaño de la ventana y
**funciona con cualquier logo** que pongas en `public/logo-512.png`.

Si el visitante tiene activada la opción de *reducir movimiento* del sistema, la
animación se salta y se muestra el escudo estático. Sin JavaScript también se ve
el escudo.

Para ajustar el ritmo, en `HeroLogo.jsx`:

- `const armado = Math.min(1, p / 0.62)` — qué parte del scroll ocupa el armado.
- `const objetivo = … 7200` — cuántas partículas se usan.
- En `globals.css`, `.hero { height: 320svh }` — cuánto scroll dura toda la escena.

---

## SEO

Cada ruta define sus propios metadatos mediante `lib/seo.js`:

- Título y descripción únicos, enlace canónico, Open Graph y Twitter Card.
- Un solo `<h1>` por página, con `<h2>` y `<h3>` jerárquicos por debajo.
- `sitemap.xml` y `robots.txt` generados en cada build, incluyendo una entrada
  por jugador.
- Datos estructurados JSON-LD: `SportsTeam` y `WebSite` en todo el sitio,
  `SportsEvent` por cada partido programado, `Person` por jugador y por miembro
  del cuerpo técnico, `BreadcrumbList` en las páginas interiores, `FAQPage` en
  contacto y en la guía local, y `Article` en la página editorial.
- Todas las páginas se generan como HTML estático, así que el buscador recibe el
  contenido completo sin ejecutar JavaScript.

Después de publicar, da de alta el dominio en
[Google Search Console](https://search.google.com/search-console) y envía
`https://tudominio.com/sitemap.xml`.

---

## Rendimiento y accesibilidad

- Tipografías auto-alojadas (`@fontsource`): no hay petición a Google Fonts.
- Sin GSAP, sin Three.js, sin jQuery. Todo el movimiento es canvas 2D e
  IntersectionObserver.
- Navegación por teclado, enlace de salto al contenido, foco visible, textos
  alternativos y contraste alto sobre fondo oscuro.
- `prefers-reduced-motion` respetado en toda la interfaz.
