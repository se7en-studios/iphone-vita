import { categories } from "@/data/products";
import type { CategorySlug, Product } from "@/types";

/* Helpers puros del catálogo: sirven en server y client (sin Supabase ni next/cache). */

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
