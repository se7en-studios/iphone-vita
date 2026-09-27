import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Product } from "@/types";
import { supabaseAdmin } from "@/lib/supabase";
import {
  inputToRow,
  PRODUCT_COLUMNS,
  rowToProduct,
  type ProductInput,
  type ProductRow,
} from "@/lib/product-row";
import { PRODUCTS_TAG } from "@/lib/products";
import { ValidationError, type ProductPatch } from "@/lib/validation";

/*
 * Lecturas y escrituras del admin. Usan service role: llamar SOLO desde
 * handlers que ya pasaron por handle()/requireAdmin().
 */

export const PRODUCT_IMAGE_BUCKET = "product-images";

/** Invalida el caché de la tienda: home, catálogo, fichas, sitemap. */
export function revalidateStore() {
  revalidateTag(PRODUCTS_TAG);
  revalidatePath("/", "layout");
}

function dbError(error: { code?: string; message: string }): never {
  if (error.code === "23505")
    throw new ValidationError(
      "Ya existe un producto con ese slug (misma variante)",
    );
  if (error.code === "23514")
    throw new ValidationError("Algún dato no pasa las reglas de la base");
  throw new Error(error.message);
}

export async function listAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) dbError(error);
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) dbError(error);
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const row = inputToRow(input);
  if (!input.sortOrder) {
    // Nuevo producto al final del catálogo.
    const { data } = await supabaseAdmin()
      .from("products")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    row.sort_order = (data?.sort_order ?? 0) + 10;
  }
  const { data, error } = await supabaseAdmin()
    .from("products")
    .insert(row)
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) dbError(error);
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .update(inputToRow(input))
    .eq("id", id)
    .select(PRODUCT_COLUMNS)
    .maybeSingle();
  if (error) dbError(error);
  if (!data) throw new ValidationError("El producto no existe");
  return rowToProduct(data as ProductRow);
}

function patchToRow(p: ProductPatch) {
  const row: Record<string, unknown> = {};
  if ("price" in p) row.price = p.price;
  if ("stock" in p) row.stock = p.stock;
  if ("stockLevel" in p) row.stock_level = p.stockLevel;
  if ("active" in p) row.active = p.active;
  if ("featured" in p) row.featured = p.featured;
  return row;
}

export async function patchProducts(
  ids: string[],
  patch: ProductPatch,
): Promise<Product[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .update(patchToRow(patch))
    .in("id", ids)
    .select(PRODUCT_COLUMNS);
  if (error) dbError(error);
  return (data as ProductRow[]).map(rowToProduct);
}

/** Ajuste masivo de precio en % (ej: +5 al cambiar la lista). Redondea a dólar entero. */
export async function adjustPrices(
  ids: string[],
  percent: number,
): Promise<Product[]> {
  if (!Number.isFinite(percent) || percent <= -90 || percent > 500) {
    throw new ValidationError("Porcentaje inválido");
  }
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("products")
    .select("id, price")
    .in("id", ids)
    .not("price", "is", null);
  if (error) dbError(error);
  // ponytail: un update por fila, alcanza para un catálogo de cientos; RPC si crece a miles.
  const factor = 1 + percent / 100;
  const priced = data as { id: string; price: number | string }[];
  if (priced.length === 0) return [];
  const results = await Promise.all(
    priced.map((r) =>
      admin
        .from("products")
        .update({ price: Math.round(Number(r.price) * factor) })
        .eq("id", r.id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) dbError(failed.error);
  const { data: fresh, error: freshError } = await admin
    .from("products")
    .select(PRODUCT_COLUMNS)
    // Solo los que tenían precio: los "consultar" no cambian y no cuentan.
    .in("id", priced.map((r) => r.id));
  if (freshError) dbError(freshError);
  return (fresh as ProductRow[]).map(rowToProduct);
}

export async function deleteProducts(ids: string[]): Promise<Product[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .delete()
    .in("id", ids)
    .select(PRODUCT_COLUMNS);
  if (error) dbError(error);
  return (data as ProductRow[]).map(rowToProduct);
}

const PUBLIC_PREFIX = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

/**
 * Borra del bucket las fotos que ningún producto sigue usando. Best-effort:
 * nunca hace fallar la operación que pidió el admin.
 */
export async function deleteUnreferencedImages(urls: string[]): Promise<void> {
  const paths = new Map<string, string>();
  for (const url of urls) {
    const i = url.indexOf(PUBLIC_PREFIX);
    if (i !== -1)
      paths.set(url, url.slice(i + PUBLIC_PREFIX.length).split("?")[0]);
  }
  if (paths.size === 0) return;
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("products")
      .select("image, gallery");
    if (error) throw error;
    const used = new Set<string>();
    for (const r of data as {
      image: string | null;
      gallery: string[] | null;
    }[]) {
      if (r.image) used.add(r.image);
      for (const g of r.gallery ?? []) used.add(g);
    }
    const orphans = [...paths]
      .filter(([url]) => !used.has(url))
      .map(([, p]) => p);
    if (orphans.length)
      await admin.storage.from(PRODUCT_IMAGE_BUCKET).remove(orphans);
  } catch (err) {
    console.warn("[storage] no se pudieron limpiar fotos huérfanas:", err);
  }
}

export const productImages = (p: Product) =>
  [p.image, ...p.gallery].filter((x): x is string => !!x);
