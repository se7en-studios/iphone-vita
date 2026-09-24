"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Activa las animaciones de entrada de todos los [data-reveal] de la página. */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    // Lo que ya está en pantalla aparece al instante; lo demás, al llegar.
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("is-in");
      else io.observe(el);
    });
    document.documentElement.classList.add("reveal-ready");
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
