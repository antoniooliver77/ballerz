import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // La raíz del proyecto es esta carpeta (evita que el bundler mire hacia arriba).
  turbopack: { root: path.dirname(new URL(import.meta.url).pathname) },
};

export default nextConfig;
