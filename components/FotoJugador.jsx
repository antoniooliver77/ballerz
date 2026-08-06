import Link from "next/link";

/**
 * Tarjeta de jugador: el retrato completo (9:16, sin recorte) y debajo el
 * dorsal y el nombre como texto real.
 *
 * Las fotos ya vienen rotuladas por el fotógrafo, así que no se les encima
 * ningún texto: el pie va fuera de la imagen.
 */
export default function FotoJugador({ jugador: j, prioridad = false }) {
  const rol = j.rama === "femenil" ? "jugadora" : "jugador";

  return (
    <Link href={`/equipo/${j.slug}`} className="foto-jugador">
      <span className="foto-jugador-marco">
        {j.foto ? (
          <img
            src={`/jugadores/${j.foto}`}
            alt={`${j.nombre}, ${rol} de Ballerz con el dorsal ${j.dorsal}`}
            width="630"
            height="1120"
            loading={prioridad ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <span className="foto-jugador-sinfoto" aria-hidden="true">{j.dorsal}</span>
        )}
      </span>
      <span className="foto-jugador-pie">
        <span className="foto-jugador-num">{j.dorsal}</span>
        <span className="foto-jugador-nombre">{j.nombre}</span>
      </span>
    </Link>
  );
}
