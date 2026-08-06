import sitio from "@/contenido/sitio.json";
import calendario from "@/contenido/calendario.json";
import equipo from "@/contenido/equipo.json";
import cuerpoTecnico from "@/contenido/cuerpo-tecnico.json";

export const SITIO = sitio;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://ballerz.mx"
).replace(/\/$/, "");

/* ---------------- Jugadores ---------------- */

/** Las dos ramas del club, en el orden en que se muestran. */
export const RAMAS = [
  { id: "varonil", titulo: "Varonil", etiqueta: "Rama varonil" },
  { id: "femenil", titulo: "Femenil", etiqueta: "Rama femenil" },
];

export function getJugadores() {
  return equipo.jugadores;
}

export function getJugadoresPorRama(rama) {
  return equipo.jugadores.filter((j) => j.rama === rama);
}

/** El roster agrupado por rama, sin ramas vacías. */
export function getRamas() {
  return RAMAS.map((r) => ({ ...r, lista: getJugadoresPorRama(r.id) })).filter(
    (r) => r.lista.length
  );
}

export function getJugador(slug) {
  return equipo.jugadores.find((j) => j.slug === slug) || null;
}

/* ---------------- Cuerpo técnico ---------------- */

export function getStaff() {
  return cuerpoTecnico.staff;
}

export function getHeadCoach() {
  return (
    cuerpoTecnico.staff.find((p) =>
      (p.cargo || "").toLowerCase().includes("head coach")
    ) || cuerpoTecnico.staff[0]
  );
}

/* ---------------- Calendario ---------------- */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
];

/** Convierte "2026-08-16" + "20:00" en un Date estable (sin zona horaria del servidor). */
function parseFecha(fecha, hora = "00:00") {
  const [a, m, d] = String(fecha).split("-").map(Number);
  const [hh, mm] = String(hora).split(":").map(Number);
  return new Date(Date.UTC(a, (m || 1) - 1, d || 1, hh || 0, mm || 0));
}

export function formatoFechaLarga(fecha) {
  const f = parseFecha(fecha);
  return `${DIAS[f.getUTCDay()]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]} de ${f.getUTCFullYear()}`;
}

export function formatoFechaCorta(fecha) {
  const f = parseFecha(fecha);
  return `${String(f.getUTCDate()).padStart(2, "0")} ${MESES[f.getUTCMonth()].slice(0, 3).toUpperCase()}`;
}

/** ISO 8601 con offset de Mérida (UTC-6, sin horario de verano desde 2022). */
export function fechaISO(fecha, hora = "00:00") {
  return `${fecha}T${(hora || "00:00").padEnd(5, "0")}:00-06:00`;
}

export function getPartidos() {
  return [...calendario.partidos]
    .map((p) => ({ ...p, _t: parseFecha(p.fecha, p.hora).getTime() }))
    .sort((a, b) => a._t - b._t);
}

/** La fecha de hoy en Mérida (UTC-6 todo el año), como "AAAA-MM-DD". */
export function hoyEnMerida() {
  return new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10);
}

export function esHoy(fecha) {
  return fecha === hoyEnMerida();
}

/** Un partido sigue siendo "próximo" durante todo el día en que se juega. */
export function getProximosPartidos() {
  const hoy = hoyEnMerida();
  return getPartidos().filter((p) => p.estado === "programado" && p.fecha >= hoy);
}

export function getResultados() {
  return getPartidos()
    .filter((p) => p.estado === "finalizado" && p.marcador)
    .reverse();
}

export function getProximoPartido() {
  return getProximosPartidos()[0] || null;
}

/** Récord de victorias y derrotas calculado desde los marcadores. */
export function getRecord() {
  let ganados = 0;
  let perdidos = 0;
  for (const p of getResultados()) {
    if (p.marcador.ballerz > p.marcador.rival) ganados++;
    else if (p.marcador.ballerz < p.marcador.rival) perdidos++;
  }
  return { ganados, perdidos, jugados: ganados + perdidos };
}
