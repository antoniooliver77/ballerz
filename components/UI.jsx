import Link from "next/link";

/** Bloque <script type="application/ld+json"> para datos estructurados. */
export function JsonLd({ datos }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  );
}

/** Migas de pan visibles (también van en el JSON-LD de cada página). */
export function Migas({ items }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="migas">
        {items.map((it, i) =>
          i === items.length - 1 ? (
            <li key={it.ruta} aria-current="page">{it.nombre}</li>
          ) : (
            <li key={it.ruta}><Link href={it.ruta}>{it.nombre}</Link></li>
          )
        )}
      </ol>
    </nav>
  );
}

/** Cabecera estándar de página interior: h1 + entradilla. */
export function CabeceraPagina({ eyebrow, titulo, entradilla, migas }) {
  return (
    <header className="pagina-cabecera">
      <div className="contenedor">
        {migas && <Migas items={migas} />}
        {eyebrow && <p className="mono fuego" style={{ marginBottom: 14 }}>{eyebrow}</p>}
        <h1 className="cromado">{titulo}</h1>
        {entradilla && <p className="plomo" style={{ marginTop: 20 }}>{entradilla}</p>}
      </div>
    </header>
  );
}

/** Encabezado de sección con numeración y regla. */
export function CabeceraSeccion({ numero, titulo, contorno }) {
  return (
    <div className="seccion-cabecera">
      {numero && <span className="mono fuego">{numero}</span>}
      <h2>
        {titulo} {contorno && <span className="contorno">{contorno}</span>}
      </h2>
      <span className="regla" aria-hidden="true" />
    </div>
  );
}
