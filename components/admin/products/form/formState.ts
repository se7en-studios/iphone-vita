import type {
  CategorySlug,
  Condition,
  Product,
  StockLevel,
  SubcategorySlug,
} from "@/types";
import type { ProductInput } from "@/lib/product-row";
import { extraSpecs } from "@/lib/product-row";

// Mismos límites que lib/validation.ts: el servidor valida igual, esto es para avisar antes.
export const LIMITS = {
  text: 200,
  description: 4000,
  gallery: 12,
  specs: 30,
  specKey: 60,
  price: 1_000_000,
  stock: 100_000,
  sortOrder: 1_000_000,
} as const;

export interface SpecRow {
  key: string;
  value: string;
}

/** Todo como string: así los inputs vacíos son "" y no 0. */
export interface FormState {
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  subcategory: SubcategorySlug | "";
  model: string;
  condition: Condition;
  color: string;
  colorHex: string;
  storage: string;
  size: string;
  bandSize: string;
  batteryHealth: string;
  price: string;
  consultar: boolean;
  stock: string;
  stockLevel: StockLevel;
  images: string[];
  description: string;
  specs: SpecRow[];
  active: boolean;
  featured: boolean;
  wholesale: boolean;
  sortOrder: string;
}

export type FormErrors = Partial<Record<keyof FormState, string>>;

const str = (v: string | number | null | undefined) =>
  v == null ? "" : String(v);

/** Estado inicial. `duplicate` borra slug para cargar otra variante del mismo modelo. */
export function fromProduct(p: Product | null, duplicate = false): FormState {
  const images = p
    ? [
        ...new Set(
          [p.image, ...p.gallery].filter((x): x is string => Boolean(x)),
        ),
      ]
    : [];
  // Las specs derivadas (Capacidad, Color…) las arma el servidor: solo se editan las extra.
  const specs = p
    ? Object.entries(extraSpecs(p, p.specifications)).map(([key, value]) => ({
        key,
        value,
      }))
    : [];
  return {
    slug: duplicate ? "" : str(p?.slug),
    name: str(p?.name),
    brand: p?.brand ?? "Apple",
    category: p?.category ?? "iphone",
    subcategory: p?.subcategory ?? "",
    model: str(p?.model),
    condition: p?.condition ?? "nuevo",
    color: str(p?.color),
    colorHex: str(p?.colorHex),
    storage: str(p?.storage),
    size: str(p?.size),
    bandSize: str(p?.bandSize),
    batteryHealth: str(p?.batteryHealth),
    price: str(p?.price),
    consultar: p ? p.price == null : false,
    stock: str(p?.stock),
    stockLevel: p?.stockLevel ?? "alto",
    images,
    description: str(p?.description),
    specs,
    active: p?.active !== false,
    featured: Boolean(p?.featured),
    wholesale: Boolean(p?.wholesale),
    sortOrder: str(p?.sortOrder ?? 0),
  };
}

const opt = (s: string) => (s.trim() === "" ? undefined : s.trim());

export function toInput(s: FormState): ProductInput {
  const semi = s.condition === "semi-nuevo";
  return {
    slug: s.slug.trim(),
    name: s.name.trim(),
    brand: s.brand.trim() || "Apple",
    category: s.category,
    subcategory:
      s.category === "accesorios" && s.subcategory ? s.subcategory : undefined,
    model: s.model.trim(),
    condition: s.condition,
    color: opt(s.color),
    colorHex: opt(s.colorHex),
    storage: opt(s.storage),
    size: opt(s.size),
    bandSize: opt(s.bandSize),
    batteryHealth:
      semi && s.batteryHealth ? Number(s.batteryHealth) : undefined,
    price: s.consultar || s.price.trim() === "" ? null : Number(s.price),
    stock: s.stock.trim() === "" ? null : Number(s.stock),
    stockLevel: s.stockLevel,
    image: s.images[0] ?? null,
    gallery: s.images,
    description: s.description.trim(),
    specifications: Object.fromEntries(
      s.specs
        .filter((r) => r.key.trim())
        .map((r) => [r.key.trim(), r.value.trim()]),
    ),
    featured: s.featured,
    wholesale: s.wholesale,
    active: s.active,
    sortOrder: Number(s.sortOrder) || 0,
  };
}

function intIn(v: string, min: number, max: number) {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
}

export function validate(s: FormState): FormErrors {
  const e: FormErrors = {};
  if (!s.name.trim()) e.name = "El nombre es obligatorio";
  for (const k of [
    "name",
    "brand",
    "model",
    "color",
    "storage",
    "size",
    "bandSize",
    "slug",
  ] as const) {
    if (s[k].trim().length > LIMITS.text)
      e[k] = `Máximo ${LIMITS.text} caracteres`;
  }
  if (s.colorHex && !/^#[0-9A-Fa-f]{6}$/.test(s.colorHex))
    e.colorHex = "Usá el formato #RRGGBB";
  if (
    s.condition === "semi-nuevo" &&
    s.batteryHealth &&
    !intIn(s.batteryHealth, 0, 100)
  )
    e.batteryHealth = "Entre 0 y 100, sin decimales";
  if (!s.consultar) {
    const n = Number(s.price);
    if (s.price.trim() === "")
      e.price = "Cargá el precio o marcá “Consultar precio”";
    else if (!Number.isFinite(n) || n < 0 || n > LIMITS.price)
      e.price = `Entre 0 y ${LIMITS.price.toLocaleString("es-AR")}`;
  }
  if (s.stock && !intIn(s.stock, 0, LIMITS.stock))
    e.stock = `Entero entre 0 y ${LIMITS.stock.toLocaleString("es-AR")}`;
  if (s.images.length > LIMITS.gallery)
    e.images = `Hasta ${LIMITS.gallery} fotos`;
  if (s.description.length > LIMITS.description)
    e.description = `Máximo ${LIMITS.description} caracteres`;
  if (s.specs.length > LIMITS.specs)
    e.specs = `Máximo ${LIMITS.specs} especificaciones`;
  else if (
    s.specs.some(
      (r) => r.key.length > LIMITS.specKey || r.value.length > LIMITS.text,
    )
  )
    e.specs = `Nombre hasta ${LIMITS.specKey} y valor hasta ${LIMITS.text} caracteres`;
  if (!intIn(s.sortOrder || "0", 0, LIMITS.sortOrder))
    e.sortOrder = "Entero positivo";
  return e;
}

/** Producto "de mentira" para la preview en vivo. */
export function previewProduct(s: FormState): Product {
  const input = toInput(s);
  return {
    ...input,
    id: "preview",
    name: input.name || "Nombre del producto",
    priceType: input.price == null ? "consultar" : "fijo",
    price:
      input.price != null && Number.isFinite(input.price) ? input.price : null,
    createdAt: "",
  };
}
