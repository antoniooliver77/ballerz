import { SITE_URL, getJugadores } from "@/lib/contenido";

export default function sitemap() {
  const ahora = new Date();

  const fijas = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" },
    { url: "/equipo", priority: 0.9, changeFrequency: "monthly" },
    { url: "/calendario", priority: 0.9, changeFrequency: "weekly" },
    { url: "/cuerpo-tecnico", priority: 0.7, changeFrequency: "monthly" },
    { url: "/contacto", priority: 0.8, changeFrequency: "monthly" },
    { url: "/basquetbol-en-merida", priority: 0.7, changeFrequency: "monthly" },
  ];

  const jugadores = getJugadores().map((j) => ({
    url: `/equipo/${j.slug}`,
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  return [...fijas, ...jugadores].map((p) => ({
    url: `${SITE_URL}${p.url}`,
    lastModified: ahora,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
