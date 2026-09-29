import type { Product } from "@/types";
import { fullName } from "@/lib/format";
import { categoryName } from "@/lib/catalog";

/*
 * Filtros del listado. Viven en la URL (?q=&cat=…) para no perderlos al
 * volver de otra pantalla o al recargar.
 */

export type StockFilter =
  "" | "sin" | "bajo" | "foto" | "sinfoto" | "consultar" | "destacado";
export type SortKey =
  "catalogo" | "precio-asc" | "precio-desc" | "nombre" | "recientes";

export interface Filters {
  q: string;
  cat: string;
  cond: "" | "nuevo" | "semi-nuevo";
  estado: "" | "activo" | "oculto";
  stock: StockFilter;
  orden: SortKey;
  agrupar: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  cat: "",
  cond: "",
  estado: "",
  stock: "",
  orden: "catalogo",
  agrupar: false,
};

const pick = <T extends string>(
  v: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => (allowed.includes(v as T) ? (v as T) : fallback);

export function parseFilters(params: Record<string, string>): Filters {
  return {
    q: params.q ?? "",
    cat: params.cat ?? "",
    cond: pick(params.cond, ["", "nuevo", "semi-nuevo"] as const, ""),
    estado: pick(params.estado, ["", "activo", "oculto"] as const, ""),
    stock: pick(
      params.stock,
      ["", "sin", "bajo", "foto", "sinfoto", "consultar", "destacado"] as const,
      "",
    ),
    orden: pick(
      params.orden,
      ["catalogo", "precio-asc", "precio-desc", "nombre", "recientes"] as const,
      "catalogo",
    ),
    agrupar: params.agrupar === "1",
  };
}

/** Query string con solo lo que difiere del default. */
export function filtersToQuery(f: Filters): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.cat) sp.set("cat", f.cat);
  if (f.cond) sp.set("cond", f.cond);
  if (f.estado) sp.set("estado", f.estado);
  if (f.stock) sp.set("stock", f.stock);
  if (f.orden !== "catalogo") sp.set("orden", f.orden);
  if (f.agrupar) sp.set("agrupar", "1");
  const s = sp.toString();
  return s ? `?${s}` : "";
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function matchesStock(p: Product, stock: StockFilter): boolean {
  switch (stock) {
    case "sin":
      return p.stock === 0;
    case "bajo":
      return p.stockLevel === "bajo";
    case "foto":
      return Boolean(p.image);
    case "sinfoto":
      return !p.image;
    case "consultar":
      return p.price == null;
    case "destacado":
      return Boolean(p.featured);
    default:
      return true;
  }
}

// "Consultar precio" (null) va al final en los dos sentidos.
function byPrice(a: Product, b: Product, dir: 1 | -1): number {
  if (a.price == null || b.price == null)
    return (a.price == null ? 1 : 0) - (b.price == null ? 1 : 0);
  return (a.price - b.price) * dir;
}

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  catalogo: (a, b) =>
    (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
    a.createdAt.localeCompare(b.createdAt),
  "precio-asc": (a, b) => byPrice(a, b, 1),
  "precio-desc": (a, b) => byPrice(a, b, -1),
  nombre: (a, b) => fullName(a).localeCompare(fullName(b), "es"),
  recientes: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

export function applyFilters(products: Product[], f: Filters): Product[] {
  const terms = normalize(f.q).split(/\s+/).filter(Boolean);
  return products
    .filter((p) => {
      if (f.cat && p.category !== f.cat) return false;
      if (f.cond && p.condition !== f.cond) return false;
      if (f.estado === "activo" && p.active === false) return false;
      if (f.estado === "oculto" && p.active !== false) return false;
      if (!matchesStock(p, f.stock)) return false;
      if (terms.length === 0) return true;
      const haystack = normalize(
        [fullName(p), p.model, p.brand, p.slug].join(" "),
      );
      return terms.every((t) => haystack.includes(t));
    })
    .sort(SORTERS[f.orden]);
}

/* ---------- CSV ---------- */

const csvCell = (v: unknown) => {
  const raw = v == null ? "" : String(v);
  // Excel ejecuta celdas que empiezan con = + - @: se neutralizan con un apóstrofo.
  const s = typeof v === "string" && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function productsToCsv(products: Product[]): string {
  const header = [
    "Nombre",
    "Variante",
    "Marca",
    "Categoría",
    "Condición",
    "Precio USD",
    "Stock",
    "Nivel de stock",
    "Activo",
    "Destacado",
    "Slug",
  ];
  const rows = products.map((p) => [
    p.name,
    fullName(p).slice(p.name.length).trim(),
    p.brand,
    categoryName(p.category),
    p.condition === "nuevo" ? "Nuevo" : "Semi nuevo",
    p.price ?? "Consultar",
    p.stock ?? "",
    p.stockLevel,
    p.active === false ? "No" : "Sí",
    p.featured ? "Sí" : "No",
    p.slug,
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

export function downloadCsv(products: Product[]) {
  // BOM para que Excel lea bien los acentos.
  const blob = new Blob(["﻿", productsToCsv(products)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `productos-iphone-vita-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
