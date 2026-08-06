import Link from "next/link";

export const metadata = {
  title: "Página no encontrada | Ballerz Mérida",
  robots: { index: false, follow: true },
};

export default function NoEncontrada() {
  return (
    <section className="cta-final" style={{ minHeight: "70svh", display: "grid", placeItems: "center" }}>
      <div className="contenedor">
        <p className="mono fuego" style={{ marginBottom: 16 }}>Error 404</p>
        <h1 className="cromado">
          Balón <br />
          <span className="contorno">perdido</span>
        </h1>
        <p className="plomo" style={{ margin: "24px auto 0" }}>
          Esta página no existe o cambió de dirección. Regresa a la duela.
        </p>
        <div className="botones" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn-fuego"><span>Volver al inicio</span></Link>
          <Link href="/equipo" className="btn btn-linea"><span>Ver el roster</span></Link>
        </div>
      </div>
    </section>
  );
}
