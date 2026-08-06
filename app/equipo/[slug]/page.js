import Link from "next/link";
import { notFound } from "next/navigation";
import { CabeceraPagina, CabeceraSeccion, JsonLd } from "@/components/UI";
import Aparece from "@/components/Aparece";
import { SITIO, getJugador, getJugadores, getJugadoresPorRama } from "@/lib/contenido";
import { semblanzaDe, remateDe, genero } from "@/lib/textos";
import { meta, schemaJugador, schemaMigas } from "@/lib/seo";

export function generateStaticParams() {
  return getJugadores().map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const j = getJugador(slug);
  if (!j) return meta({ titulo: "Jugador no encontrado", descripcion: "", ruta: "/equipo" });

  const g = genero(j.rama);
  return meta({
    titulo: `${j.nombre} · dorsal ${j.dorsal}`,
    descripcion: `${j.nombre} es ${g.jugador} de ${SITIO.nombre}, club de basquetbol de ${SITIO.ciudad}, ${SITIO.estado}. Viste el dorsal ${j.dorsal} en la rama ${g.rama}.`,
    ruta: `/equipo/${j.slug}`,
    tipo: "profile",
    ...(j.foto ? { imagen: `/jugadores/${j.foto}` } : {}),
  });
}

export default async function FichaJugador({ params }) {
  const { slug } = await params;
  const j = getJugador(slug);
  if (!j) notFound();

  const g = genero(j.rama);

  // la navegación anterior/siguiente se queda dentro de la misma rama
  const hermanos = getJugadoresPorRama(j.rama);
  const idx = hermanos.findIndex((x) => x.slug === j.slug);
  const siguiente = hermanos[(idx + 1) % hermanos.length];
  const anterior = hermanos[(idx - 1 + hermanos.length) % hermanos.length];

  const migas = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Equipo", ruta: "/equipo" },
    { nombre: j.nombre, ruta: `/equipo/${j.slug}` },
  ];

  return (
    <>
      <CabeceraPagina migas={migas} eyebrow={`Rama ${g.rama}`} titulo={j.nombre} />

      <section className="seccion">
        <div className="contenedor">
          <Aparece className="retrato">
            <div className="retrato-marco">
              {j.foto ? (
                <img
                  src={`/jugadores/${j.foto}`}
                  alt={`${j.nombre}, ${g.jugador} de ${SITIO.nombre} con el dorsal ${j.dorsal}`}
                  width="630"
                  height="1120"
                  fetchPriority="high"
                />
              ) : (
                <span className="foto-jugador-sinfoto" aria-hidden="true">{j.dorsal}</span>
              )}
            </div>

            <div className="retrato-datos">
              <span className="retrato-dorsal" aria-hidden="true">{j.dorsal}</span>
              <p className="mono fuego" style={{ marginBottom: 14 }}>Dorsal {j.dorsal}</p>
              <h2 className="cromado">{j.nombre}</h2>

              <p className="plomo" style={{ marginTop: 22 }}>{semblanzaDe(j)}</p>

              <div className="retrato-meta">
                <span className="etiqueta">#{j.dorsal}</span>
                <span className="etiqueta">Rama {g.rama}</span>
                <span className="etiqueta">{SITIO.ciudad}, {SITIO.estado}</span>
              </div>

              <blockquote className="cita">{remateDe(j)}</blockquote>
            </div>
          </Aparece>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Ficha" titulo="Datos del" contorno="roster" />
          <div className="ficha-datos">
            <table className="tabla-datos">
              <caption style={{ position: "absolute", left: -9999 }}>
                Datos de {j.nombre}
              </caption>
              <tbody>
                <tr><th scope="row">Dorsal</th><td>{j.dorsal}</td></tr>
                <tr><th scope="row">Rama</th><td style={{ textTransform: "capitalize" }}>{g.rama}</td></tr>
                <tr><th scope="row">Club</th><td>{SITIO.nombreCompleto}</td></tr>
                <tr><th scope="row">Sede</th><td>{SITIO.ciudad}, {SITIO.estado}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="botones">
            <Link href={`/equipo/${anterior.slug}`} className="btn btn-linea">
              <span>← {anterior.nombre}</span>
            </Link>
            <Link href="/equipo" className="btn btn-linea"><span>Todo el roster</span></Link>
            <Link href={`/equipo/${siguiente.slug}`} className="btn btn-linea">
              <span>{siguiente.nombre} →</span>
            </Link>
          </div>
        </div>
      </section>

      <JsonLd datos={schemaJugador(j)} />
      <JsonLd datos={schemaMigas(migas)} />
    </>
  );
}
