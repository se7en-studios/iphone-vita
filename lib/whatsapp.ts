import type { Product } from "@/types";
import { formatARS, formatUSD, fullName } from "./format";

/** Número en formato internacional sin "+" (ej: 5492994386853). Se configura en Vercel. */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492994386853";

/** Alias para transferencias (Lemon). Se puede pisar desde Vercel sin tocar código. */
export const PAYMENT_ALIAS =
  process.env.NEXT_PUBLIC_PAYMENT_ALIAS ?? "iphone.vita.lemon";

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productMessage(p: Product): string {
  if (p.condition === "semi-nuevo") {
    return `Hola iPhone Vita! Me interesa el ${p.name} Semi Nuevo (${p.storage ?? ""} - ${p.color ?? ""}, ${p.batteryHealth ? `${p.batteryHealth}% de batería` : "impecable"}). ¿Sigue disponible y me confirman la cotización en pesos y dólares?`.replace(
      /\s+/g,
      " ",
    );
  }
  if (p.wholesale) {
    return `Hola iPhone Vita! Quiero consultar precio mayorista y disponibilidad para: ${fullName(p)}.`;
  }
  const priceInfo = p.price ? ` ($${p.price} USD)` : "";
  const isIphone = p.category === "iphone";
  const giftPromo = isIphone
    ? " ¿Me confirman si incluye la Funda de silicona + Vidrio templado de REGALO?"
    : "";
  return `Hola iPhone Vita! Estoy interesado en el ${fullName(p)}${priceInfo}.${giftPromo} ¿Tienen stock y cómo sería el pago en pesos o dólares?`.replace(
    /\s+/g,
    " ",
  );
}

export interface CartLine {
  product: Product;
  quantity: number;
}

/** Pedido del carrito: detalle por línea, total en USD y referencia en pesos con la cotización del día. */
export function cartMessage(lines: CartLine[], arsRate?: number): string {
  const priced = lines.filter(
    (l) => l.product.priceType === "fijo" && l.product.price != null,
  );
  const total = priced.reduce(
    (s, l) => s + (l.product.price as number) * l.quantity,
    0,
  );
  const rows = priced.map(({ product: p, quantity }) => {
    const unit = p.price as number;
    const each = quantity > 1 ? ` (${formatUSD(unit)} c/u)` : "";
    return `• ${quantity} × ${fullName(p)} — ${formatUSD(unit * quantity)}${each}`;
  });
  const ars = arsRate
    ? [
        `En pesos: ${formatARS(total, arsRate)} (cotización USD 1 = ${formatARS(1, arsRate)})`,
      ]
    : [];
  return [
    "Hola iPhone Vita! Quiero hacer este pedido:",
    "",
    ...rows,
    "",
    `Total: ${formatUSD(total)}`,
    ...ars,
    "",
    "¿Me confirman disponibilidad y formas de pago?",
  ].join("\n");
}

/** Producto sin stock: pedir aviso cuando vuelva a entrar. */
export function restockMessage(p: Product): string {
  return `Hola iPhone Vita! Vi que el ${fullName(p)} está sin stock. ¿Me avisan cuando vuelva a entrar?`;
}

export const GENERAL_MESSAGE = "Hola iPhone Vita! Quiero hacer una consulta.";
