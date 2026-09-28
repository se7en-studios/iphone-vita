"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Activa las animaciones de entrada de todos los [data-reveal] de la página. */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Cascada por fila: el índice se reinicia cada 4 hijos (máximo de columnas).
    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) =>
      Array.from(group.children).forEach((child, i) => {
        const el = child as HTMLElement;
        el.dataset.reveal = "";
        el.style.setProperty("--i", String(i % 4));
      }),
    );
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "120px 0px 80px 0px", threshold: 0 },
    );
    // Lo que ya está en pantalla aparece al instante; lo demás, antes de llegar.
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 100) el.classList.add("is-in");
      else io.observe(el);
    });
    document.documentElement.classList.add("reveal-ready");
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
