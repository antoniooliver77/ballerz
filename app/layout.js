/* Tipografías auto-alojadas: no dependen de Google Fonts en tiempo de ejecución,
   así que no hay petición externa que bloquee el render. */
import "@fontsource/anton/latin-400.css";
import "@fontsource/barlow-condensed/latin-300.css";
import "@fontsource/barlow-condensed/latin-400.css";
import "@fontsource/barlow-condensed/latin-500.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/space-mono/latin-400.css";
import "@fontsource/space-mono/latin-700.css";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/UI";
import { SITIO, SITE_URL } from "@/lib/contenido";
import { schemaOrganizacion, schemaSitio } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITIO.nombre} — Club de basquetbol en ${SITIO.ciudad}, ${SITIO.estado}`,
    template: "%s",
  },
  description: SITIO.descripcionCorta,
  applicationName: SITIO.nombre,
  keywords: [
    "basquetbol Mérida",
    "básquetbol Yucatán",
    "equipo de basquetbol Mérida",
    "club de baloncesto Mérida",
    "Ballerz",
    "pruebas de basquetbol Mérida",
    "liga meridana de basquetbol",
  ],
  authors: [{ name: SITIO.nombreCompleto }],
  creator: SITIO.nombreCompleto,
  publisher: SITIO.nombreCompleto,
  formatDetection: { telephone: true, address: false, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  alternates: { canonical: SITE_URL },
};

export const viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <body>
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>
        <Nav nombre={SITIO.nombre} />
        <main id="contenido">{children}</main>
        <Footer />
        <JsonLd datos={schemaOrganizacion()} />
        <JsonLd datos={schemaSitio()} />
      </body>
    </html>
  );
}
