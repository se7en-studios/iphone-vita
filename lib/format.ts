import type { Product, StockLevel } from "@/types";

export const DEFAULT_ARS_RATE = 1380; // Cotización referencial de mercado

export function formatUSD(value: number): string {
  return `USD ${value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export function formatARS(usdValue: number, rate = DEFAULT_ARS_RATE): string {
  const ars = Math.round(usdValue * rate);
  return `$ ${ars.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export function priceLabel(p: Pick<Product, "price" | "priceType">): string {
  return p.priceType === "consultar" || p.price == null ? "Consultar precio" : formatUSD(p.price);
}

export function priceLabelARS(p: Pick<Product, "price" | "priceType">, rate = DEFAULT_ARS_RATE): string | null {
  return p.priceType === "consultar" || p.price == null ? null : formatARS(p.price, rate);
}

/** Sin unidades cargadas: se muestra pero no se puede comprar. */
export function isOutOfStock(p: Pick<Product, "stock">): boolean {
  return p.stock === 0;
}

/** Se puede agregar al carrito: precio fijo y con stock. */
export function canBuy(p: Pick<Product, "price" | "priceType" | "stock">): boolean {
  return p.priceType === "fijo" && p.price != null && !isOutOfStock(p);
}

export const STOCK_LABEL: Record<StockLevel, string> = {
  alto: "Disponible",
  medio: "Stock limitado",
  bajo: "Últimas unidades",
};

export function stockLabel(p: Pick<Product, "stock" | "stockLevel" | "condition">): string {
  if (isOutOfStock(p)) return "Sin stock";
  if (p.condition === "semi-nuevo" && p.stock != null) {
    return p.stock === 1 ? "1 unidad disponible" : `${p.stock} unidades disponibles`;
  }
  return STOCK_LABEL[p.stockLevel];
}

/** Nombre con variante: "iPhone 17 Pro 256GB Cosmic Orange" */
export function fullName(p: Product): string {
  return [p.name, p.size, p.storage, p.color, p.bandSize ? `talle ${p.bandSize}` : ""].filter(Boolean).join(" ");
}

export type Badge = "NUEVO" | "SEMI NUEVO" | "ÚLTIMAS UNIDADES" | "SIN STOCK" | "CONSULTAR";

export function badgesFor(p: Product): Badge[] {
  const b: Badge[] = [];
  b.push(p.condition === "nuevo" ? "NUEVO" : "SEMI NUEVO");
  if (isOutOfStock(p)) b.push("SIN STOCK");
  else if (p.condition === "nuevo" && p.stockLevel === "bajo") b.push("ÚLTIMAS UNIDADES");
  if (p.priceType === "consultar") b.push("CONSULTAR");
  return b;
}
