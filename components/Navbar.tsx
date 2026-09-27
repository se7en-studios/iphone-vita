"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export function Navbar() {
  const { count, setOpen, products } = useCart();
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);

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
      <header
        className="sticky top-0 z-50 border-b border-fg/10 bg-bg/80 backdrop-blur-xl text-fg"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 md:px-8">
          <Link href="/" aria-label="iPhone Vita, inicio" className="shrink-0">
            <Wordmark dark />
          </Link>
          <nav
            className="hidden flex-1 justify-center gap-7 text-xs text-fg/80 lg:flex"
            aria-label="Principal"
          >
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="transition hover:text-fg"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Link
              href="/encontra-tu-iphone"
              className="mr-3 hidden items-center gap-1 text-xs text-highlight transition hover:text-fg xl:flex"
            >
              Encontrá tu iPhone <ArrowIcon className="size-3" />
            </Link>
            <button
              type="button"
              onClick={() => setSearch(true)}
              aria-label="Buscar"
              className="grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Carrito, ${count} productos`}
              className="relative grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg"
            >
              <BagIcon />
              {count > 0 && (
                <span
                  key={count}
                  className="pop tabular absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-accent-fg"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Abrir menú"
              className="grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg lg:hidden"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Menú mobile */}
      <div
        className={`fixed inset-0 z-[65] bg-bg text-fg transition-opacity duration-300 lg:hidden overflow-y-auto ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!menu}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-fg/10">
          <Wordmark dark />
          <button
            type="button"
            onClick={() => setMenu(false)}
            aria-label="Cerrar menú"
            className="grid size-10 place-items-center rounded-full hover:bg-fg/10 text-fg"
          >
            <CloseIcon />
          </button>
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
