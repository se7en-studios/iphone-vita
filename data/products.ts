import type { Category, CategorySlug, Condition, PriceType, Product, StockLevel, SubcategorySlug } from "@/types";

/*
 * Catálogo de iPhone Vita.
 * Fuente única de datos: ningún componente declara productos propios.
 * Cuando se conecte Supabase, este archivo se reemplaza por una consulta
 * en lib/products.ts sin tocar los componentes.
 *
 * Imágenes: las rutas en /images son fotos temporales (ver public/images/CREDITOS.txt).
 * Los productos con image: null muestran una ilustración neutra hasta tener foto propia.
 */

export const categories: Category[] = [
  { slug: "iphone", name: "iPhone", tagline: "Nuevos y semi nuevos" },
  { slug: "mac", name: "Mac", tagline: "MacBook Air y MacBook Neo" },
  { slug: "ipad", name: "iPad", tagline: "iPad A16 y iPad Pro M5" },
  { slug: "apple-watch", name: "Apple Watch", tagline: "Series 11" },
  { slug: "airpods", name: "AirPods", tagline: "AirPods 4" },
  {
    slug: "accesorios",
    name: "Accesorios",
    tagline: "Cables, cargadores y más",
    subcategories: [
      { slug: "cables", name: "Cables" },
      { slug: "cargadores", name: "Cargadores" },
      { slug: "apple-pencil", name: "Apple Pencil" },
      { slug: "airtags", name: "AirTags" },
      { slug: "auriculares", name: "Auriculares" },
    ],
  },
  { slug: "audio", name: "Audio", tagline: "JBL" },
  { slug: "gaming", name: "Gaming", tagline: "PlayStation 5" },
  { slug: "camaras-creators", name: "Cámaras & Creators", tagline: "DJI" },
  { slug: "wearables", name: "Wearables", tagline: "Casio" },
];

/* ---------- helpers de carga ---------- */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface Input {
  name: string;
  model?: string;
  brand?: string;
  category: CategorySlug;
  subcategory?: SubcategorySlug;
  condition?: Condition;
  price?: number | null;
  stockLevel: StockLevel;
  stock?: number | null;
  color?: string;
  colorHex?: string;
  storage?: string;
  batteryHealth?: number;
  size?: string;
  bandSize?: string;
  image?: string | null;
  gallery?: string[];
  description?: string;
  specifications?: Record<string, string>;
  featured?: boolean;
  wholesale?: boolean;
  slugExtra?: string;
  createdAt?: string;
}

let seq = 0;
function p(i: Input): Product {
  seq += 1;
  const condition = i.condition ?? "nuevo";
  const priceType: PriceType = i.price == null ? "consultar" : "fijo";
  const slug = slugify(
    [i.name, i.size, i.storage, i.color, i.bandSize, i.batteryHealth ? `${i.batteryHealth}` : "", condition === "semi-nuevo" ? "semi-nuevo" : "", i.slugExtra ?? ""]
      .filter(Boolean)
      .join(" "),
  );
  const specs: Record<string, string> = {};
  if (i.storage) specs["Capacidad"] = i.storage;
  if (i.color) specs["Color"] = i.color;
  if (i.size) specs["Tamaño"] = i.size;
  if (i.bandSize) specs["Talle de malla"] = i.bandSize;
  if (i.batteryHealth) specs["Salud de batería"] = `${i.batteryHealth}%`;
  specs["Condición"] = condition === "nuevo" ? "Nuevo" : "Semi nuevo";
  Object.assign(specs, i.specifications);

  return {
    id: String(seq).padStart(3, "0"),
    slug,
    name: i.name,
    model: i.model ?? slugify(i.name),
    brand: i.brand ?? "Apple",
    category: i.category,
    subcategory: i.subcategory,
    condition,
    price: i.price ?? null,
    priceType,
    stock: i.stock ?? null,
    stockLevel: i.stockLevel,
    color: i.color,
    colorHex: i.colorHex,
    storage: i.storage,
    batteryHealth: i.batteryHealth,
    size: i.size,
    bandSize: i.bandSize,
    image: i.image ?? null,
    gallery: i.gallery ?? [],
    description: i.description ?? "",
    specifications: specs,
    featured: i.featured,
    wholesale: i.wholesale,
    createdAt: i.createdAt ?? "2026-09-01",
  };
}

