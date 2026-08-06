import Link from "next/link";
import Aparece from "@/components/Aparece";
import { CabeceraPagina, CabeceraSeccion, JsonLd } from "@/components/UI";
import { SITIO, getStaff, getHeadCoach } from "@/lib/contenido";
import { meta, schemaEntrenador, schemaMigas } from "@/lib/seo";

const coach = getHeadCoach();

export const metadata = meta({
  titulo: `Cuerpo técnico — ${coach ? coach.nombre : "Staff"}`,
  descripcion: `${coach ? `${coach.nombre} es Head Coach de ${SITIO.nombre}` : `Cuerpo técnico de ${SITIO.nombre}`}, club de basquetbol de ${SITIO.ciudad}, ${SITIO.estado}. Conoce al staff que dirige al equipo y su filosofía de juego.`,
  ruta: "/cuerpo-tecnico",
});

const MIGAS = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Cuerpo técnico", ruta: "/cuerpo-tecnico" },
];

export default function CuerpoTecnico() {
  const staff = getStaff();

  return (
    <>
      <CabeceraPagina
        migas={MIGAS}
        eyebrow="La banca"
        titulo="Cuerpo técnico"
        entradilla={`Quienes diseñan la temporada, el sistema de juego y el desarrollo de cada jugador de ${SITIO.nombre}.`}
      />

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Staff" titulo="Quién dirige el" contorno="proyecto" />

          <div style={{ display: "grid", gap: 20 }}>
            {staff.map((p, i) => (
              <Aparece key={p.slug} retardo={i * 70} className="coach">
                <div className="coach-visual">
                  {p.foto ? (
                    <img
                      src={`/staff/${p.foto}`}
                      alt={`${p.nombre}, ${p.cargo} de ${SITIO.nombre}`}
                      width="320"
                      height="320"
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  ) : (
                    <span className="coach-iniciales" aria-hidden="true">
                      {p.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  )}
                </div>
                <div className="coach-datos">
                  <p className="coach-cargo">{p.cargo}</p>
                  <h2 style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)" }}>{p.nombre}</h2>
                  <p style={{ marginTop: 16, color: "var(--tenue)" }}>{p.bio}</p>
                  {p.filosofia && <blockquote className="cita">“{p.filosofia}”</blockquote>}
                </div>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="Metodología" titulo="Cómo" contorno="entrenamos" />
          <div className="rejilla-tarjetas">
            <Aparece className="tarjeta">
              <h3>Defensa primero</h3>
              <p>
                El sistema arranca en la defensa. Rotaciones, comunicación y esfuerzo
                sostenido: es lo que se puede controlar todos los días, sin importar si
                el tiro entra o no.
              </p>
            </Aparece>
            <Aparece retardo={80} className="tarjeta">
              <h3>Desarrollo individual</h3>
              <p>
                Cada jugador tiene objetivos propios de temporada. El trabajo individual
                antes y después del entrenamiento colectivo es parte del plan, no un extra.
              </p>
            </Aparece>
            <Aparece retardo={160} className="tarjeta">
              <h3>Lectura de juego</h3>
              <p>
                Menos jugadas memorizadas y más principios. Queremos jugadores que
                entiendan por qué se toma cada decisión en la duela.
              </p>
            </Aparece>
          </div>

          <div className="botones">
            <Link href="/contacto" className="btn btn-fuego"><span>Entrenar con nosotros</span></Link>
            <Link href="/equipo" className="btn btn-linea"><span>Ver el roster</span></Link>
          </div>
        </div>
      </section>

      {staff.map((p) => <JsonLd key={p.slug} datos={schemaEntrenador(p)} />)}
      <JsonLd datos={schemaMigas(MIGAS)} />
    </>
  );
}
