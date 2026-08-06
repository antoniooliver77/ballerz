# Cómo actualizar la página de Ballerz

Esta guía es para **cualquier persona del club**, sin importar si sabe programar.
Todo lo que cambia seguido —partidos, jugadores, cuerpo técnico y datos de
contacto— vive en **cuatro archivos** dentro de la carpeta `contenido`.

No hay que tocar nada más.

---

## Regla de oro

Los archivos son de tipo `.json`. Solo hay que respetar tres cosas:

1. **Cada texto va entre comillas dobles.** `"Halcones"` ✅ · `Halcones` ❌
2. **Cada bloque se separa del siguiente con una coma**, menos el último.
3. **No borres las llaves `{ }` ni los corchetes `[ ]`.**

Si algo se rompe, el sitio te avisa al publicar y siempre puedes volver a la
versión anterior. No hay forma de perder nada.

> **Truco:** antes de guardar, pega el contenido en <https://jsonlint.com> y
> pulsa *Validate*. Si dice `Valid JSON`, está perfecto.

---

## 1. Actualizar el calendario de partidos

Archivo: **`contenido/calendario.json`**

Cada partido se ve así:

```json
{
  "fecha": "2026-08-16",
  "hora": "20:00",
  "rival": "Halcones",
  "local": true,
  "sede": "Gimnasio Polifuncional, Mérida",
  "torneo": "Liga Meridana de Basquetbol",
  "jornada": "1",
  "estado": "programado",
  "marcador": null
}
```

| Campo | Qué escribir |
|---|---|
| `fecha` | Siempre `AAAA-MM-DD`. El 3 de septiembre de 2026 es `2026-09-03` |
| `hora` | Reloj de 24 horas: `20:30`, no `8:30 pm` |
| `rival` | Nombre del equipo contrario |
| `local` | `true` si jugamos en casa, `false` si vamos de visita (sin comillas) |
| `sede` | Dónde se juega |
| `torneo` | Liga o torneo |
| `jornada` | Número o nombre de la jornada |
| `estado` | `programado`, `finalizado` o `cancelado` |
| `marcador` | `null` mientras no se juegue |

### Agregar un partido nuevo

Copia un bloque completo, pégalo debajo, ponle una coma al bloque anterior y
cambia los datos. **No importa el orden**: el sitio los acomoda solo por fecha.

### Registrar un resultado

Cambia dos cosas en el partido que ya se jugó:

```json
"estado": "finalizado",
"marcador": { "ballerz": 88, "rival": 74 }
```

El sitio calcula solo el récord de victorias y derrotas, mueve el partido a la
sección de resultados y le pone la etiqueta de **Victoria** o **Derrota**.

---

## 2. Actualizar el roster

Archivo: **`contenido/equipo.json`**

Cada jugador genera **su propia página** (por ejemplo
`ballerz.mx/equipo/tavo-ramirez`), así que conviene tener los datos completos.

```json
{
  "slug": "tavo-ramirez",
  "nombre": "Tavo Ramírez",
  "dorsal": "07",
  "posicion": "Escolta",
  "estatura": "1.90 m",
  "edad": 22,
  "origen": "Progreso, Yucatán",
  "foto": "",
  "bio": "El anotador del roster...",
  "estadisticas": { "puntos": 21.9, "rebotes": 3.6, "asistencias": 2.4 }
}
```

**`slug`** es la dirección web del jugador. Va en minúsculas, sin acentos y con
guiones en lugar de espacios: `Tavo Ramírez` → `tavo-ramirez`. Una vez publicado
conviene no cambiarlo, porque la dirección vieja dejaría de funcionar.

**`posicion`** debe ser una de estas cinco para que el jugador aparezca agrupado
correctamente: `Base`, `Escolta`, `Alero`, `Ala-pívot`, `Pívot`.

### Poner fotos de jugadores

1. Guarda la foto en la carpeta `public/jugadores/`
2. Escribe el nombre exacto del archivo en el campo `foto`:
   `"foto": "tavo-ramirez.jpg"`

Recomendación: fotos verticales de unos 800 × 1000 píxeles, en `.jpg`, de menos
de 300 KB cada una. Si dejas el campo vacío, el sitio muestra el dorsal gigante
en su lugar y se ve bien igual.

### Dar de baja a un jugador

Borra su bloque completo, desde `{` hasta `}`, junto con la coma que lo separa
del siguiente.

---

## 3. Actualizar el cuerpo técnico

Archivo: **`contenido/cuerpo-tecnico.json`**

Funciona igual que el roster. Las fotos van en `public/staff/`.

Para que el Head Coach aparezca destacado en la página de inicio, su campo
`cargo` debe contener las palabras **"Head Coach"**.

---

## 4. Cambiar datos generales del club

Archivo: **`contenido/sitio.json`**

Aquí están el lema, la descripción, la sede, el correo, el teléfono y las redes
sociales. Lo que cambies aquí se actualiza **en todo el sitio a la vez**,
incluido el pie de página y los textos que Google usa para mostrar el sitio en
los resultados de búsqueda.

Para agregar Instagram o TikTok, simplemente pon la dirección completa entre las
comillas:

```json
"instagram": "https://www.instagram.com/ballerzmid"
```

Si un campo queda vacío (`""`), ese enlace simplemente no aparece.

---

## Cómo publicar los cambios

### Opción A — desde la web de GitHub (la más fácil)

1. Entra al repositorio del proyecto en GitHub.
2. Abre la carpeta `contenido` y haz clic en el archivo que quieres cambiar.
3. Pulsa el **lápiz** (*Edit this file*) arriba a la derecha.
4. Haz tus cambios.
5. Baja hasta el final y pulsa **Commit changes**.

Vercel detecta el cambio y publica el sitio actualizado en **uno o dos minutos**.
No hay que hacer nada más.

### Opción B — desde la computadora

Edita los archivos con el Bloc de notas o VS Code, guárdalos, y súbelos a GitHub.
El resultado es el mismo.

---

## Cambiar el escudo

El escudo aparece en el menú, en el pie de página, en la animación de inicio y en
la vista previa cuando alguien comparte el sitio en WhatsApp o Facebook.

Si algún día cambia el logo, reemplaza estos archivos dentro de `public/`
conservando exactamente los mismos nombres:

- `logo.png` — el escudo en alta resolución, con fondo transparente
- `logo-512.png` — el mismo escudo a 512 píxeles de ancho *(este es el que usa
  la animación del inicio)*
- `icon.png` y `apple-icon.png` — el ícono cuadrado de la pestaña del navegador
- `og.jpg` — la imagen de 1200 × 630 px que se ve al compartir el enlace

La animación de partículas **no hay que tocarla**: lee el escudo nuevo
automáticamente y lo arma con sus colores reales.

---

## Preguntas rápidas

**¿Puedo romper el sitio editando esto?**
No de forma permanente. Si el archivo queda mal escrito, la publicación falla y
el sitio se queda como estaba. Corriges y vuelves a publicar.

**¿Cada cuánto debo actualizar el calendario?**
Idealmente después de cada partido. Los resultados recientes son lo que más
mueve a la gente a volver a la página.

**¿Necesito avisarle a alguien cuando cambie algo?**
No. El sitio se reconstruye solo y también actualiza su mapa para Google.