const IMG = {
  orange: "/images/iphone-pro-cosmic-orange.jpg",
  silver: "/images/iphone-pro-silver.jpg",
  blueBox: "/images/iphone-pro-blue-box.jpg",
  natural: "/images/iphone-pro-natural.jpg",
  pink: "/images/iphone-pink.jpg",
  blueHand: "/images/iphone-blue-hand.jpg",
  dark: "/images/iphone-pro-dark.jpg",
  airpods: "/images/airpods.jpg",
  semiDesert: "/images/semi-desert.jpg",
  semiBlack: "/images/semi-black.jpg",
  semiWhite: "/images/semi-white.jpg",
  semiGrey: "/images/semi-grey.jpg",
  macbookAir: "/images/macbook-air.jpg",
  ipadPro: "/images/ipad-pro.jpg",
  appleWatch: "/images/apple-watch.jpg",
  jbl: "/images/jbl-boombox.jpg",
  ps5: "/images/ps5-joystick.jpg",
  anker: "/images/anker-powerbank.jpg",
};

const HEX = {
  black: "#2B2B2E",
  white: "#F1F1EE",
  silver: "#D9DADC",
  pink: "#F0C4CF",
  teal: "#8FC3BD",
  ultramarine: "#5B6BD1",
  mistBlue: "#A8BAD4",
  sage: "#A9B89C",
  cosmicOrange: "#E0712F",
  deepBlue: "#2C3953",
  skyBlue: "#BCD1E2",
  blush: "#EFCDC6",
  indigo: "#3D4878",
  blue: "#A7C2DE",
  yellow: "#F1DC87",
  spaceBlack: "#28282A",
  jetBlack: "#1C1C1E",
  roseGold: "#E7C3B4",
  midnight: "#222730",
  graphite: "#55534F",
  desert: "#BEA388",
  blackTitanium: "#3A3A3D",
  whiteTitanium: "#E5E3DD",
};

const nuevoIphone = (name: string, color: string) =>
  `${name} en color ${color}. Equipo nuevo.`;

/* ---------- catálogo ---------- */

