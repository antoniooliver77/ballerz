import { SITIO, esHoy, formatoFechaCorta, formatoFechaLarga } from "@/lib/contenido";

/**
 * Una fila del calendario. Soporta dos formas:
 *  - partido contra un rival  -> "Ballerz vs Rival"
 *  - evento propio del club   -> el nombre del evento (ej. interescuadras)
 * Los campos hora, sede, torneo y jornada son opcionales: si no hay dato, no
 * se inventa nada y simplemente no se muestra.
 */
export default function Partido({ p }) {
  const finalizado = p.estado === "finalizado" && p.marcador;
  const ganamos = finalizado && p.marcador.ballerz > p.marcador.rival;
  const empate = finalizado && p.marcador.ballerz === p.marcador.rival;
  const hoy = esHoy(p.fecha);

  const detalles = [p.sede, p.torneo].filter(Boolean).join(" · ");
  const subfecha = [p.hora ? `${p.hora} h` : null, p.jornada ? `J${p.jornada}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className={`partido${hoy ? " partido-hoy" : ""}`}>
      <div className="partido-fecha">
        {formatoFechaCorta(p.fecha)}
        {subfecha && <small>{subfecha}</small>}
      </div>

      <div>
        <h3 className="partido-vs">
          {p.rival ? (
            p.local ? (
              <>
                {SITIO.nombre} <span className="fuego">vs</span> {p.rival}
              </>
            ) : (
              <>
                {p.rival} <span className="fuego">vs</span> {SITIO.nombre}
              </>
            )
          ) : (
            p.evento
          )}
        </h3>
        {detalles && <p className="partido-info">{detalles}</p>}
        <p className="mono" style={{ marginTop: 6, color: "var(--tenue-2)", letterSpacing: ".2em" }}>
          <time dateTime={p.fecha}>{formatoFechaLarga(p.fecha)}</time>
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {finalizado ? (
          <>
            <span className="marcador">
              <span className={ganamos ? "gano" : undefined}>{p.marcador.ballerz}</span>
              {" — "}
              <span className={!ganamos && !empate ? "gano" : undefined}>{p.marcador.rival}</span>
            </span>
            <span className={`etiqueta ${ganamos ? "ganado" : empate ? "" : "perdido"}`}>
              {ganamos ? "Victoria" : empate ? "Empate" : "Derrota"}
            </span>
          </>
        ) : (
          <>
            {hoy && <span className="etiqueta es-hoy">Hoy</span>}
            {p.rival && (
              <span className={`etiqueta ${p.local ? "local" : ""}`}>
                {p.local ? "En casa" : "De visita"}
              </span>
            )}
          </>
        )}
      </div>
    </article>
  );
}
