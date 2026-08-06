import { SITIO, SITE_URL } from "./contenido";

/**
 * Construye el objeto `metadata` de una página.
 * Cada ruta del sitio llama a esta función para tener título, descripción,
 * canonical y Open Graph consistentes.
 */
export function meta({ titulo, descripcion, ruta = "/", imagen = "/og.jpg", tipo = "website" }) {
  const url = `${SITE_URL}${ruta}`;
  const tituloCompleto =
    ruta === "/" ? titulo : `${titulo} | ${SITIO.nombre} ${SITIO.ciudad}`;

  return {
    title: tituloCompleto,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      title: tituloCompleto,
      description: descripcion,
      url,
      siteName: `${SITIO.nombre} — Basquetbol en ${SITIO.ciudad}`,
      locale: "es_MX",
      type: tipo,
      images: [{ url: `${SITE_URL}${imagen}`, width: 1200, height: 630, alt: `Escudo de ${SITIO.nombre}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: descripcion,
      images: [`${SITE_URL}${imagen}`],
    },
  };
}

/* ---------------- Datos estructurados (JSON-LD) ---------------- */

export function schemaOrganizacion() {
  const redes = Object.values(SITIO.redes).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "@id": `${SITE_URL}/#equipo`,
    name: SITIO.nombre,
    alternateName: SITIO.nombreCompleto,
    sport: "Basketball",
    description: SITIO.descripcionLarga,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512.png`,
    image: `${SITE_URL}/og.jpg`,
    foundingDate: SITIO.fundacion,
    ...(redes.length ? { sameAs: redes } : {}),
    location: {
      "@type": "Place",
      name: SITIO.sede.nombre,
      address: {
        "@type": "PostalAddress",
        addressLocality: SITIO.ciudad,
        addressRegion: SITIO.estado,
        addressCountry: SITIO.codigoPais,
      },
    },
    areaServed: {
      "@type": "City",
      name: `${SITIO.ciudad}, ${SITIO.estado}`,
    },
  };
}

export function schemaSitio() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#sitio`,
    url: SITE_URL,
    name: `${SITIO.nombre} — Basquetbol en ${SITIO.ciudad}`,
    inLanguage: "es-MX",
    publisher: { "@id": `${SITE_URL}/#equipo` },
  };
}

export function schemaMigas(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.nombre,
      item: `${SITE_URL}${it.ruta}`,
    })),
  };
}

export function schemaJugador(j) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: j.nombre,
    jobTitle: "Jugador de basquetbol",
    url: `${SITE_URL}/equipo/${j.slug}`,
    memberOf: { "@id": `${SITE_URL}/#equipo` },
    ...(j.foto ? { image: `${SITE_URL}/jugadores/${j.foto}` } : {}),
  };
}

export function schemaEntrenador(p) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.nombre,
    jobTitle: p.cargo,
    url: `${SITE_URL}/cuerpo-tecnico`,
    worksFor: { "@id": `${SITE_URL}/#equipo` },
    ...(p.bio ? { description: p.bio } : {}),
  };
}

export function schemaPartido(p, fechaIso) {
  const rivalEquipo = { "@type": "SportsTeam", name: p.rival };
  const nuestro = { "@type": "SportsTeam", name: SITIO.nombre, "@id": `${SITE_URL}/#equipo` };
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: p.local ? `${SITIO.nombre} vs ${p.rival}` : `${p.rival} vs ${SITIO.nombre}`,
    sport: "Basketball",
    startDate: fechaIso,
    eventStatus:
      p.estado === "cancelado"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    homeTeam: p.local ? nuestro : rivalEquipo,
    awayTeam: p.local ? rivalEquipo : nuestro,
    competitor: [nuestro, rivalEquipo],
    location: {
      "@type": "Place",
      name: p.sede,
      address: {
        "@type": "PostalAddress",
        addressLocality: SITIO.ciudad,
        addressRegion: SITIO.estado,
        addressCountry: SITIO.codigoPais,
      },
    },
    superEvent: { "@type": "SportsOrganization", name: p.torneo },
    url: `${SITE_URL}/calendario`,
  };
}

export function schemaFaq(preguntas) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: p.respuesta },
    })),
  };
}
