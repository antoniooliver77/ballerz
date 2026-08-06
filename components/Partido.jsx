import { SITIO, formatoFechaCorta, formatoFechaLarga } from "@/lib/contenido";

export default function Partido({ p }) {
  const finalizado = p.estado === "finalizado" && p.marcador;
  const ganamos = finalizado && p.marcador.ballerz > p.marcador.rival;
  const empate = finalizado && p.marcador.ballerz === p.marcador.rival;

  return (
    <article className="partido">
      <div className="partido-fecha">
        {formatoFechaCorta(p.fecha)}
        <small>
          {p.hora} h · J{p.jornada}
        </small>
      </div>

      <div>
        <h3 className="partido-vs">
          {p.local ? (
            <>
              {SITIO.nombre} <span className="fuego">vs</span> {p.rival}
            </>
          ) : (
            <>
              {p.rival} <span className="fuego">vs</span> {SITIO.nombre}
            </>
          )}
        </h3>
        <p className="partido-info">
          {p.sede} · {p.torneo}
        </p>
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
          <span className={`etiqueta ${p.local ? "local" : ""}`}>
            {p.local ? "En casa" : "De visita"}
          </span>
        )}
      </div>
    </article>
  );
}
