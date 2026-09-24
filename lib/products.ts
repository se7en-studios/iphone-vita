import { categories, products } from "@/data/products";
import type { Category, CategorySlug, Product } from "@/types";

/*
 * Capa de acceso a datos. Hoy lee de data/products.ts.
 * Para pasar a Supabase, reemplazar el cuerpo de estas funciones por consultas
 * (ej: supabase.from("products").select("*")) y mantener las firmas.
 */

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  return products.filter((p) => p.category === category);
}

/** Todas las variantes (color, capacidad, tamaño) de un mismo modelo. */
export async function getVariants(model: string): Promise<Product[]> {
  return products.filter((p) => p.model === model);
}

/* ---------- helpers puros (sirven en server y client) ---------- */

export interface ModelGroup {
  model: string;
  name: string;
  brand: string;
  category: CategorySlug;
  variants: Product[];
  fromPrice: number | null;
}

/** Agrupa SKUs por modelo, manteniendo el orden del catálogo. */
export function groupByModel(list: Product[]): ModelGroup[] {
  const map = new Map<string, ModelGroup>();
  for (const p of list) {
    const g = map.get(p.model);
    if (g) g.variants.push(p);
    else map.set(p.model, { model: p.model, name: p.name, brand: p.brand, category: p.category, variants: [p], fromPrice: null });
  }
  for (const g of map.values()) {
    const prices = g.variants.map((v) => v.price).filter((x): x is number => x != null);
    g.fromPrice = prices.length ? Math.min(...prices) : null;
  }
  return [...map.values()];
}

/** Colores únicos de un grupo, con el primer SKU de cada color. */
export function uniqueColors(variants: Product[]): Product[] {
  const seen = new Set<string>();
  return variants.filter((v) => {
    const key = v.color ?? v.slug;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function categoryName(slug: CategorySlug): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}
