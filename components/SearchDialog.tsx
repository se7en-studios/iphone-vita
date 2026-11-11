"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import type { Product } from "@/types";
import { categoryName } from "@/lib/catalog";
import { isOutOfStock, priceLabel } from "@/lib/format";
import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ProductVisual } from "./ProductVisual";
import { ArrowIcon, ChatIcon, ChevronIcon, CloseIcon, SearchIcon } from "./ui/Icons";
import { Ars } from "./StoreSettings";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Texto indexable de un producto: nombre, modelo, marca, categoría, color y capacidad. */
function haystack(p: Product) {
  return norm([p.name, p.model, p.brand, categoryName(p.category), p.subcategory, p.color, p.storage, p.size, p.condition === "semi-nuevo" ? "semi nuevo usado" : "nuevo"].filter(Boolean).join(" "));
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento de diálogo modal compartido (búsqueda y menú mobile): Escape cierra, Tab queda
 * atrapado adentro, la página de atrás no scrollea y al cerrar el foco vuelve a donde estaba.
 */
export function useModal(
  open: boolean,
  onClose: () => void,
  root: RefObject<HTMLElement | null>,
) {
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !root.current) return;
      const items = [...root.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!root.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = overflow;
      if (prev?.isConnected) prev.focus({ preventScroll: true });
    };
  }, [open, root]);
}

const CHIPS = [
  { label: "iPhone", query: "iPhone" },
  { label: "Sellados", query: "nuevo" },
  { label: "Semi nuevos", query: "semi nuevo" },
  { label: "Apple Watch", query: "Watch" },
  { label: "AirPods y audio", query: "AirPods" },
  { label: "Accesorios", query: "Accesorio" },
  { label: "Mac y iPad", query: "MacBook" },
];

const SUGGESTIONS = ["iPhone 15 Pro", "iPhone 13 128GB", "Batería 90%+", "Sellado en caja", "Casio Vintage", "Cargador 20W"];

