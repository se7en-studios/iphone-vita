import type {
  CategorySlug,
  StockLevel,
  StoreSettings,
  SubcategorySlug,
} from "@/types";
import type { ProductInput } from "@/lib/product-row";
import { slugify } from "@/lib/slug";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const CATEGORY_SLUGS: CategorySlug[] = [
  "iphone",
  "mac",
  "ipad",
  "apple-watch",
  "airpods",
  "accesorios",
  "audio",
  "gaming",
  "camaras-creators",
  "wearables",
];
const SUBCATEGORY_SLUGS: SubcategorySlug[] = [
  "cables",
  "cargadores",
  "apple-pencil",
  "airtags",
  "auriculares",
];
const STOCK_LEVELS: StockLevel[] = ["alto", "medio", "bajo"];
const MAX_TEXT = 200;
const MAX_DESCRIPTION = 4000;
const MAX_GALLERY = 12;
const MAX_SPECS = 30;
const MAX_PRICE = 1_000_000;
const MAX_STOCK = 100_000;

type Obj = Record<string, unknown>;

function str(
  o: Obj,
  key: string,
  label: string,
  required = false,
  max = MAX_TEXT,
): string | undefined {
  const v = o[key];
  if (v == null || (typeof v === "string" && v.trim() === "")) {
    if (required) throw new ValidationError(`${label} es obligatorio`);
    return undefined;
  }
  if (typeof v !== "string") throw new ValidationError(`${label} inválido`);
  const t = v.trim();
  if (t.length > max)
    throw new ValidationError(`${label} supera ${max} caracteres`);
  return t;
}

function int(
  o: Obj,
  key: string,
  label: string,
  min: number,
  max: number,
): number | null {
  const v = o[key];
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ValidationError(
      `${label} debe ser un entero entre ${min} y ${max}`,
    );
  }
  return n;
}

function money(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > MAX_PRICE)
    throw new ValidationError("Precio inválido");
  return Math.round(n * 100) / 100;
}

function oneOf<T extends string>(
  v: unknown,
  allowed: readonly T[],
  label: string,
): T {
  if (typeof v !== "string" || !allowed.includes(v as T))
    throw new ValidationError(`${label} inválido`);
  return v as T;
}

/** Solo URLs que la tienda puede servir: rutas locales (/images/...) o https (Supabase Storage). */
function imageUrl(v: unknown, label: string): string {
  if (typeof v !== "string") throw new ValidationError(`${label} inválida`);
  const t = v.trim();
  if (/^\/(?!\/)[\w\-./]+$/.test(t) && !t.includes("..")) return t;
  try {
    const u = new URL(t);
    if (u.protocol === "https:") return u.toString();
  } catch {
    /* cae al error */
  }
  throw new ValidationError(
    `${label} debe ser una ruta /images/... o una URL https`,
  );
}

