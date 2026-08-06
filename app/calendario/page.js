import Aparece from "@/components/Aparece";
import Partido from "@/components/Partido";
import { CabeceraPagina, CabeceraSeccion, JsonLd } from "@/components/UI";
import {
  SITIO,
  getProximosPartidos,
  getResultados,
  getRecord,
  fechaISO,
} from "@/lib/contenido";
import { meta, schemaMigas, schemaPartido } from "@/lib/seo";

export const metadata = meta({
  titulo: "Calendario de partidos y resultados",
  descripcion: `Calendario completo de ${SITIO.nombre}: próximos partidos en ${SITIO.ciudad}, sedes, horarios y todos los resultados de la temporada.`,
  ruta: "/calendario",
});

const MIGAS = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Calendario", ruta: "/calendario" },
];

export default function Calendario() {
  const proximos = getProximosPartidos();
  const resultados = getResultados();
  const record = getRecord();

  return (
    <>
      <CabeceraPagina
        migas={MIGAS}
        eyebrow="Temporada 2026 — 2027"
        titulo="Calendario"
        entradilla={`Todos los partidos de ${SITIO.nombre}: fechas, horarios, sedes y resultados. Récord actual: ${record.ganados} victorias y ${record.perdidos} derrotas.`}
      />

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Por jugar" titulo="Próximos" contorno="partidos" />
          {proximos.length > 0 ? (
            <Aparece className="lista-partidos">
              {proximos.map((p) => <Partido key={p.fecha + p.rival} p={p} />)}
            </Aparece>
          ) : (
            <p className="plomo">
              No hay partidos programados por el momento. En cuanto la liga publique el
              rol, aparecerá aquí.
            </p>
          )}
        </div>
      </section>

      {resultados.length > 0 && (
        <section className="seccion">
          <div className="contenedor">
            <CabeceraSeccion numero="Jugados" titulo="Resultados de la" contorno="temporada" />
            <div className="rejilla-stats" style={{ marginBottom: 34 }}>
              <div className="stat">
                <div className="stat-n">{record.ganados}</div>
                <div className="stat-l">Victorias</div>
              </div>
              <div className="stat">
                <div className="stat-n">{record.perdidos}</div>
                <div className="stat-l">Derrotas</div>
              </div>
              <div className="stat">
                <div className="stat-n">{record.jugados}</div>
                <div className="stat-l">Partidos jugados</div>
              </div>
            </div>
            <Aparece className="lista-partidos">
              {resultados.map((p) => <Partido key={p.fecha + p.rival} p={p} />)}
            </Aparece>
          </div>
        </section>
      )}

      {proximos.map((p) => (
        <JsonLd key={p.fecha + p.rival} datos={schemaPartido(p, fechaISO(p.fecha, p.hora))} />
      ))}
      <JsonLd datos={schemaMigas(MIGAS)} />
    </>
  );
}
