import Link from "next/link";
import Aparece from "@/components/Aparece";
import { CabeceraPagina, JsonLd } from "@/components/UI";
import { SITIO, SITE_URL } from "@/lib/contenido";
import { meta, schemaFaq, schemaMigas } from "@/lib/seo";

export const metadata = meta({
  titulo: `Basquetbol en ${SITIO.ciudad}: dónde jugar, ligas y cómo empezar`,
  descripcion: `Guía para jugar basquetbol en ${SITIO.ciudad}, ${SITIO.estado}: cómo funcionan las ligas locales, qué necesitas para entrar a un equipo, categorías y dónde entrenar.`,
  ruta: "/basquetbol-en-merida",
  tipo: "article",
});

const MIGAS = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: `Basquetbol en ${SITIO.ciudad}`, ruta: "/basquetbol-en-merida" },
];

const PREGUNTAS = [
  {
    pregunta: "¿Dónde puedo jugar basquetbol en Mérida?",
    respuesta:
      "Mérida tiene canchas públicas en prácticamente todas las colonias, además de unidades deportivas municipales y gimnasios techados donde se juegan las ligas organizadas. Para jugar en competencia lo habitual es integrarse a un club que ya esté inscrito en una liga local.",
  },
  {
    pregunta: "¿Qué edad se necesita para entrar a un equipo de basquetbol?",
    respuesta:
      "Depende de la categoría. Las ligas locales suelen tener categorías infantiles, juveniles, libre y máster, así que hay competencia organizada desde la infancia hasta la edad adulta.",
  },
  {
    pregunta: "¿Cuánto cuesta jugar basquetbol en un club de Mérida?",
    respuesta:
      "Varía por club. Normalmente hay una cuota de temporada que cubre inscripción a la liga, arbitraje y uso de instalaciones. Las pruebas de ingreso suelen ser gratuitas.",
  },
  {
    pregunta: "¿Necesito ser alto para jugar basquetbol?",
    respuesta:
      "No. La estatura ayuda en las posiciones interiores, pero el basquetbol tiene cinco posiciones con perfiles distintos. Los bases y escoltas suelen ser los jugadores más bajos del equipo y son quienes manejan el ritmo del partido.",
  },
];

export default function BasquetbolEnMerida() {
  return (
    <>
      <CabeceraPagina
        migas={MIGAS}
        eyebrow="Guía local"
        titulo={`Basquetbol en ${SITIO.ciudad}`}
        entradilla={`Todo lo que necesitas saber para empezar a jugar basquetbol en ${SITIO.ciudad}, ${SITIO.estado}: dónde se juega, cómo funcionan las ligas y qué pasos dar si quieres entrar a un equipo.`}
      />

      <section className="seccion">
        <div className="contenedor">
          <Aparece className="prosa">
            <p className="plomo">
              El basquetbol en Yucatán dejó de ser un deporte de nicho hace tiempo. La
              Liga Meridana de Basquetbol reúne cada temporada a cientos de jugadores
              repartidos en decenas de equipos, y a eso se suman los torneos de barrio,
              las ligas empresariales y los circuitos juveniles. Si vives en Mérida y
              quieres jugar en serio, hay dónde.
            </p>

            <h2>Dónde se juega basquetbol en Mérida</h2>
            <p>
              La ciudad tiene tres capas de basquetbol y conviene distinguirlas antes de
              buscar equipo.
            </p>
            <p>
              <strong>Las canchas públicas</strong> son la puerta de entrada. Están en
              parques y unidades deportivas de casi todas las colonias, son gratuitas y
              es donde se arman los partidos abiertos por las tardes. Sirven para agarrar
              ritmo, pero no dan competencia estructurada.
            </p>
            <p>
              <strong>Las ligas organizadas</strong> son el siguiente escalón. Se juegan
              en gimnasios techados con arbitraje, calendario fijo y tabla de posiciones.
              Aquí es donde entra un club como {SITIO.nombre}: para participar necesitas
              estar registrado en un equipo inscrito.
            </p>
            <p>
              <strong>El basquetbol formativo</strong> lo cubren las academias y las
              categorías inferiores de los clubes, enfocadas en fundamentos antes que en
              resultados.
            </p>

            <h2>Cómo funcionan las ligas locales</h2>
            <p>
              Las ligas de la ciudad suelen dividirse por categoría de edad y por nivel.
              Una temporada típica arranca con inscripción de equipos, sigue con una fase
              regular de varias jornadas y cierra con liguilla. Los partidos se concentran
              entre semana por la noche y los fines de semana, un formato pensado para
              jugadores que además trabajan o estudian.
            </p>
            <p>
              Cada equipo registra un roster al inicio de la temporada, así que los
              periodos de inscripción marcan cuándo es más fácil entrar a un club. Fuera
              de esas fechas todavía puedes entrenar y esperar el siguiente registro.
            </p>

            <h2>Qué necesitas para entrar a un equipo</h2>
            <ul>
              <li>Ropa deportiva y tenis con suela limpia para duela.</li>
              <li>Identificación oficial o acta de nacimiento, según la categoría.</li>
              <li>Disponibilidad real para entrenar entre semana.</li>
              <li>Disposición a aprender un sistema de juego, aunque ya sepas jugar.</li>
            </ul>
            <p>
              Lo que no necesitas es experiencia previa en liga ni una estatura
              determinada. La mayoría de los clubes, incluido el nuestro, evalúa la
              actitud y el compromiso antes que el nivel técnico con el que llegas.
            </p>

            <h2>Las cinco posiciones, en corto</h2>
            <p>
              Si vas a entrar a pruebas, ayuda saber en qué posición te vas a sentir
              cómodo. El <strong>base</strong> dirige el ataque y toma la mayoría de las
              decisiones. El <strong>escolta</strong> es el anotador exterior. El{" "}
              <strong>alero</strong> equilibra ataque y defensa en el perímetro. El{" "}
              <strong>ala-pívot</strong> trabaja entre la pintura y la media distancia.
              El <strong>pívot</strong> domina el aro en ambos lados de la cancha.
            </p>
            <p>
              Nadie espera que llegues encasillado. En la prueba se ve dónde encajas.
            </p>

            <h2>Cómo entrar a {SITIO.nombre}</h2>
            <p>
              {SITIO.nombre} es un club de {SITIO.ciudad} con pruebas abiertas durante
              todo el año. El proceso es simple: nos escribes, te damos día y sede,
              entrenas una sesión completa con el equipo y de ahí se decide la
              integración. La prueba no tiene costo.
            </p>
            <p>
              Puedes ver{" "}
              <Link href="/equipo">el roster actual</Link>, conocer al{" "}
              <Link href="/cuerpo-tecnico">cuerpo técnico</Link> o revisar{" "}
              <Link href="/calendario">el calendario de partidos</Link> antes de dar el
              paso.
            </p>

            <div className="botones">
              <Link href="/contacto" className="btn btn-fuego">
                <span>Agendar mi prueba</span>
              </Link>
            </div>
          </Aparece>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <h2 style={{ marginBottom: 28 }}>
            Preguntas <span className="contorno">frecuentes</span>
          </h2>
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
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `Basquetbol en ${SITIO.ciudad}: dónde jugar, ligas y cómo empezar`,
          description: `Guía para jugar basquetbol en ${SITIO.ciudad}, ${SITIO.estado}.`,
          inLanguage: "es-MX",
          author: { "@type": "Organization", name: SITIO.nombreCompleto },
          publisher: { "@id": `${SITE_URL}/#equipo` },
          mainEntityOfPage: `${SITE_URL}/basquetbol-en-merida`,
        }}
      />
    </>
  );
}
