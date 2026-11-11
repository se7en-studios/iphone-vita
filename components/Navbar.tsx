"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "./cart/CartProvider";
import { SearchDialog, useModal } from "./SearchDialog";
import { Wordmark } from "./Wordmark";
import {
  ArrowIcon,
  BagIcon,
  ChevronIcon,
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

/** Botón de ícono de la barra: círculo neutro al pasar el mouse, anillo de foco del sitio. */
const ICON_BTN =
  "grid size-10 place-items-center rounded-full text-fg/80 transition-colors duration-200 hover:bg-fg/[0.06] hover:text-fg";

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
  const menuPanel = useRef<HTMLDivElement>(null);
  const closeMenu = useRef<HTMLButtonElement>(null);

  useModal(menu, () => setMenu(false), menuPanel);
  useEffect(() => {
    if (menu) closeMenu.current?.focus({ preventScroll: true });
  }, [menu]);

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
            className="hidden flex-1 items-center justify-center gap-0.5 text-[12.5px] tracking-[-0.005em] text-fg/70 lg:flex"
            aria-label="Principal"
          >
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-fg/[0.05] hover:text-fg"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            <Link
              href="/encontra-tu-iphone"
              className="group mr-2.5 hidden items-center gap-1.5 rounded-full border border-vita/25 bg-vita-soft px-3.5 py-1.5 text-[12px] font-medium tracking-[-0.005em] text-vita transition-colors duration-200 hover:border-vita/50 xl:flex"
            >
              <span>Encontrá tu iPhone</span>
              <ArrowIcon className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setSearch(true)}
              aria-label="Buscar"
              aria-haspopup="dialog"
              aria-keyshortcuts="Control+K Meta+K"
              className={ICON_BTN}
            >
              <SearchIcon className="size-[19px]" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Carrito, ${count} productos`}
              aria-haspopup="dialog"
              className={`relative ${ICON_BTN}`}
            >
              <BagIcon className="size-[19px]" />
              {count > 0 && (
                <span
                  key={count}
                  aria-hidden="true"
                  className="pop tabular absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-vita px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-bg"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Abrir menú"
              aria-haspopup="dialog"
              aria-expanded={menu}
              aria-controls="menu-mobile"
              className={`${ICON_BTN} lg:hidden`}
            >
              <MenuIcon />
            </button>
          </div>
        </Bar>
      </header>

      {/* Menú mobile */}
      <div
        ref={menuPanel}
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className={`fixed inset-0 z-[65] overflow-y-auto overscroll-contain bg-bg/90 text-fg backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-300 lg:hidden ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!menu}
        inert={!menu}
      >
        {/* La misma barra que la navbar, en el mismo estado (normal o isla): al abrir solo cambia el ícono. */}
        <div
          className={`border-b ${island ? "border-transparent px-3 md:px-6" : "border-fg/10"}`}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <Bar island={island} className="justify-between">
            <Link href="/" onClick={() => setMenu(false)} className="shrink-0">
              <Wordmark dark />
            </Link>
            <button
              ref={closeMenu}
              type="button"
              onClick={() => setMenu(false)}
              aria-label="Cerrar menú"
              className={ICON_BTN}
            >
              <CloseIcon />
            </button>
          </Bar>
        </div>
        <div
          className={`px-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] ${island ? "pt-8" : "pt-5"}`}
        >
          {/* Buscar a mano: en el celular es la forma más rápida de llegar a un modelo. */}
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              setSearch(true);
            }}
            className={`flex h-11 w-full items-center gap-2.5 rounded-xl bg-fg/[0.05] px-3.5 text-left text-[15px] text-fg/50 transition-[opacity,translate,background-color] duration-300 ease-[var(--ease-out-expo)] hover:bg-fg/[0.08] ${menu ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
          >
            <SearchIcon className="size-[17px]" />
            Buscar productos
          </button>
          <nav className="mt-4 flex flex-col" aria-label="Menú">
            {NAV.map((n, i) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setMenu(false)}
                className={`group flex items-center justify-between border-b border-fg/[0.08] py-3 text-[26px] font-semibold leading-tight tracking-[-0.025em] transition-[opacity,translate,color] duration-500 ease-[var(--ease-out-expo)] hover:text-fg/70 ${menu ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
                style={{ transitionDelay: menu ? `${40 + i * 25}ms` : "0ms" }}
              >
                {n.label}
                <ChevronIcon className="size-5 text-fg/25 transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:text-fg/50" />
              </Link>
            ))}
          </nav>
          <Link
            href="/encontra-tu-iphone"
            onClick={() => setMenu(false)}
            className={`group mt-7 flex items-center justify-between gap-4 rounded-2xl border border-vita/20 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-18px_rgba(0,0,0,0.18)] transition-[opacity,translate,border-color] duration-500 ease-[var(--ease-out-expo)] hover:border-vita/40 ${menu ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            style={{ transitionDelay: menu ? `${40 + NAV.length * 25}ms` : "0ms" }}
          >
            <span>
              <span className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-vita">
                Recomendador
              </span>
              <span className="mt-1 block text-[19px] font-semibold tracking-[-0.02em] text-fg">
                Encontrá tu iPhone ideal
              </span>
              <span className="mt-0.5 block text-[13px] text-fg/55">
                Cinco preguntas y te mostramos cuál te conviene.
              </span>
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-vita-soft text-vita transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowIcon className="size-4" />
            </span>
          </Link>
        </div>
      </div>

      <SearchDialog
        products={products}
        open={search}
        onClose={() => setSearch(false)}
      />
    </>
  );
}
