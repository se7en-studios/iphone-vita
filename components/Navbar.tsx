"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "./cart/CartProvider";
import { SearchDialog } from "./SearchDialog";
import { Wordmark } from "./Wordmark";
import {
  ArrowIcon,
  BagIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from "./ui/Icons";

export const NAV = [
  { label: "iPhone", href: "/productos?categoria=iphone&condicion=nuevo" },
  { label: "Plan Canje", href: "/#plan-canje" },
  { label: "Mac", href: "/productos?categoria=mac" },
  { label: "iPad", href: "/productos?categoria=ipad" },
  { label: "Watch", href: "/productos?categoria=apple-watch" },
  { label: "Accesorios", href: "/productos?categoria=accesorios" },
  { label: "Semi Nuevos", href: "/productos?condicion=semi-nuevo" },
  { label: "Todos", href: "/productos" },
];

const MORPH = "duration-500 ease-[var(--ease-out-expo)]";

/**
 * Mientras la navbar está en su lugar (arriba de todo, con la barra del dólar a la vista) es
 * una barra normal a lo ancho. Cuando queda pegada arriba se despega en isla: se angosta, baja
 * 12px, se redondea y aparece el vidrio, con transición; al volver, al revés. Solo cambian
 * margen, ancho, radio y translate: el alto en el flujo no se mueve y la página no salta.
 */
function Bar({
  island,
  className = "",
  children,
}: {
  island: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`pointer-events-auto relative isolate mx-auto flex h-14 items-center transition-[max-width,padding,border-radius,translate] ${MORPH} ${
        island
          ? "max-w-6xl translate-y-3 rounded-[28px] pl-5 pr-2 md:pl-6"
          : "max-w-7xl rounded-none px-4 md:px-8"
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className={`glass-layer transition-opacity ${MORPH} ${island ? "opacity-100" : "opacity-0"}`}
      />
      {children}
    </div>
  );
}

export function Navbar() {
  const { count, setOpen, products } = useCart();
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [island, setIsland] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  /*
   * Isla solo con la navbar pegada arriba: el centinela marca su lugar en el flujo y, cuando
   * sale por arriba de la pantalla, la navbar quedó sticky. Con un umbral de scroll fijo, al
   * subir la isla seguía flotando suelta bajo la barra del dólar (cortada) hasta el final.
   */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setIsland(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* 1px compensado con margen negativo: con alto cero, algunos navegadores no reportan la intersección. */}
      <div ref={sentinel} aria-hidden="true" className="-mb-px h-px" />
      {/* Con isla, el header es solo el aire alrededor: no captura clics, así lo que pasa por
          debajo se sigue pudiendo tocar, y la isla lleva todo. */}
      <header
        className={`pointer-events-none sticky top-0 z-50 border-b text-fg transition-[padding,border-color] ${MORPH} ${
          island ? "border-transparent px-3 md:px-6" : "border-fg/10"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {/* Borde de scroll como en iOS: lo que sube por detrás de la isla se apaga y se desenfoca
            hasta desaparecer, en vez de asomarse cortado arriba y a los costados. */}
        <div
          aria-hidden="true"
          className={`scroll-edge absolute inset-x-0 top-0 -z-10 h-[calc(100%+1.75rem)] transition-opacity ${MORPH} ${
            island ? "opacity-100" : "opacity-0"
          }`}
        />
        <Bar island={island} className="gap-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-85">
            <Wordmark dark />
          </Link>
          <nav
            className="hidden flex-1 justify-center items-center gap-1 text-xs text-fg/70 lg:flex"
            aria-label="Principal"
          >
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-fg/10 hover:text-fg"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <Link
              href="/encontra-tu-iphone"
              className="mr-2 hidden items-center gap-1.5 rounded-full border border-vita/30 bg-vita-soft px-3 py-1 text-xs font-medium text-vita transition-all duration-200 hover:border-vita/60 xl:flex"
            >
              <span>Encontrá tu iPhone</span>
              <ArrowIcon className="size-3" />
            </Link>
            <button
              type="button"
              onClick={() => setSearch(true)}
              aria-label="Buscar"
              className="grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg transition-colors"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Carrito, ${count} productos`}
              className="relative grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg transition-colors"
            >
              <BagIcon />
              {count > 0 && (
                <span
                  key={count}
                  className="pop tabular absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-champagne px-1 text-[10px] font-bold leading-4 text-black shadow-[0_0_8px_rgba(235,215,190,0.5)]"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Abrir menú"
              className="grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg transition-colors lg:hidden"
            >
              <MenuIcon />
            </button>
          </div>
        </Bar>
      </header>

      {/* Menú mobile */}
      <div
        className={`fixed inset-0 z-[65] bg-bg/85 text-fg backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-300 lg:hidden overflow-y-auto ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!menu}
        inert={!menu}
      >
        {/* La misma barra que la navbar, en el mismo estado (normal o isla): al abrir solo cambia el ícono. */}
        <div
          className={`border-b ${island ? "border-transparent px-3 md:px-6" : "border-fg/10"}`}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <Bar island={island} className="justify-between">
            <Wordmark dark />
            <button
              type="button"
              onClick={() => setMenu(false)}
              aria-label="Cerrar menú"
              className="grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg"
            >
              <CloseIcon />
            </button>
          </Bar>
        </div>
        <nav className="flex flex-col px-6 py-6" aria-label="Menú">
          {NAV.map((n, i) => (
            <Link
              key={n.label}
              href={n.href}
              onClick={() => setMenu(false)}
              className={`border-b border-fg/10 py-3.5 text-2xl font-bold transition-all duration-300 hover:text-highlight ${menu ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
              style={{ transitionDelay: menu ? `${i * 30}ms` : "0ms" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/encontra-tu-iphone"
            onClick={() => setMenu(false)}
            className="mt-6 flex items-center justify-between rounded-2xl border border-fg/10 bg-surface p-5 text-fg transition hover:border-accent"
          >
            <span>
              <span className="block text-sm font-semibold text-highlight">
                Recomendador inteligente
              </span>
              <span className="text-lg font-bold">
                Encontrá tu iPhone ideal
              </span>
            </span>
            <ArrowIcon className="size-5 text-highlight" />
          </Link>
        </nav>
      </div>

      <SearchDialog
        products={products}
        open={search}
        onClose={() => setSearch(false)}
      />
    </>
  );
}
