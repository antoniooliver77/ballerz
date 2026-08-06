import Link from "next/link";
import HeroLogo from "@/components/HeroLogo";
import Aparece from "@/components/Aparece";
import FotoJugador from "@/components/FotoJugador";
import Partido from "@/components/Partido";
import { CabeceraSeccion, JsonLd } from "@/components/UI";
import {
  SITIO,
  getJugadores,
  getJugadoresPorRama,
  getProximosPartidos,
  getResultados,
  getHeadCoach,
  fechaISO,
} from "@/lib/contenido";
import { meta, schemaPartido } from "@/lib/seo";

export const metadata = meta({
  titulo: `${SITIO.nombre} — Club de basquetbol en ${SITIO.ciudad}, ${SITIO.estado}`,
  descripcion: `${SITIO.nombre} es un club de basquetbol de ${SITIO.ciudad}, ${SITIO.estado}, con rama varonil y femenil. Conoce el roster, el cuerpo técnico y cómo entrar a pruebas.`,
  ruta: "/",
});

export default function Inicio() {
  const jugadores = getJugadores();
  const varonil = getJugadoresPorRama("varonil");
  const femenil = getJugadoresPorRama("femenil");
  const proximos = getProximosPartidos().slice(0, 3);
  const resultados = getResultados().slice(0, 2);
  const coach = getHeadCoach();

  // una muestra equilibrada de las dos ramas para la portada
  const muestra = [...varonil.slice(0, 4), ...femenil.slice(0, 4)];

  // la sección del calendario solo existe si hay partidos reales, así que la
  // numeración de las secciones siguientes se corre para no dejar huecos
  const hayCalendario = proximos.length > 0 || resultados.length > 0;
  const nBanca = hayCalendario ? "05" : "04";

  return (
    <>
      <HeroLogo
        nombre={SITIO.nombre}
        lema={SITIO.lema}
        datos={[
          { etiqueta: "Sede", valor: `${SITIO.ciudad}, ${SITIO.estado}` },
          { etiqueta: "Roster", valor: `${jugadores.length} en cancha` },
          { etiqueta: "Ramas", valor: "Varonil y femenil" },
        ]}
      />

      {/* ---------- quiénes somos ---------- */}
      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="01 / El club" titulo="Quiénes" contorno="somos" />
          <Aparece>
            <p className="plomo">{SITIO.descripcionLarga}</p>
            <div className="botones">
              <Link href="/equipo" className="btn btn-fuego"><span>Ver el roster</span></Link>
              <Link href="/contacto" className="btn btn-linea"><span>Quiero entrar a pruebas</span></Link>
            </div>
          </Aparece>
        </div>
      </section>

      {/* ---------- el club en números reales ---------- */}
      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="02 / El club" titulo="En" contorno="números" />
          <Aparece className="rejilla-stats">
            <div className="stat">
              <div className="stat-n">{jugadores.length}</div>
              <div className="stat-l">En el roster</div>
            </div>
            <div className="stat">
              <div className="stat-n">{varonil.length}</div>
              <div className="stat-l">Rama varonil</div>
            </div>
            <div className="stat">
              <div className="stat-n">{femenil.length}</div>
              <div className="stat-l">Rama femenil</div>
            </div>
            <div className="stat">
              <div className="stat-n">{SITIO.fundacion}</div>
              <div className="stat-l">Desde</div>
            </div>
          </Aparece>
        </div>
      </section>

      {/* ---------- roster ---------- */}
      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="03 / Roster" titulo="Las caras del" contorno="club" />
          <div className="rejilla-fotos">
            {muestra.map((j, i) => (
              <Aparece key={j.slug} retardo={Math.min(i * 45, 300)}>
                <FotoJugador jugador={j} prioridad={i < 4} />
              </Aparece>
            ))}
          </div>
          <div className="botones">
            <Link href="/equipo" className="btn btn-fuego"><span>Roster completo</span></Link>
          </div>
        </div>
      </section>

      {/* ---------- calendario: solo si hay partidos reales ---------- */}
      {hayCalendario && (
        <section className="seccion">
          <div className="contenedor">
            <CabeceraSeccion numero="04 / Calendario" titulo="Próximos" contorno="partidos" />
            {proximos.length > 0 && (
              <Aparece className="lista-partidos">
                {proximos.map((p) => <Partido key={p.fecha + p.rival} p={p} />)}
              </Aparece>
            )}

            {resultados.length > 0 && (
              <>
                <h3 style={{ margin: "50px 0 20px" }}>Últimos resultados</h3>
                <div className="lista-partidos">
                  {resultados.map((p) => <Partido key={p.fecha + p.rival} p={p} />)}
                </div>
              </>
            )}

            <div className="botones">
              <Link href="/calendario" className="btn btn-linea"><span>Calendario completo</span></Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- cuerpo técnico ---------- */}
      {coach && (
        <section className="seccion">
          <div className="contenedor">
            <CabeceraSeccion numero={`${nBanca} / Banca`} titulo="Cuerpo" contorno="técnico" />
            <Aparece className="coach">
              <div className="coach-visual">
                {coach.foto ? (
                  <img
                    src={`/staff/${coach.foto}`}
                    alt={`${coach.nombre}, ${coach.cargo} de ${SITIO.nombre}`}
                    width="632"
                    height="872"
                    loading="lazy"
                  />
                ) : (
                  <span className="coach-iniciales" aria-hidden="true">
                    {coach.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                )}
              </div>
              <div className="coach-datos">
                <p className="coach-cargo">{coach.cargo}</p>
                <h3>{coach.nombre}</h3>
                {coach.bio && (
                  <p style={{ marginTop: 14, color: "var(--tenue)" }}>
                    {coach.bio.split("\n\n")[0]}
                  </p>
                )}
                {coach.trayectoria?.length > 0 && (
                  <>
                    <p className="trayectoria-titulo">Como jugador</p>
                    <ul className="trayectoria">
                      {coach.trayectoria.map((eq) => <li key={eq}>{eq}</li>)}
                    </ul>
                  </>
                )}
                <div className="botones">
                  <Link href="/cuerpo-tecnico" className="btn btn-linea">
                    <span>Todo el cuerpo técnico</span>
                  </Link>
                </div>
              </div>
            </Aparece>
          </div>
        </section>
      )}

      {/* ---------- cierre ---------- */}
      <section className="cta-final">
        <div className="contenedor">
          <Aparece>
            <h2 className="cromado">
              No vengas <br />
              <span className="contorno">a mirar</span>
            </h2>
            <p className="plomo" style={{ margin: "26px auto 0" }}>
              Pruebas abiertas todo el año en {SITIO.ciudad}, para las dos ramas.
              No importa tu nivel: importa que aparezcas.
            </p>
            <div className="botones" style={{ justifyContent: "center" }}>
              <Link href="/contacto" className="btn btn-fuego"><span>Únete a Ballerz</span></Link>
            </div>
          </Aparece>
        </div>
      </section>

      {proximos.map((p) => (
        <JsonLd key={p.fecha + p.rival} datos={schemaPartido(p, fechaISO(p.fecha, p.hora))} />
      ))}
    </>
  );
}
