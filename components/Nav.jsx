"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/equipo", texto: "Equipo" },
  { href: "/cuerpo-tecnico", texto: "Cuerpo técnico" },
  { href: "/calendario", texto: "Calendario" },
  { href: "/basquetbol-en-merida", texto: "Basquetbol en Mérida" },
];

export default function Nav({ nombre }) {
  const ruta = usePathname();
  const [solida, setSolida] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alScroll = () => setSolida(window.scrollY > 40);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  return (
    <header className={`nav${solida || abierto ? " solida" : ""}`}>
      <div className="contenedor">
        <Link href="/" className="nav-marca" aria-label={`${nombre}, ir al inicio`}>
          <img src="/logo-512.png" alt="" width="38" height="33" />
          <span>{nombre}</span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className={`nav-links${abierto ? " abierto" : ""}`} id="menu-principal">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={
                    ruta === e.href || (e.href !== "/" && ruta.startsWith(e.href))
                      ? "page"
                      : undefined
                  }
                >
                  {e.texto}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contacto" className="nav-cta">
                Únete
              </Link>
            </li>
          </ul>
        </nav>

        <button
          className="nav-burger"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto((v) => !v)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
