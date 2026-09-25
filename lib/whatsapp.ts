import type { Product } from "@/types";
import { formatUSD, fullName } from "./format";

/** Número en formato internacional sin "+" (ej: 5492994386853). Se configura en Vercel. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492994386853";

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productMessage(p: Product): string {
  if (p.condition === "semi-nuevo") {
    return `Hola iPhone Vita! Me interesa el ${p.name} Semi Nuevo (${p.storage ?? ""} - ${p.color ?? ""}, ${p.batteryHealth ? `${p.batteryHealth}% de batería` : "impecable"}). ¿Sigue disponible y me confirman la cotización en pesos y dólares?`.replace(/\s+/g, " ");
  }
  if (p.wholesale) {
    return `Hola iPhone Vita! Quiero consultar precio mayorista y disponibilidad para: ${fullName(p)}.`;
  }
  const priceInfo = p.price ? ` ($${p.price} USD)` : "";
  const isIphone = p.category === "iphone";
  const giftPromo = isIphone ? " ¿Me confirman si incluye la Funda de silicona + Vidrio templado de REGALO?" : "";
  return `Hola iPhone Vita! Estoy interesado en el ${fullName(p)}${priceInfo}.${giftPromo} ¿Tienen stock y cómo sería el pago en pesos o dólares?`.replace(/\s+/g, " ");
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export function cartMessage(lines: CartLine[]): string {
  const priced = lines.filter((l) => l.product.priceType === "fijo" && l.product.price != null);
  const total = priced.reduce((s, l) => s + (l.product.price as number) * l.quantity, 0);
  const rows = priced.map((l) => `• ${l.quantity} × ${fullName(l.product)} — ${formatUSD((l.product.price as number) * l.quantity)}`);
  return [
    "Hola iPhone Vita! Quiero hacer este pedido:",
    "",
    ...rows,
    "",
    `Total: ${formatUSD(total)}`,
    "",
    "¿Me confirman disponibilidad y formas de pago?",
  ].join("\n");
}

export const GENERAL_MESSAGE = "Hola iPhone Vita! Quiero hacer una consulta.";
