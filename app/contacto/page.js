import Aparece from "@/components/Aparece";
import { CabeceraPagina, CabeceraSeccion, JsonLd } from "@/components/UI";
import { SITIO } from "@/lib/contenido";
import { meta, schemaFaq, schemaMigas } from "@/lib/seo";

export const metadata = meta({
  titulo: `Pruebas y contacto — Únete a ${SITIO.nombre}`,
  descripcion: `¿Quieres jugar basquetbol en ${SITIO.ciudad}? ${SITIO.nombre} tiene pruebas abiertas todo el año. Escríbenos y te decimos día, hora y qué llevar.`,
  ruta: "/contacto",
});

const MIGAS = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Contacto", ruta: "/contacto" },
];

const PREGUNTAS = [
  {
    pregunta: "¿Necesito experiencia previa para entrar a pruebas?",
    respuesta:
      "No. Recibimos jugadores de todos los niveles. Lo que evaluamos en la prueba es actitud, disposición a entrenar y capacidad de aprender, no lo que ya sabes hacer.",
  },
  {
    pregunta: "¿Cuándo son las pruebas de Ballerz en Mérida?",
    respuesta:
      "Las pruebas están abiertas todo el año. Escríbenos por el formulario o por Facebook y te confirmamos el próximo día y horario disponible.",
  },
  {
    pregunta: "¿Qué necesito llevar a la prueba?",
    respuesta:
      "Ropa deportiva, tenis de basquetbol o de suela limpia para duela, agua y una identificación. Nada más.",
  },
  {
    pregunta: "¿El club tiene rama femenil?",
    respuesta:
      "Sí. Ballerz compite con rama varonil y rama femenil, y las pruebas están abiertas para las dos.",
  },
  {
    pregunta: "¿Hay costo por entrenar con el club?",
    respuesta:
      "Escríbenos y te explicamos las condiciones de la temporada antes de que decidas nada.",
  },
  {
    pregunta: "¿Dónde entrena Ballerz?",
    respuesta: `Entrenamos en ${SITIO.ciudad}, ${SITIO.estado}. La sede exacta y los horarios se confirman al momento de agendar tu prueba.`,
  },
];

export default function Contacto() {
  const asunto = encodeURIComponent(`Quiero entrar a pruebas — ${SITIO.nombre}`);
  const correo = SITIO.contacto.correo;
  const facebook = SITIO.redes.facebook;

  return (
    <>
      <CabeceraPagina
        migas={MIGAS}
        eyebrow="Pruebas abiertas"
        titulo="Únete al equipo"
        entradilla={`No importa el nivel con el que llegues. Si quieres entrenar basquetbol en serio en ${SITIO.ciudad}, este es el primer paso.`}
      />

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="01" titulo="Escríbenos" contorno="directo" />
          <Aparece>
            <p className="plomo" style={{ marginBottom: 30 }}>
              {correo
                ? "Mándanos un mensaje con tu nombre, edad y experiencia. Te respondemos con el día y la hora de la siguiente prueba."
                : "Escríbenos por Facebook con tu nombre, edad y experiencia, y te respondemos con el día y la hora de la siguiente prueba."}
            </p>

            {!correo && facebook && (
              <div className="botones" style={{ marginTop: 0, marginBottom: 34 }}>
                <a
                  href={facebook}
                  className="btn btn-fuego"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Escribirnos por Facebook</span>
                </a>
              </div>
            )}

            {correo && (
            <form
              className="formulario"
              action={`mailto:${correo}`}
              method="post"
              encType="text/plain"
            >
              <div className="campo">
                <label htmlFor="nombre">Nombre completo</label>
                <input id="nombre" name="nombre" type="text" required autoComplete="name" />
              </div>
              <div className="campo">
                <label htmlFor="correo">Correo electrónico</label>
                <input id="correo" name="correo" type="email" required autoComplete="email" />
              </div>
              <div className="campo">
                <label htmlFor="edad">Edad</label>
                <input id="edad" name="edad" type="number" min="10" max="70" />
              </div>
              <div className="campo">
                <label htmlFor="rama">Rama</label>
                <select id="rama" name="rama" defaultValue="">
                  <option value="" disabled>Elige una</option>
                  <option>Varonil</option>
                  <option>Femenil</option>
                </select>
              </div>
              <div className="campo">
                <label htmlFor="mensaje">Cuéntanos tu experiencia</label>
                <textarea id="mensaje" name="mensaje" />
              </div>
              <div>
                <button type="submit" className="btn btn-fuego"><span>Enviar solicitud</span></button>
              </div>
            </form>
            )}

            {correo && (
              <p style={{ marginTop: 26, color: "var(--tenue-2)", fontSize: "0.95rem" }}>
                ¿Prefieres el correo directo?{" "}
                <a href={`mailto:${correo}?subject=${asunto}`} style={{ color: "var(--fuego)" }}>
                  {correo}
                </a>
              </p>
            )}
          </Aparece>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="02" titulo="Cómo es el" contorno="proceso" />
          <div className="rejilla-tarjetas">
            <Aparece className="tarjeta">
              <h3>1. Nos escribes</h3>
              <p>Nos dices quién eres y qué buscas. Te contestamos con fecha y sede.</p>
            </Aparece>
            <Aparece retardo={80} className="tarjeta">
              <h3>2. Vienes a entrenar</h3>
              <p>
                Una sesión completa con el equipo. Sin costo y sin compromiso: es tanto
                para que te veamos como para que veas cómo trabajamos.
              </p>
            </Aparece>
            <Aparece retardo={160} className="tarjeta">
              <h3>3. Te integras</h3>
              <p>
                Si hay match, entras al roster y arrancas la pretemporada con el resto del
                equipo.
              </p>
            </Aparece>
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <CabeceraSeccion numero="03" titulo="Preguntas" contorno="frecuentes" />
          <div className="faq">
            {PREGUNTAS.map((p) => (
              <Aparece key={p.pregunta} className="faq-item">
                <h3>{p.pregunta}</h3>
                <p>{p.respuesta}</p>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      <JsonLd datos={schemaFaq(PREGUNTAS)} />
      <JsonLd datos={schemaMigas(MIGAS)} />
    </>
  );
}
