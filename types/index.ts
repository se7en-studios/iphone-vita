// Tipos centrales del catálogo. Pensados para mapear 1:1 con tablas de Supabase.

export type Condition = "nuevo" | "semi-nuevo";

/** Nivel de stock tal como lo carga la tienda. */
export type StockLevel = "alto" | "medio" | "bajo";

/** "fijo" muestra precio y permite checkout; "consultar" deriva a WhatsApp. */
export type PriceType = "fijo" | "consultar";

export type CategorySlug =
  | "iphone"
  | "mac"
  | "ipad"
  | "apple-watch"
  | "airpods"
  | "accesorios"
  | "audio"
  | "gaming"
  | "camaras-creators"
  | "wearables";

export type SubcategorySlug =
  | "cables"
  | "cargadores"
  | "apple-pencil"
  | "airtags"
  | "auriculares";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Texto corto para tiles y metadata */
  tagline: string;
  subcategories?: { slug: SubcategorySlug; name: string }[];
}

export interface Product {
  id: string;
  slug: string;
  /** Nombre comercial sin variante: "iPhone 17 Pro" */
  name: string;
  /** Agrupa variantes de color/capacidad: "iphone-17-pro" */
  model: string;
  brand: string;
  category: CategorySlug;
  subcategory?: SubcategorySlug;
  condition: Condition;
  /** Precio en USD. null cuando priceType es "consultar" */
  price: number | null;
  priceType: PriceType;
  /** Unidades exactas cuando se conocen (semi nuevos = 1) */
  stock: number | null;
  stockLevel: StockLevel;
  color?: string;
  /** Color aproximado para los puntitos de variante */
  colorHex?: string;
  storage?: string;
  /** Salud de batería en % (semi nuevos) */
  batteryHealth?: number;
  /** Tamaño (Apple Watch, iPad, MacBook) */
  size?: string;
  /** Talle de malla (Apple Watch) */
  bandSize?: string;
  image: string | null;
  gallery: string[];
  description: string;
  specifications: Record<string, string>;
  featured?: boolean;
  /** Canal mayorista (cables y EarPods) */
  wholesale?: boolean;
  /** false = oculto en la tienda (solo lo ve el admin) */
  active?: boolean;
  /** Orden en el catálogo (menor primero) */
  sortOrder?: number;
  createdAt: string;
}

export interface StoreSettings {
  /** Cotización USD → ARS */
  arsRate: number;
  /** Texto de la barra de anuncios; vacío = default del código */
  announcement: string;
}

export interface CartItem {
  slug: string;
  quantity: number;
}
