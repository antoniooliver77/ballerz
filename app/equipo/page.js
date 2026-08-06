import Link from "next/link";
import Aparece from "@/components/Aparece";
import { CabeceraPagina, CabeceraSeccion, JsonLd } from "@/components/UI";
import { SITIO, SITE_URL, getJugadores, getPromediosEquipo } from "@/lib/contenido";
import { meta, schemaMigas } from "@/lib/seo";

export const metadata = meta({
  titulo: "Roster de jugadores",
  descripcion: `Plantilla completa de ${SITIO.nombre}, club de basquetbol de ${SITIO.ciudad}: dorsales, posiciones, estatura y promedios de cada jugador de la temporada.`,
  ruta: "/equipo",
});

const MIGAS = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Equipo", ruta: "/equipo" },
];

const ORDEN = ["Base", "Escolta", "Alero", "Ala-pívot", "Pívot"];

export default function Equipo() {
  const jugadores = getJugadores();
  const prom = getPromediosEquipo();

  const porPosicion = ORDEN.map((pos) => ({
    pos,
    lista: jugadores.filter((j) => j.posicion === pos),
  })).filter((g) => g.lista.length);

  const otros = jugadores.filter((j) => !ORDEN.includes(j.posicion));
  if (otros.length) porPosicion.push({ pos: "Otros", lista: otros });

  return (
    <>
      <CabeceraPagina
        migas={MIGAS}
        eyebrow="Temporada 2026 — 2027"
        titulo="Roster"
        entradilla={`Los ${jugadores.length} jugadores que visten el escudo de ${SITIO.nombre} esta temporada. Entra a cualquier ficha para ver estadísticas, medidas y trayectoria.`}
      />

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Plantilla" titulo="Todo el" contorno="equipo" />
          <div className="rejilla-jugadores">
            {jugadores.map((j, i) => (
              <Aparece key={j.slug} retardo={i * 45} as="article" className="jugador">
                <span className="jugador-dorsal" aria-hidden="true">{j.dorsal}</span>
                <p className="jugador-pos">{j.posicion}</p>
                <h2 style={{ fontSize: "clamp(1.5rem, 2.3vw, 2.1rem)", lineHeight: 0.94 }}>
                  {j.nombre}
                </h2>
                <p className="jugador-meta">
                  <span><b>{j.estadisticas.puntos}</b> PTS</span>
                  <span><b>{j.estadisticas.rebotes}</b> REB</span>
                  <span><b>{j.estadisticas.asistencias}</b> AST</span>
                </p>
                <Link href={`/equipo/${j.slug}`} className="jugador-enlace">
                  <span style={{ position: "absolute", left: -9999 }}>
                    Ver la ficha de {j.nombre}
                  </span>
                </Link>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Plantilla" titulo="Por" contorno="posición" />
          <div className="rejilla-tarjetas">
            {porPosicion.map((g) => (
              <Aparece key={g.pos} className="tarjeta">
                <h3>{g.pos}</h3>
                <ul style={{ listStyle: "none", display: "grid", gap: 10, marginTop: 14 }}>
                  {g.lista.map((j) => (
                    <li key={j.slug}>
                      <Link
                        href={`/equipo/${j.slug}`}
                        style={{ color: "var(--tenue)", display: "flex", gap: 12 }}
                      >
                        <b style={{ color: "var(--fuego)", minWidth: 28 }}>{j.dorsal}</b>
                        {j.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Producción" titulo="Promedios del" contorno="equipo" />
          <div className="rejilla-stats">
            <div className="stat">
              <div className="stat-n">{prom.puntos}</div>
              <div className="stat-l">Puntos por juego</div>
            </div>
            <div className="stat">
              <div className="stat-n">{prom.rebotes}</div>
              <div className="stat-l">Rebotes por juego</div>
            </div>
            <div className="stat">
              <div className="stat-n">{prom.asistencias}</div>
              <div className="stat-l">Asistencias por juego</div>
            </div>
          </div>
        </div>
      </section>

      <JsonLd datos={schemaMigas(MIGAS)} />
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Roster de ${SITIO.nombre}`,
          numberOfItems: jugadores.length,
          itemListElement: jugadores.map((j, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/equipo/${j.slug}`,
            name: j.nombre,
          })),
        }}
      />
    </>
  );
}
