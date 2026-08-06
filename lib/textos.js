/**
 * Textos de presentación para las fichas de jugadores.
 *
 * Son frases genéricas de club: hablan de actitud, esfuerzo y equipo, y están
 * escritas a propósito SIN datos verificables (nada de posiciones, promedios,
 * años en el club ni logros). Así cada ficha tiene vida sin afirmar nada que
 * pueda ser falso.
 *
 * A cada jugador le toca siempre la misma frase, porque se elige con un hash
 * de su slug: no cambia entre compilaciones ni depende del orden del roster.
 */

/** Palabras que cambian según la rama, para que la frase concuerde en género. */
function genero(rama) {
  const f = rama === "femenil";
  return {
    rama: f ? "femenil" : "varonil",
    jugador: f ? "jugadora" : "jugador",
    los: f ? "las" : "los",
    companeros: f ? "compañeras" : "compañeros",
    companero: f ? "compañera" : "compañero",
    listo: f ? "lista" : "listo",
  };
}

const SEMBLANZAS = [
  (n, g) =>
    `${n} defiende el escudo de Ballerz en la rama ${g.rama}. Dentro de la cancha aporta trabajo; fuera de ella, la actitud que sostiene al equipo cuando el partido se pone cuesta arriba.`,
  (n, g) =>
    `De ${g.los} que entienden que un equipo se construye en los entrenamientos y no en los partidos. ${n} suma desde donde le toque, y eso se nota en el marcador y en el vestidor.`,
  (n, g) =>
    `El basquetbol de ${n} se ve en lo que no sale en la estadística: el esfuerzo repetido, la comunicación con ${g.los} ${g.companeros} y las ganas de volver a intentarlo.`,
  (n, g) =>
    `${n} es parte de lo que hace que Ballerz sea un equipo y no solo un grupo de gente que comparte cancha: buena ${g.jugador} y mejor ${g.companero}.`,
  (n) =>
    `Cada temporada se gana el lugar entrenando. ${n} lo sabe, y es de esa clase de gente que levanta el nivel de quien tiene al lado sin necesidad de decir una palabra.`,
  (n, g) =>
    `Corre, marca y no baja los brazos: ${n} pone el cuerpo en cada jugada y la cabeza en cada decisión. Siempre ${g.listo} cuando el equipo lo necesita.`,
  (n, g) =>
    `En Ballerz buscamos compromiso, respeto y hambre de mejorar. ${n} representa las tres cosas cada vez que se pone la camiseta de la rama ${g.rama}.`,
  (n, g) =>
    `${n} llegó al club a crecer y no ha dejado de hacerlo. De ${g.los} que aparecen, que compiten y que hacen que entrenar valga la pena para todos.`,
];

const REMATES = [
  "Trabajo callado, resultados ruidosos.",
  "Aquí nadie regala un balón.",
  "El esfuerzo no se negocia.",
  "Se entrena como se juega.",
  "Uno para el equipo, el equipo para uno.",
  "La duela no miente.",
];

/** Hash estable de una cadena, para elegir siempre el mismo texto. */
function hash(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  return h;
}

export function semblanzaDe(j) {
  const g = genero(j.rama);
  const plantilla = SEMBLANZAS[hash(j.slug) % SEMBLANZAS.length];
  return plantilla(j.nombre, g);
}

export function remateDe(j) {
  return REMATES[hash(j.slug + "r") % REMATES.length];
}

export { genero };
