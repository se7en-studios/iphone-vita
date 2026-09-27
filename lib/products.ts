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

export { groupByModel, uniqueColors, categoryName, type ModelGroup } from "@/lib/catalog";
