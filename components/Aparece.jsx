"use client";

import { useEffect, useRef } from "react";

/**
 * Revela su contenido al entrar en pantalla.
 * Usa IntersectionObserver: sin librerías y sin coste en el primer render.
 */
export default function Aparece({ children, retardo = 0, as: Tag = "div", ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("visible");
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            el.style.transitionDelay = `${retardo}ms`;
            el.classList.add("visible");
            obs.unobserve(el);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [retardo]);

  return (
    <Tag ref={ref} className={`aparece ${props.className || ""}`} {...props}>
      {children}
    </Tag>
  );
}
