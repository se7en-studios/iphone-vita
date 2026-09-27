"use client";

import { useEffect, useRef } from "react";
import { Layers, Search, X } from "lucide-react";
import { categories } from "@/data/products";
import type { Filters, SortKey, StockFilter } from "./filters";

const STOCK_PILLS: { value: StockFilter; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "sin", label: "Sin stock" },
  { value: "bajo", label: "Últimas unidades" },
  { value: "foto", label: "Con foto" },
  { value: "sinfoto", label: "Sin foto" },
  { value: "consultar", label: "Consultar precio" },
  { value: "destacado", label: "Destacados" },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: "catalogo", label: "Orden del catálogo" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre" },
  { value: "recientes", label: "Más recientes" },
];

export function ProductsToolbar({
  filters,
  onChange,
  total,
  shown,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  total: number;
  shown: number;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" enfoca el buscador (como en GitHub/Linear).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasFilters =
    filters.q || filters.cat || filters.cond || filters.estado || filters.stock;

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--a-muted)]"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar por nombre, modelo, color, capacidad…  ( / )"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            className="admin-input !pl-9"
          />
        </div>
        <select
          aria-label="Categoría"
          value={filters.cat}
          onChange={(e) => onChange({ cat: e.target.value })}
          className="admin-input !w-auto"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Condición"
          value={filters.cond}
          onChange={(e) =>
            onChange({ cond: e.target.value as Filters["cond"] })
          }
          className="admin-input !w-auto"
        >
          <option value="">Nuevos y semi nuevos</option>
          <option value="nuevo">Nuevos</option>
          <option value="semi-nuevo">Semi nuevos</option>
        </select>
        <select
          aria-label="Estado"
          value={filters.estado}
          onChange={(e) =>
            onChange({ estado: e.target.value as Filters["estado"] })
          }
          className="admin-input !w-auto"
        >
          <option value="">Visibles y ocultos</option>
          <option value="activo">Solo visibles</option>
          <option value="oculto">Solo ocultos</option>
        </select>
        <select
          aria-label="Ordenar"
          value={filters.orden}
          onChange={(e) => onChange({ orden: e.target.value as SortKey })}
          className="admin-input !w-auto"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex gap-1.5 overflow-x-auto pb-0.5"
          role="group"
          aria-label="Filtro rápido"
        >
          {STOCK_PILLS.map((pill) => (
            <button
              key={pill.value || "todos"}
              type="button"
              aria-pressed={filters.stock === pill.value}
              onClick={() => onChange({ stock: pill.value })}
              className={`admin-pill ${filters.stock === pill.value ? "admin-pill--active" : ""}`}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={filters.agrupar}
          onClick={() => onChange({ agrupar: !filters.agrupar })}
          className={`admin-pill ${filters.agrupar ? "admin-pill--active" : ""}`}
        >
          <Layers size={14} aria-hidden /> Agrupar por modelo
        </button>
        <span
          className="ml-auto text-[13px] text-[var(--a-muted)]"
          aria-live="polite"
        >
          {shown === total ? `${total} productos` : `${shown} de ${total}`}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({ q: "", cat: "", cond: "", estado: "", stock: "" })
            }
            className="admin-btn admin-btn--ghost admin-btn--sm"
          >
            <X size={14} aria-hidden /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
