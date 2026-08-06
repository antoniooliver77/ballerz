import Link from "next/link";
import HeroLogo from "@/components/HeroLogo";
import Aparece from "@/components/Aparece";
import Partido from "@/components/Partido";
import { CabeceraSeccion, JsonLd } from "@/components/UI";
import {
  SITIO,
  getJugadores,
  getProximosPartidos,
  getResultados,
  getRecord,
  getPromediosEquipo,
  getHeadCoach,
  fechaISO,
} from "@/lib/contenido";
import { meta, schemaPartido } from "@/lib/seo";

export const metadata = meta({
  titulo: `${SITIO.nombre} — Club de basquetbol en ${SITIO.ciudad}, ${SITIO.estado}`,
  descripcion: `${SITIO.nombre} es un club de basquetbol de ${SITIO.ciudad}, ${SITIO.estado}. Conoce el roster, el cuerpo técnico, el calendario de partidos y cómo entrar a pruebas.`,
  ruta: "/",
});

export default function Inicio() {
  const jugadores = getJugadores();
  const proximos = getProximosPartidos().slice(0, 3);
  const resultados = getResultados().slice(0, 2);
  const record = getRecord();
  const prom = getPromediosEquipo();
  const coach = getHeadCoach();

  return (
    <>
      <HeroLogo
        nombre={SITIO.nombre}
        lema={SITIO.lema}
        datos={[
          { etiqueta: "Sede", valor: `${SITIO.ciudad}, ${SITIO.estado}` },
          { etiqueta: "Roster", valor: `${jugadores.length} jugadores` },
          { etiqueta: "Récord", valor: `${record.ganados}-${record.perdidos}` },
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

      {/* ---------- números ---------- */}
      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="02 / Temporada" titulo="Los" contorno="números" />
          <Aparece className="rejilla-stats">
            <div className="stat">
              <div className="stat-n">{record.ganados}-{record.perdidos}</div>
              <div className="stat-l">Récord</div>
            </div>
            <div className="stat">
              <div className="stat-n">{prom.puntos}</div>
              <div className="stat-l">Puntos por juego</div>
            </div>
            <div className="stat">
              <div className="stat-n">{prom.rebotes}</div>
              <div className="stat-l">Rebotes por juego</div>
            </div>
            <div className="stat">
              <div className="stat-n">{jugadores.length}</div>
              <div className="stat-l">Jugadores en plantilla</div>
            </div>
          </Aparece>
        </div>
      </section>

      {/* ---------- roster ---------- */}
      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="03 / Roster" titulo="El" contorno="quinteto" />
          <div className="rejilla-jugadores">
            {jugadores.slice(0, 8).map((j, i) => (
              <Aparece key={j.slug} retardo={i * 55} as="article" className="jugador">
                <span className="jugador-dorsal" aria-hidden="true">{j.dorsal}</span>
                <p className="jugador-pos">{j.posicion}</p>
                <h3>{j.nombre}</h3>
                <p className="jugador-meta">
                  <span><b>{j.estadisticas.puntos}</b> PTS</span>
                  <span><b>{j.estadisticas.rebotes}</b> REB</span>
                </p>
                <Link href={`/equipo/${j.slug}`} className="jugador-enlace">
                  <span style={{ position: "absolute", left: -9999 }}>
                    Ver la ficha de {j.nombre}
                  </span>
                </Link>
              </Aparece>
            ))}
          </div>
          <div className="botones">
            <Link href="/equipo" className="btn btn-linea"><span>Roster completo</span></Link>
          </div>
        </div>
      </section>

      {/* ---------- calendario ---------- */}
      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="04 / Calendario" titulo="Próximos" contorno="partidos" />
          {proximos.length > 0 ? (
            <Aparece className="lista-partidos">
              {proximos.map((p) => <Partido key={p.fecha + p.rival} p={p} />)}
            </Aparece>
          ) : (
            <p className="plomo">Aún no hay partidos programados. Vuelve pronto.</p>
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

      {/* ---------- cuerpo técnico ---------- */}
      {coach && (
        <section className="seccion">
          <div className="contenedor">
            <CabeceraSeccion numero="05 / Banca" titulo="Cuerpo" contorno="técnico" />
            <Aparece className="coach">
              <div className="coach-visual">
                <span className="coach-iniciales" aria-hidden="true">
                  {coach.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div className="coach-datos">
                <p className="coach-cargo">{coach.cargo}</p>
                <h3>{coach.nombre}</h3>
                <p style={{ marginTop: 14, color: "var(--tenue)" }}>{coach.bio}</p>
                {coach.filosofia && <blockquote className="cita">“{coach.filosofia}”</blockquote>}
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
              Pruebas abiertas todo el año en {SITIO.ciudad}. No importa tu nivel:
              importa que aparezcas.
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
