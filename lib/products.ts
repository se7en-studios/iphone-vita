import { unstable_cache } from "next/cache";
import { categories, products as staticProducts } from "@/data/products";
import type { Category, CategorySlug, Product } from "@/types";
import { isSupabaseConfigured, supabasePublic } from "@/lib/supabase";
import { PRODUCT_COLUMNS, rowToProduct, type ProductRow } from "@/lib/product-row";

/*
 * Capa de acceso a datos de la tienda.
 * Con Supabase configurado lee la tabla products (solo activos, cacheado con el
 * tag "products" que el admin invalida al guardar). Sin Supabase usa data/products.ts.
 * Si Supabase falla se lanza el error a propósito: ISR sigue sirviendo la última
 * versión buena en vez de mostrar precios viejos del archivo estático.
 */

export const PRODUCTS_TAG = "products";

const fetchActiveProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await supabasePublic()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(`No se pudieron leer los productos: ${error.message}`);
    return (data as ProductRow[]).map(rowToProduct);
  },
  ["products-active"],
  { tags: [PRODUCTS_TAG], revalidate: 300 },
);

export async function getProducts(): Promise<Product[]> {
  return isSupabaseConfigured ? fetchActiveProducts() : staticProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.category === category);
}

/** Todas las variantes (color, capacidad, tamaño) de un mismo modelo. */
export async function getVariants(model: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.model === model);
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
