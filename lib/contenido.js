import sitio from "@/contenido/sitio.json";
import calendario from "@/contenido/calendario.json";
import equipo from "@/contenido/equipo.json";
import cuerpoTecnico from "@/contenido/cuerpo-tecnico.json";

export const SITIO = sitio;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://ballerz.mx"
).replace(/\/$/, "");

/* ---------------- Jugadores ---------------- */

export function getJugadores() {
  return equipo.jugadores;
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

export function getProximosPartidos() {
  const hoy = Date.now();
  return getPartidos().filter((p) => p.estado === "programado" && p._t >= hoy - 6 * 3600e3);
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

/** Promedios del equipo a partir del roster. */
export function getPromediosEquipo() {
  const js = getJugadores();
  if (!js.length) return { puntos: 0, rebotes: 0, asistencias: 0 };
  const suma = (k) => js.reduce((t, j) => t + (j.estadisticas?.[k] || 0), 0);
  return {
    puntos: Math.round(suma("puntos") * 10) / 10,
    rebotes: Math.round(suma("rebotes") * 10) / 10,
    asistencias: Math.round(suma("asistencias") * 10) / 10,
  };
}
