import type { Product } from "@/types";

/** Fila de public.products (snake_case) ↔ Product de la app. */
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  model: string;
  brand: string;
  category: Product["category"];
  subcategory: Product["subcategory"] | null;
  condition: Product["condition"];
  price: number | string | null;
  stock: number | null;
  stock_level: Product["stockLevel"];
  color: string | null;
  color_hex: string | null;
  storage: string | null;
  battery_health: number | null;
  size: string | null;
  band_size: string | null;
  image: string | null;
  gallery: string[] | null;
  description: string;
  specifications: Record<string, string> | null;
  featured: boolean;
  wholesale: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export const PRODUCT_COLUMNS =
  "id,slug,name,model,brand,category,subcategory,condition,price,stock,stock_level,color,color_hex,storage,battery_health,size,band_size,image,gallery,description,specifications,featured,wholesale,active,sort_order,created_at";

type SpecFields = Pick<Product, "storage" | "color" | "size" | "bandSize" | "batteryHealth" | "condition">;

function derivedSpecs(f: SpecFields): Record<string, string> {
  const specs: Record<string, string> = {};
  if (f.storage) specs["Capacidad"] = f.storage;
  if (f.color) specs["Color"] = f.color;
  if (f.size) specs["Tamaño"] = f.size;
  if (f.bandSize) specs["Talle de malla"] = f.bandSize;
  if (f.batteryHealth) specs["Salud de batería"] = `${f.batteryHealth}%`;
  specs["Condición"] = f.condition === "nuevo" ? "Nuevo" : "Semi nuevo";
  return specs;
}

/** Specs derivadas de los campos (se recalculan siempre) + las cargadas a mano, que ganan. */
export function buildSpecs(f: SpecFields, extra: Record<string, string> = {}): Record<string, string> {
  return { ...derivedSpecs(f), ...extra };
}

/** Lo que se guarda: solo las specs que no coinciden con las derivadas. */
export function extraSpecs(f: SpecFields, specs: Record<string, string>): Record<string, string> {
  const derived = derivedSpecs(f);
  return Object.fromEntries(Object.entries(specs).filter(([k, v]) => derived[k] !== v && v.trim() !== ""));
}

const opt = <T,>(v: T | null): T | undefined => (v == null ? undefined : v);

export function rowToProduct(r: ProductRow): Product {
  // numeric llega como string desde PostgREST
  const price = r.price == null ? null : Number(r.price);
  const fields = {
    storage: opt(r.storage),
    color: opt(r.color),
    size: opt(r.size),
    bandSize: opt(r.band_size),
    batteryHealth: opt(r.battery_health),
    condition: r.condition,
  };
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    model: r.model,
    brand: r.brand,
    category: r.category,
    subcategory: opt(r.subcategory),
    condition: r.condition,
    price,
    priceType: price == null ? "consultar" : "fijo",
    stock: r.stock,
    stockLevel: r.stock_level,
    color: opt(r.color),
    colorHex: opt(r.color_hex),
    storage: opt(r.storage),
    batteryHealth: opt(r.battery_health),
    size: opt(r.size),
    bandSize: opt(r.band_size),
    image: r.image,
    gallery: r.gallery ?? [],
    description: r.description,
    specifications: buildSpecs(fields, r.specifications ?? {}),
    featured: r.featured,
    wholesale: r.wholesale,
    active: r.active,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

/** Campos editables desde el admin (sin id/fechas). */
export type ProductInput = Omit<Product, "id" | "createdAt" | "priceType">;

export function inputToRow(p: ProductInput) {
  return {
    slug: p.slug,
    name: p.name,
    model: p.model,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory ?? null,
    condition: p.condition,
    price: p.price,
    stock: p.stock,
    stock_level: p.stockLevel,
    color: p.color ?? null,
    color_hex: p.colorHex ?? null,
    storage: p.storage ?? null,
    battery_health: p.batteryHealth ?? null,
    size: p.size ?? null,
    band_size: p.bandSize ?? null,
    image: p.image,
    gallery: p.gallery,
    description: p.description,
    specifications: extraSpecs(p, p.specifications),
    featured: p.featured ?? false,
    wholesale: p.wholesale ?? false,
    active: p.active ?? true,
    sort_order: p.sortOrder ?? 0,
  };
}