export function validateProduct(body: unknown): ProductInput {
  if (!body || typeof body !== "object")
    throw new ValidationError("Cuerpo inválido");
  const o = body as Obj;

  const name = str(o, "name", "Nombre", true)!;
  const category = oneOf(o.category, CATEGORY_SLUGS, "Categoría");
  const subcategory = o.subcategory
    ? oneOf(o.subcategory, SUBCATEGORY_SLUGS, "Subcategoría")
    : undefined;
  const condition = oneOf(
    o.condition ?? "nuevo",
    ["nuevo", "semi-nuevo"] as const,
    "Condición",
  );
  const stockLevel = oneOf(
    o.stockLevel ?? "alto",
    STOCK_LEVELS,
    "Nivel de stock",
  );

  const colorHex = str(o, "colorHex", "Color hex");
  if (colorHex && !/^#[0-9A-Fa-f]{6}$/.test(colorHex))
    throw new ValidationError("Color hex debe ser #RRGGBB");

  const storage = str(o, "storage", "Capacidad");
  const color = str(o, "color", "Color");
  const size = str(o, "size", "Tamaño");
  const bandSize = str(o, "bandSize", "Talle");
  const batteryHealth = int(o, "batteryHealth", "Salud de batería", 0, 100);

  // Slug: el que manda el admin o uno armado con nombre + variante (mismo criterio que data/products.ts).
  const rawSlug = str(o, "slug", "Slug");
  const slug = slugify(
    rawSlug ??
      [
        name,
        size,
        storage,
        color,
        bandSize,
        batteryHealth ?? "",
        condition === "semi-nuevo" ? "semi-nuevo" : "",
      ]
        .filter(Boolean)
        .join(" "),
  );
  if (!slug) throw new ValidationError("Slug inválido");

  const galleryRaw = o.gallery ?? [];
  if (!Array.isArray(galleryRaw) || galleryRaw.length > MAX_GALLERY) {
    throw new ValidationError(`La galería admite hasta ${MAX_GALLERY} fotos`);
  }
  const gallery = galleryRaw.map((g, i) => imageUrl(g, `Foto ${i + 1}`));
  const image = o.image
    ? imageUrl(o.image, "Foto principal")
    : (gallery[0] ?? null);

  const specsRaw = o.specifications ?? {};
  if (typeof specsRaw !== "object" || Array.isArray(specsRaw))
    throw new ValidationError("Especificaciones inválidas");
  const specEntries = Object.entries(specsRaw as Obj);
  if (specEntries.length > MAX_SPECS)
    throw new ValidationError(`Máximo ${MAX_SPECS} especificaciones`);
  const specifications: Record<string, string> = {};
  for (const [k, v] of specEntries) {
    const key = k.trim().slice(0, 60);
    if (!key || typeof v !== "string") continue;
    specifications[key] = v.trim().slice(0, MAX_TEXT);
  }

  return {
    slug,
    name,
    model: slugify(str(o, "model", "Modelo") ?? name),
    brand: str(o, "brand", "Marca") ?? "Apple",
    category,
    subcategory,
    condition,
    price: money(o.price),
    stock: int(o, "stock", "Stock", 0, MAX_STOCK),
    stockLevel,
    color,
    colorHex,
    storage,
    batteryHealth: batteryHealth ?? undefined,
    size,
    bandSize,
    image,
    gallery,
    description:
      str(o, "description", "Descripción", false, MAX_DESCRIPTION) ?? "",
    specifications,
    featured: o.featured === true,
    wholesale: o.wholesale === true,
    active: o.active !== false,
    sortOrder: int(o, "sortOrder", "Orden", 0, 1_000_000) ?? 0,
  };
}

/** Edición rápida desde la tabla o acciones masivas: solo los campos que vienen. */
export interface ProductPatch {
  price?: number | null;
  stock?: number | null;
  stockLevel?: StockLevel;
  active?: boolean;
  featured?: boolean;
}

export function validatePatch(body: unknown): ProductPatch {
  if (!body || typeof body !== "object")
    throw new ValidationError("Cuerpo inválido");
  const o = body as Obj;
  const patch: ProductPatch = {};
  if ("price" in o) patch.price = money(o.price);
  if ("stock" in o) patch.stock = int(o, "stock", "Stock", 0, MAX_STOCK);
  if ("stockLevel" in o)
    patch.stockLevel = oneOf(o.stockLevel, STOCK_LEVELS, "Nivel de stock");
  if ("active" in o) patch.active = o.active === true;
  if ("featured" in o) patch.featured = o.featured === true;
  if (Object.keys(patch).length === 0)
    throw new ValidationError("Nada para actualizar");
  return patch;
}

const MAX_BULK = 500;

/** Lista de ids (uuid) para acciones masivas. */
export function validateIds(v: unknown): string[] {
  if (!Array.isArray(v) || v.length === 0 || v.length > MAX_BULK) {
    throw new ValidationError(`Elegí entre 1 y ${MAX_BULK} productos`);
  }
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!v.every((id) => typeof id === "string" && uuid.test(id)))
    throw new ValidationError("Ids inválidos");
  return v as string[];
}

export function validateSettings(body: unknown): StoreSettings {
  if (!body || typeof body !== "object")
    throw new ValidationError("Cuerpo inválido");
  const o = body as Obj;
  const arsRate = Number(o.arsRate);
  if (!Number.isFinite(arsRate) || arsRate <= 0 || arsRate > MAX_PRICE) {
    throw new ValidationError("Cotización inválida");
  }
  return {
    arsRate: Math.round(arsRate * 100) / 100,
    announcement: str(o, "announcement", "Anuncio", false, 160) ?? "",
  };
}
