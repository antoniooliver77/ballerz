import Link from "next/link";
import Aparece from "@/components/Aparece";
import FotoJugador from "@/components/FotoJugador";
import { CabeceraPagina, CabeceraSeccion, JsonLd } from "@/components/UI";
import { SITIO, SITE_URL, getJugadores, getRamas } from "@/lib/contenido";
import { meta, schemaMigas } from "@/lib/seo";

const jugadores = getJugadores();

export const metadata = meta({
  titulo: "Roster de jugadores",
  descripcion: `Los ${jugadores.length} jugadores y jugadoras de ${SITIO.nombre}, club de basquetbol de ${SITIO.ciudad}, ${SITIO.estado}. Conoce las ramas varonil y femenil del club.`,
  ruta: "/equipo",
});

const MIGAS = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Equipo", ruta: "/equipo" },
];

export default function Equipo() {
  const ramas = getRamas();

  return (
    <>
      <CabeceraPagina
        migas={MIGAS}
        eyebrow={`${ramas.length} ramas · ${jugadores.length} en cancha`}
        titulo="Roster"
        entradilla={`Las caras que visten el escudo de ${SITIO.nombre} en ${SITIO.ciudad}. Rama varonil y rama femenil, una por una.`}
      />

      {ramas.map((rama, r) => (
        <section className="seccion" key={rama.id} id={rama.id}>
          <div className="contenedor">
            <div className="rama-cabecera">
              <h2 className="cromado">{rama.titulo}</h2>
              <span className="cuenta">
                {rama.lista.length} {rama.lista.length === 1 ? "integrante" : "integrantes"}
              </span>
            </div>
            <div className="rejilla-fotos">
              {rama.lista.map((j, i) => (
                <Aparece key={j.slug} retardo={Math.min(i * 40, 320)}>
                  <FotoJugador jugador={j} prioridad={r === 0 && i < 6} />
                </Aparece>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Pruebas" titulo="¿Falta tu" contorno="cara?" />
          <p className="plomo">
            El roster se arma cada temporada y las pruebas están abiertas todo el año en{" "}
            {SITIO.ciudad}. Si quieres entrenar en serio, escríbenos.
          </p>
          <div className="botones">
            <Link href="/contacto" className="btn btn-fuego"><span>Quiero entrar a pruebas</span></Link>
            <Link href="/cuerpo-tecnico" className="btn btn-linea"><span>Cuerpo técnico</span></Link>
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
