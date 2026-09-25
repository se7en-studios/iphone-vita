"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#destacados", label: "Destacados" },
  { href: "#camara", label: "Cámara" },
  { href: "#colores", label: "Colores" },
  { href: "#comparar", label: "Comparar" },
];

/** Barra de producto que aparece bajo el navbar cuando el hero sale de pantalla. */
export function ProductSubnav({ name }: { name: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), {
      rootMargin: "-56px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl transition duration-500 ease-[var(--ease-soft)] ${
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
      aria-hidden={!shown}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-6 px-4 md:px-8">
        <p className="text-lg font-semibold tracking-tight text-white">
          {name}
        </p>
        <nav
          className="ml-auto hidden items-center gap-6 text-xs text-white/70 md:flex"
          aria-label="Secciones del producto"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              tabIndex={shown ? 0 : -1}
              className="transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="#tienda"
          tabIndex={shown ? 0 : -1}
          className="ml-auto rounded-full bg-[#ebd7be] px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-white md:ml-0"
        >
          Comprar
        </Link>
      </div>
    </div>
  );
}
