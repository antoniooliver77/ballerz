import Link from "next/link";
import { SITIO } from "@/lib/contenido";

export default function Footer() {
  const redes = Object.entries(SITIO.redes).filter(([, v]) => v);
  const anio = 2026;

  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="pie-rejilla">
          <div className="pie-marca">
            <img src="/logo-512.png" alt={`Escudo de ${SITIO.nombre}`} width="84" height="73" />
            <p style={{ color: "var(--tenue)", fontSize: "0.95rem" }}>
              {SITIO.descripcionCorta}
            </p>
          </div>

          <div>
            <h4>El club</h4>
            <ul>
              <li><Link href="/equipo">Roster</Link></li>
              <li><Link href="/cuerpo-tecnico">Cuerpo técnico</Link></li>
              <li><Link href="/calendario">Calendario</Link></li>
            </ul>
          </div>

          <div>
            <h4>Súmate</h4>
            <ul>
              <li><Link href="/contacto">Pruebas y contacto</Link></li>
              <li><Link href="/basquetbol-en-merida">Basquetbol en Mérida</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contacto</h4>
            <ul>
              {SITIO.contacto.correo && (
                <li><a href={`mailto:${SITIO.contacto.correo}`}>{SITIO.contacto.correo}</a></li>
              )}
              {SITIO.contacto.telefono && (
                <li><a href={`tel:${SITIO.contacto.telefono}`}>{SITIO.contacto.telefono}</a></li>
              )}
              {redes.map(([nombre, url]) => (
                <li key={nombre}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pie-legal mono">
          <span>
            © {anio} {SITIO.nombreCompleto} — {SITIO.ciudad}, {SITIO.estado}
          </span>
          <span className="pie-credito">
            Página creada por{" "}
            <a href="https://oliverbarona.com" target="_blank" rel="noopener noreferrer">
              Oliver Barona
            </a>{" "}
            de{" "}
            <a href="https://disruptia.org" target="_blank" rel="noopener noreferrer">
              DIsruptIA
            </a>
          </span>
          <span>Hecho en Mérida</span>
        </div>
      </div>
    </footer>
  );
}
