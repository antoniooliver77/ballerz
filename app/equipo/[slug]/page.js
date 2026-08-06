import Link from "next/link";
import { notFound } from "next/navigation";
import { CabeceraPagina, CabeceraSeccion, JsonLd } from "@/components/UI";
import Aparece from "@/components/Aparece";
import { SITIO, getJugador, getJugadores } from "@/lib/contenido";
import { meta, schemaJugador, schemaMigas } from "@/lib/seo";

export function generateStaticParams() {
  return getJugadores().map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const j = getJugador(slug);
  if (!j) return meta({ titulo: "Jugador no encontrado", descripcion: "", ruta: "/equipo" });

  return meta({
    titulo: `${j.nombre}, ${j.posicion} · dorsal ${j.dorsal}`,
    descripcion: `${j.nombre} (${j.posicion}, ${j.estatura}) juega con el dorsal ${j.dorsal} en ${SITIO.nombre}, club de basquetbol de ${SITIO.ciudad}. Promedia ${j.estadisticas.puntos} puntos y ${j.estadisticas.rebotes} rebotes por partido.`,
    ruta: `/equipo/${j.slug}`,
    tipo: "profile",
  });
}

export default async function FichaJugador({ params }) {
  const { slug } = await params;
  const j = getJugador(slug);
  if (!j) notFound();

  const todos = getJugadores();
  const idx = todos.findIndex((x) => x.slug === j.slug);
  const siguiente = todos[(idx + 1) % todos.length];
  const anterior = todos[(idx - 1 + todos.length) % todos.length];

  const migas = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Equipo", ruta: "/equipo" },
    { nombre: j.nombre, ruta: `/equipo/${j.slug}` },
  ];

  return (
    <>
      <CabeceraPagina
        migas={migas}
        eyebrow={`${j.posicion} · Dorsal ${j.dorsal}`}
        titulo={j.nombre}
        entradilla={j.bio}
      />

      <section className="seccion">
        <div className="contenedor">
          <Aparece className="ficha">
            <div className="ficha-visual">
              {j.foto ? (
                <img
                  src={`/jugadores/${j.foto}`}
                  alt={`${j.nombre}, ${j.posicion} de ${SITIO.nombre}`}
                  width="420"
                  height="520"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              ) : (
                <span className="num-grande" aria-hidden="true">{j.dorsal}</span>
              )}
            </div>

            <div className="ficha-datos">
              <CabeceraSeccion titulo="Ficha" contorno="técnica" />
              <table className="tabla-datos">
                <caption style={{ position: "absolute", left: -9999 }}>
                  Datos de {j.nombre}
                </caption>
                <tbody>
                  <tr><th scope="row">Dorsal</th><td>{j.dorsal}</td></tr>
                  <tr><th scope="row">Posición</th><td>{j.posicion}</td></tr>
                  <tr><th scope="row">Estatura</th><td>{j.estatura}</td></tr>
                  {j.edad ? <tr><th scope="row">Edad</th><td>{j.edad} años</td></tr> : null}
                  {j.origen ? <tr><th scope="row">Origen</th><td>{j.origen}</td></tr> : null}
                  <tr><th scope="row">Club</th><td>{SITIO.nombre}</td></tr>
                </tbody>
              </table>
            </div>
          </Aparece>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Temporada" titulo="Promedios por" contorno="partido" />
          <div className="rejilla-stats">
            <div className="stat">
              <div className="stat-n">{j.estadisticas.puntos}</div>
              <div className="stat-l">Puntos</div>
            </div>
            <div className="stat">
              <div className="stat-n">{j.estadisticas.rebotes}</div>
              <div className="stat-l">Rebotes</div>
            </div>
            <div className="stat">
              <div className="stat-n">{j.estadisticas.asistencias}</div>
              <div className="stat-l">Asistencias</div>
            </div>
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