export function SearchDialog({ products, open, onClose }: { products: Product[]; open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const index = useMemo(() => products.map((p) => ({ p, h: haystack(p) })), [products]);

  useModal(open, onClose, panel);

  useEffect(() => {
    if (!open) {
      setQ("");
      return;
    }
    const id = window.setTimeout(() => input.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open]);

  const { results, total } = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return { results: [], total: 0 };
    const all = index.filter(({ h }) => terms.every((t) => h.includes(t)));
    return { results: all.slice(0, 8).map(({ p }) => p), total: all.length };
  }, [q, index]);

  /** Flechas: del campo al primer resultado y entre resultados; flecha arriba en el primero vuelve al campo. */
  const onArrows = (e: ReactKeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const links = [...(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    if (!links.length) return;
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    e.preventDefault();
    if (e.key === "ArrowDown") links[Math.min(i + 1, links.length - 1)].focus();
    else if (i <= 0) input.current?.focus();
    else links[i - 1].focus();
  };

  const chipActive = (query: string) => q.trim().toLowerCase() === query.toLowerCase();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-[fade-in_0.2s_ease-out] bg-bg/60 backdrop-blur-xl backdrop-saturate-150 motion-reduce:animate-none"
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar productos"
        onKeyDown={onArrows}
        className="pop-in relative mx-auto mt-[max(env(safe-area-inset-top,0px),12px)] flex max-h-[calc(100dvh-24px)] w-[min(680px,calc(100%-24px))] origin-top flex-col overflow-hidden rounded-[22px] border border-fg/10 bg-surface text-fg shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-24px_rgba(0,0,0,0.35)] sm:mt-[9vh] sm:max-h-[min(640px,82vh)]"
      >
        <div className="flex items-center gap-3 border-b border-fg/10 pl-5 pr-3">
          <SearchIcon className="size-[18px] shrink-0 text-fg/45" />
          <input
            ref={input}
            id="search-input"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            aria-label="Buscar productos"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            // En línea: el anillo de foco global (sin capa) le gana a cualquier utilidad. El campo
            // es el único foco al abrir y el panel entero ya marca dónde se escribe.
            style={{ outline: "none" }}
            placeholder="Buscá por modelo, capacidad o color"
            className="h-14 min-w-0 flex-1 bg-transparent text-[17px] tracking-[-0.01em] text-fg placeholder:text-fg/40 sm:h-16 [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                input.current?.focus();
              }}
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-fg/50 transition-colors hover:bg-fg/[0.06] hover:text-fg"
            >
              Borrar
            </button>
          )}
          <kbd className="hidden shrink-0 rounded-md border border-fg/10 px-1.5 py-0.5 font-sans text-[11px] text-fg/45 sm:block">
            Esc
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            className="grid size-9 shrink-0 place-items-center rounded-full text-fg/55 transition-colors hover:bg-fg/[0.06] hover:text-fg"
          >
            <CloseIcon className="size-[18px]" />
          </button>
        </div>

        {/* Atajos por categoría: con scroll horizontal y bordes que se desvanecen. */}
        <div className="border-b border-fg/[0.06]">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-4 py-3 [mask-image:linear-gradient(90deg,#000_88%,transparent)] sm:px-5">
            {CHIPS.map((chip) => {
              const active = chipActive(chip.query);
              return (
                <button
                  key={chip.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setQ(active ? "" : chip.query)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium tracking-[-0.005em] transition-colors duration-200 ${
                    active
                      ? "border-vita/30 bg-vita-soft text-vita"
                      : "border-fg/10 text-fg/70 hover:border-fg/20 hover:bg-fg/[0.03] hover:text-fg"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!q && (
            <div className="px-5 pb-5 pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg/45">
                Búsquedas frecuentes
              </p>
              <ul>
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => {
                        setQ(s);
                        input.current?.focus();
                      }}
                      className="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-2 text-left text-sm text-fg/80 transition-colors hover:bg-fg/[0.04] hover:text-fg"
                    >
                      <SearchIcon className="size-3.5 shrink-0 text-fg/35 transition-colors group-hover:text-vita" />
                      <span className="flex-1">{s}</span>
                      <ArrowIcon className="size-3.5 -translate-x-1 text-fg/30 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q && !results.length && (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-fg/[0.05] text-fg/45">
                <SearchIcon className="size-5" />
              </span>
              <p className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-fg">
                Sin resultados para “{q.trim()}”
              </p>
              <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-fg/55">
                Probá con otro modelo o capacidad. Si no lo tenemos publicado, te lo conseguimos.
              </p>
              <a
                href={waLink(`${GENERAL_MESSAGE} Estoy buscando: ${q.trim()}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-fg/10 px-4 py-2 text-[13px] font-medium text-fg transition-colors hover:border-fg/20 hover:bg-fg/[0.03]"
              >
                <ChatIcon className="size-4 text-[#25d366]" />
                Consultar por WhatsApp
              </a>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg/45" aria-live="polite">
                {total === 1 ? "1 resultado" : `${total} resultados`}
              </p>
              <ul ref={list} className="px-2 pb-2">
                {results.map((p) => {
                  const out = isOutOfStock(p);
                  return (
                    <li key={p.slug}>
                      <Link
                        href={`/producto/${p.slug}`}
                        onClick={onClose}
                        style={{ outlineOffset: -2 }}
                        className="group flex items-center gap-3.5 rounded-2xl p-2.5 transition-colors hover:bg-fg/[0.04] focus-visible:bg-fg/[0.04] sm:gap-4 sm:px-3"
                      >
                        <div className="stage size-14 shrink-0 overflow-hidden rounded-xl border border-fg/[0.08] p-1">
                          <ProductVisual product={p} className="size-full" sizes="56px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-fg">{p.name}</p>
                            {p.condition === "semi-nuevo" && (
                              <span className="shrink-0 rounded-full bg-vita-soft px-2 py-0.5 text-[10.5px] font-semibold text-vita">
                                Semi nuevo
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-[12.5px] text-fg/55">
                            {[p.storage, p.color, p.batteryHealth ? `Batería ${p.batteryHealth}%` : "", p.size]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`tabular block text-sm font-semibold tracking-[-0.01em] ${out || p.price == null ? "text-fg/55" : "text-fg"}`}>
                            {out ? "Sin stock" : priceLabel(p)}
                          </span>
                          {p.price != null && !out && (
                            <span className="tabular block text-[11px] text-fg/45">
                              ≈ <Ars usd={p.price} />
                            </span>
                          )}
                        </div>
                        <ChevronIcon className="hidden size-4 shrink-0 text-fg/25 transition-colors group-hover:text-fg/50 sm:block" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {total > results.length && (
                <div className="border-t border-fg/[0.06] px-5 py-3">
                  <Link
                    href="/productos"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-link hover:underline"
                  >
                    Ver todo el catálogo
                    <ChevronIcon className="size-3.5" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