export const products: Product[] = [
  /* iPhone nuevos */
  p({ name: "iPhone 18 Pro", category: "iphone", storage: "256GB", color: "Silver", colorHex: HEX.silver, price: 1605, stockLevel: "bajo", image: IMG.natural, description: nuevoIphone("iPhone 18 Pro de 256GB", "Silver"), createdAt: "2026-09-20", featured: true }),

  ...(
    [
      ["Black", HEX.black, "alto", null],
      ["Pink", HEX.pink, "medio", IMG.pink],
      ["Teal", HEX.teal, "alto", null],
      ["Ultramarine", HEX.ultramarine, "bajo", IMG.blueHand],
      ["White", HEX.white, "alto", null],
    ] as const
  ).map(([color, hex, stock, img]) =>
    p({ name: "iPhone 16", category: "iphone", storage: "128GB", color, colorHex: hex, price: 812, stockLevel: stock, image: img ?? IMG.pink, description: nuevoIphone("iPhone 16 de 128GB", color) }),
  ),

  ...(
    [
      ["Black", HEX.black, "medio"],
      ["Mist Blue", HEX.mistBlue, "bajo"],
      ["Sage", HEX.sage, "medio"],
      ["White", HEX.white, "bajo"],
    ] as const
  ).map(([color, hex, stock]) =>
    p({ name: "iPhone 17", category: "iphone", storage: "256GB", color, colorHex: hex, price: 972, stockLevel: stock, image: IMG.blueHand, description: nuevoIphone("iPhone 17 de 256GB", color), createdAt: "2026-09-10" }),
  ),

  ...(
    [
      ["Cosmic Orange", HEX.cosmicOrange, "medio", IMG.orange],
      ["Deep Blue", HEX.deepBlue, "alto", IMG.blueBox],
      ["Silver", HEX.silver, "alto", IMG.silver],
    ] as const
  ).flatMap(([color, hex, stock, img]) => [
    p({ name: "iPhone 17 Pro", category: "iphone", storage: "256GB", color, colorHex: hex, price: 1212, stockLevel: stock, image: img, description: nuevoIphone("iPhone 17 Pro de 256GB", color), featured: true, createdAt: "2026-09-12" }),
    p({ name: "iPhone 17 Pro Max", category: "iphone", storage: "256GB", color, colorHex: hex, price: 1286, stockLevel: stock === "medio" ? "medio" : "alto", image: img, description: nuevoIphone("iPhone 17 Pro Max de 256GB", color), featured: true, createdAt: "2026-09-12" }),
  ]),

  /* MacBook */
  p({ name: "MacBook Air 13\"", model: "macbook-air-13", category: "mac", size: "13 pulgadas", storage: "512GB SSD", color: "Sky Blue", colorHex: HEX.skyBlue, price: 1489, stockLevel: "medio", image: IMG.macbookAir, specifications: { Chip: "Apple M5", CPU: "10 núcleos", GPU: "8 núcleos", Memoria: "16GB" }, description: "MacBook Air de 13 pulgadas con chip Apple M5, 16GB de memoria y 512GB SSD." }),
  ...(
    [
      ["Silver", HEX.silver, "medio"],
      ["Sky Blue", HEX.skyBlue, "alto"],
    ] as const
  ).map(([color, hex, stock]) =>
    p({ name: "MacBook Air 15\"", model: "macbook-air-15", category: "mac", size: "15 pulgadas", storage: "512GB SSD", color, colorHex: hex, price: 1641, stockLevel: stock, image: IMG.macbookAir, specifications: { Chip: "Apple M5", CPU: "10 núcleos", GPU: "10 núcleos", Memoria: "16GB" }, description: "MacBook Air de 15 pulgadas con chip Apple M5, 16GB de memoria y 512GB SSD." }),
  ),
  ...(
    [
      ["Blush", HEX.blush, "bajo"],
      ["Indigo", HEX.indigo, "alto"],
      ["Silver", HEX.silver, "alto"],
    ] as const
  ).map(([color, hex, stock]) =>
    p({ name: "MacBook Neo", model: "macbook-neo", category: "mac", size: "13 pulgadas", storage: "512GB", color, colorHex: hex, price: 927, stockLevel: stock, specifications: { Chip: "Apple A18 Pro", Memoria: "8GB", Seguridad: "Touch ID" }, description: "MacBook Neo de 13 pulgadas con chip Apple A18 Pro, 8GB de memoria, 512GB y Touch ID." }),
  ),

  /* iPad */
  ...(
    [
      ["Blue", HEX.blue, "alto"],
      ["Pink", HEX.pink, "medio"],
      ["Silver", HEX.silver, "alto"],
      ["Yellow", HEX.yellow, "alto"],
    ] as const
  ).map(([color, hex, stock]) =>
    p({ name: "iPad A16", model: "ipad-a16", category: "ipad", size: "11 pulgadas", storage: "128GB", color, colorHex: hex, price: 497, stockLevel: stock, specifications: { Chip: "A16", Conectividad: "Wi-Fi" }, description: "iPad de 11 pulgadas con chip A16, Wi-Fi y 128GB." }),
  ),
  p({ name: "iPad Pro M5", model: "ipad-pro-m5", category: "ipad", size: "11 pulgadas", storage: "256GB", color: "Space Black", colorHex: HEX.spaceBlack, price: 1188, stockLevel: "medio", image: IMG.ipadPro, specifications: { Chip: "M5", Conectividad: "Wi-Fi" }, description: "iPad Pro de 11 pulgadas con chip M5, Wi-Fi y 256GB." }),
  p({ name: "iPad Pro M5", model: "ipad-pro-m5", category: "ipad", size: "13 pulgadas", storage: "256GB", color: "Space Black", colorHex: HEX.spaceBlack, price: 1376, stockLevel: "medio", image: IMG.ipadPro, specifications: { Chip: "M5", Conectividad: "Wi-Fi" }, description: "iPad Pro de 13 pulgadas con chip M5, Wi-Fi y 256GB." }),

  /* Apple Watch Series 11 */
  p({ name: "Apple Watch Series 11", model: "apple-watch-series-11", category: "apple-watch", size: "42mm", color: "Silver · Purple Fog", colorHex: HEX.silver, image: IMG.appleWatch, bandSize: "M/L", price: 372, stockLevel: "bajo", specifications: { Caja: "Aluminio Silver", Malla: "Sport Band Purple Fog", Conectividad: "GPS" }, description: "Apple Watch Series 11 GPS de 42mm, caja de aluminio Silver con Sport Band Purple Fog." }),
  p({ name: "Apple Watch Series 11", model: "apple-watch-series-11", category: "apple-watch", size: "42mm", color: "Jet Black", colorHex: HEX.jetBlack, image: IMG.appleWatch, bandSize: "S/M", price: 372, stockLevel: "bajo", specifications: { Caja: "Aluminio Jet Black", Malla: "Sport Band Black", Conectividad: "GPS" }, description: "Apple Watch Series 11 GPS de 42mm Jet Black con Sport Band Black." }),
  p({ name: "Apple Watch Series 11", model: "apple-watch-series-11", category: "apple-watch", size: "46mm", color: "Jet Black", colorHex: HEX.jetBlack, image: IMG.appleWatch, bandSize: "M/L", price: 403, stockLevel: "medio", specifications: { Caja: "Aluminio Jet Black", Malla: "Sport Band Black", Conectividad: "GPS" }, description: "Apple Watch Series 11 GPS de 46mm, caja de aluminio Jet Black con Sport Band Black." }),
  p({ name: "Apple Watch Series 11", model: "apple-watch-series-11", category: "apple-watch", size: "46mm", color: "Jet Black", colorHex: HEX.jetBlack, image: IMG.appleWatch, bandSize: "S/M", price: 403, stockLevel: "bajo", specifications: { Caja: "Aluminio Jet Black", Malla: "Sport Band Black", Conectividad: "GPS" }, description: "Apple Watch Series 11 GPS de 46mm, caja de aluminio Jet Black con Sport Band Black." }),
  p({ name: "Apple Watch Series 11", model: "apple-watch-series-11", category: "apple-watch", size: "46mm", color: "Rose Gold · Light Blush", colorHex: HEX.roseGold, image: IMG.appleWatch, bandSize: "M/L", price: 403, stockLevel: "bajo", specifications: { Caja: "Aluminio Rose Gold", Malla: "Sport Band Light Blush", Conectividad: "GPS" }, description: "Apple Watch Series 11 GPS de 46mm, caja de aluminio Rose Gold con Sport Band Light Blush." }),
  p({ name: "Apple Watch Series 11", model: "apple-watch-series-11", category: "apple-watch", size: "46mm", color: "Silver · Purple Fog", colorHex: HEX.silver, image: IMG.appleWatch, bandSize: "M/L", price: 403, stockLevel: "bajo", specifications: { Caja: "Aluminio Silver", Malla: "Sport Band Purple Fog", Conectividad: "GPS" }, description: "Apple Watch Series 11 GPS de 46mm, caja de aluminio Silver con Sport Band Purple Fog." }),

  /* AirPods y accesorios Apple */
  p({ name: "AirPods 4", category: "airpods", price: 133, stockLevel: "alto", image: IMG.airpods, description: "AirPods 4." }),
  p({ name: "AirPods 4 con cancelación activa de ruido", model: "airpods-4-anc", category: "airpods", price: 184, stockLevel: "alto", image: IMG.airpods, description: "AirPods 4 con cancelación activa de ruido." }),
  p({ name: "AirTag", category: "accesorios", subcategory: "airtags", price: 38, stockLevel: "bajo", specifications: { Unidades: "1" }, description: "Apple AirTag, pack de una unidad." }),
  p({ name: "Apple Pencil Pro", category: "accesorios", subcategory: "apple-pencil", price: 145, stockLevel: "bajo", description: "Apple Pencil Pro." }),
  p({ name: "Apple Pencil USB-C", category: "accesorios", subcategory: "apple-pencil", price: 101, stockLevel: "medio", description: "Apple Pencil USB-C." }),

  /* iPhone semi nuevos — precio a consultar, 1 unidad */
  ...(
    [
      ["iPhone 13", "128GB", "Midnight", HEX.midnight, 87, IMG.dark],
      ["iPhone 13 Pro", "128GB", "Graphite", HEX.graphite, 86, IMG.semiGrey],
      ["iPhone 14 Pro Max", "256GB", "Black", HEX.black, 84, IMG.dark],
      ["iPhone 15 Pro", "512GB", "White", HEX.white, 87, IMG.semiWhite],
      ["iPhone 16 Pro", "128GB", "White", HEX.white, 89, IMG.semiWhite],
      ["iPhone 16 Pro", "256GB", "Desert Titanium", HEX.desert, 89, IMG.semiDesert],
      ["iPhone 16 Pro", "256GB", "Black Titanium", HEX.blackTitanium, 90, IMG.semiBlack],
      ["iPhone 16 Pro", "128GB", "Black Titanium", HEX.blackTitanium, 91, IMG.semiBlack],
      ["iPhone 16 Pro Max", "256GB", "White Titanium", HEX.whiteTitanium, 92, IMG.semiWhite],
      ["iPhone 16 Pro Max", "256GB", "Black Titanium", HEX.blackTitanium, 90, IMG.dark],
    ] as const
  ).map(([name, storage, color, hex, battery, img]) =>
    p({
      name,
      model: `${slugify(name)}-semi-nuevo`,
      category: "iphone",
      condition: "semi-nuevo",
      storage,
      color,
      colorHex: hex,
      batteryHealth: battery,
      price: null,
      stock: 1,
      stockLevel: "bajo",
      image: img,
      description: `${name} de ${storage} en ${color}, con ${battery}% de salud de batería. Equipo seleccionado y revisado por iPhone Vita.`,
    }),
  ),

  /* Cables (mayorista) */
  p({ name: "Cable USB-C a Jack", category: "accesorios", subcategory: "cables", stockLevel: "bajo", wholesale: true, description: "Cable USB-C a Jack. Venta mayorista." }),
  p({ name: "Cable Lightning 1m original", category: "accesorios", subcategory: "cables", stockLevel: "bajo", wholesale: true, specifications: { Largo: "1m" }, description: "Cable Lightning original de 1m. Venta mayorista." }),
  p({ name: "Cable MagSafe 15W inalámbrico original", category: "accesorios", subcategory: "cables", stockLevel: "medio", wholesale: true, specifications: { Potencia: "15W" }, description: "Cargador MagSafe inalámbrico original de 15W. Venta mayorista." }),
  p({ name: "Cable USB-C a Lightning 1m original", category: "accesorios", subcategory: "cables", stockLevel: "alto", wholesale: true, specifications: { Largo: "1m" }, description: "Cable USB-C a Lightning original de 1m. Venta mayorista." }),
  p({ name: "Cable USB-C a Lightning 2m original", category: "accesorios", subcategory: "cables", stockLevel: "medio", wholesale: true, specifications: { Largo: "2m" }, description: "Cable USB-C a Lightning original de 2m. Venta mayorista." }),
  p({ name: "Cable USB-C a USB-C 1m original", category: "accesorios", subcategory: "cables", stockLevel: "alto", wholesale: true, specifications: { Largo: "1m" }, description: "Cable USB-C a USB-C original de 1m. Venta mayorista." }),
  p({ name: "Cable USB-C a USB-C 2m original para MacBook", category: "accesorios", subcategory: "cables", stockLevel: "medio", wholesale: true, specifications: { Largo: "2m" }, description: "Cable USB-C a USB-C original de 2m para MacBook. Venta mayorista." }),

  /* Transformadores */
  p({ name: "Transformador 20W original Apple", category: "accesorios", subcategory: "cargadores", stockLevel: "alto", specifications: { Potencia: "20W" }, description: "Transformador original Apple de 20W." }),
  p({ name: "Transformador 40W Dynamic Power Adapter", category: "accesorios", subcategory: "cargadores", stockLevel: "alto", specifications: { Potencia: "40W" }, description: "Dynamic Power Adapter de 40W." }),

  /* Auriculares */
  p({ name: "EarPods USB-C originales", category: "accesorios", subcategory: "auriculares", stockLevel: "bajo", wholesale: true, description: "EarPods USB-C originales. Venta mayorista." }),

  /* Otras marcas */
  p({ name: "JBL Boombox 4", brand: "JBL", category: "audio", color: "Black", colorHex: HEX.black, price: 620, stockLevel: "medio", image: IMG.jbl, specifications: { Resistencia: "Waterproof" }, description: "Parlante JBL Boombox 4 Waterproof, color Black." }),
  p({ name: "Joystick PS5", brand: "PlayStation", category: "gaming", color: "White", colorHex: HEX.white, price: 90, stockLevel: "alto", image: IMG.ps5, description: "Joystick para PlayStation 5, color White." }),
  p({ name: "DJI Mic Mini", brand: "DJI", category: "camaras-creators", price: 150, stockLevel: "medio", description: "Micrófono inalámbrico DJI Mic Mini." }),
  p({ name: "Anker Power Bank 10K mAh", brand: "Anker", category: "accesorios", subcategory: "cargadores", price: 41, stockLevel: "bajo", image: IMG.anker, specifications: { Capacidad: "10.000 mAh" }, description: "Batería portátil Anker de 10.000 mAh." }),

  /* Casio */
  ...(
    [
      ["A700WEVG-9AVT", 85],
      ["B650WC-5AVT", 105],
      ["BGD-10K-4CR", 109],
      ["BGD10K-2", 109],
      ["GA-2100-1ACR", 111],
      ["GA700UC-5A", 136],
      ["MTPB145DC-3A", 126],
    ] as const
  ).map(([ref, price]) =>
    p({ name: `Casio ${ref}`, model: `casio-${slugify(ref)}`, brand: "Casio", category: "wearables", price, stockLevel: "bajo", specifications: { Modelo: ref }, description: `Reloj Casio modelo ${ref}.` }),
  ),
];
