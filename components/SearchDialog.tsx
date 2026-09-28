"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types";
import { categoryName } from "@/lib/catalog";
import { isOutOfStock, priceLabel } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { CloseIcon, SearchIcon } from "./ui/Icons";
import { Ars } from "./StoreSettings";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Texto indexable de un producto: nombre, modelo, marca, categoría, color y capacidad. */
function haystack(p: Product) {
  return norm([p.name, p.model, p.brand, categoryName(p.category), p.subcategory, p.color, p.storage, p.size, p.condition === "semi-nuevo" ? "semi nuevo usado" : "nuevo"].filter(Boolean).join(" "));
}

export function SearchDialog({ products, open, onClose }: { products: Product[]; open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const index = useMemo(() => products.map((p) => ({ p, h: haystack(p) })), [products]);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 30);
    else setQ("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return index.filter(({ h }) => terms.every((t) => h.includes(t))).slice(0, 8).map(({ p }) => p);
  }, [q, index]);

  const filterChips = [
    { label: "📱 iPhone", query: "iPhone" },
    { label: "✨ Sellados nuevos", query: "nuevo" },
    { label: "🔋 Semi nuevos", query: "semi nuevo" },
    { label: "⌚ Apple Watch", query: "Watch" },
    { label: "🎧 AirPods & Audio", query: "AirPods" },
    { label: "🔌 Accesorios", query: "Accesorio" },
    { label: "💻 MacBook / iPad", query: "MacBook" },
  ];

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Buscar productos">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative mx-auto mt-[8vh] w-[min(700px,calc(100%-32px))] overflow-hidden rounded-3xl border border-fg/10 bg-surface text-fg shadow-2xl">
        <div className="flex items-center gap-3 border-b border-fg/10 px-5">
          <SearchIcon className="size-5 text-fg/50" />
          <input
            ref={input}
            id="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá por modelo, capacidad, color o categoría..."
            className="h-16 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg/40"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="text-xs text-fg/40 hover:text-fg transition px-2 py-1"
            >
              Borrar
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Cerrar búsqueda" className="grid size-9 place-items-center rounded-full text-fg/60 hover:bg-fg/10 hover:text-fg transition"><CloseIcon /></button>
        </div>

        {/* Quick filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-fg/5 px-4 py-2.5 text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 text-[11px] font-medium text-fg/40 uppercase mr-1">Filtros:</span>
          {filterChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => setQ(chip.query)}
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition ${
                q.toLowerCase() === chip.query.toLowerCase()
                  ? "border-accent bg-accent/15 text-accent font-semibold"
                  : "border-fg/10 bg-fg/5 text-fg/70 hover:border-fg/20 hover:text-fg"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!q && (
            <div className="p-3">
              <p className="mb-3 font-semibold text-xs uppercase tracking-wider text-fg/50">Sugerencias para empezar</p>
              <div className="flex flex-wrap gap-2">
                {["iPhone 15 Pro", "iPhone 13 128GB", "Batería 90%+", "Sellado en caja", "Casio Vintage", "Cargador 20W"].map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full border border-fg/10 bg-fg/5 px-3.5 py-1.5 text-xs text-fg/80 hover:border-accent hover:text-highlight transition">{s}</button>
                ))}
              </div>
            </div>
          )}
          {q && !results.length && (
            <div className="p-6 text-center text-sm text-fg/50">
              <p>No encontramos resultados para “{q}”.</p>
              <p className="mt-1 text-xs text-fg/40">Escribinos directo por WhatsApp y te lo conseguimos o asesoramos.</p>
            </div>
          )}
          <ul className="divide-y divide-fg/5">
            {results.map((p) => (
              <li key={p.slug}>
                <Link href={`/producto/${p.slug}`} onClick={onClose} className="group flex items-center gap-4 rounded-2xl p-2.5 hover:bg-fg/5 transition">
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-fg/10 bg-bg p-1">
                    <ProductVisual product={p} className="size-full" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-fg group-hover:text-highlight transition">{p.name}</p>
                      {p.condition === "semi-nuevo" && (
                        <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          Semi nuevo
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-fg/50 mt-0.5">
                      {[
                        p.storage,
                        p.color,
                        p.batteryHealth ? `🔋 ${p.batteryHealth}% batería` : "",
                        p.size,
                      ].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="tabular font-bold text-sm text-highlight block">
                      {isOutOfStock(p) ? "Sin stock" : priceLabel(p)}
                    </span>
                    {p.price != null && !isOutOfStock(p) && (
                      <span className="text-[11px] text-fg/40 tabular block">
                        ≈ <Ars usd={p.price} />
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
