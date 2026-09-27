"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types";
import { categoryName } from "@/lib/products";
import { priceLabel } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { CloseIcon, SearchIcon } from "./ui/Icons";

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

  const suggestions = ["iPhone 17 Pro", "Semi nuevo", "MacBook", "AirPods", "Cable USB-C", "Casio"];

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Buscar productos">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative mx-auto mt-[8vh] w-[min(680px,calc(100%-32px))] overflow-hidden rounded-3xl border border-fg/10 bg-surface text-fg shadow-2xl">
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
          <button type="button" onClick={onClose} aria-label="Cerrar búsqueda" className="grid size-9 place-items-center rounded-full text-fg/60 hover:bg-fg/10 hover:text-fg transition"><CloseIcon /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!q && (
            <div className="p-3">
              <p className="mb-3 font-semibold text-base text-highlight">Búsquedas frecuentes</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full border border-fg/10 bg-fg/5 px-3.5 py-1.5 text-xs text-fg/80 hover:border-accent hover:text-highlight transition">{s}</button>
                ))}
              </div>
            </div>
          )}
          {q && !results.length && <p className="p-4 text-sm text-fg/50">No encontramos resultados para “{q}”. Escribinos directo por WhatsApp y te asesoramos.</p>}
          <ul className="divide-y divide-fg/5">
            {results.map((p) => (
              <li key={p.slug}>
                <Link href={`/producto/${p.slug}`} onClick={onClose} className="group flex items-center gap-4 rounded-2xl p-2.5 hover:bg-fg/5 transition">
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-fg/10 bg-bg p-1">
                    <ProductVisual product={p} className="size-full" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-fg group-hover:text-highlight transition">{p.name}</p>
                    <p className="truncate text-xs text-fg/50">{[p.brand, p.size, p.storage, p.color, p.batteryHealth ? `${p.batteryHealth}% batería` : ""].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="tabular shrink-0 font-bold text-sm text-highlight">{priceLabel(p)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
