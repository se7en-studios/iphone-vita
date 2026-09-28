"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/types";
import { isOutOfStock } from "@/lib/format";
import { productMessage, restockMessage, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

const ADDED_FEEDBACK_MS = 1600;
const WA_BUTTON =
  "flex items-center justify-center gap-2 rounded-full border border-fg/20 bg-fg/5 py-3.5 text-sm font-medium text-fg transition hover:border-fg/40 hover:bg-fg/10 hover:text-fg";

/**
 * Botones de compra de un producto:
 * - precio fijo con stock → carrito
 * - precio a consultar → WhatsApp
 * - sin stock → "Avisame cuando llegue" por WhatsApp
 */
export function BuyButtons({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [added]);

  if (isOutOfStock(product)) {
    return (
      <a
        href={waLink(restockMessage(product))}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-[#ebd7be] py-4 text-sm font-bold text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(235,215,190,0.4)]"
      >
        <ChatIcon className="size-4" /> Avisame cuando llegue
      </a>
    );
  }

  const wa = (
    <a
      href={waLink(productMessage(product))}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] py-3.5 text-sm font-medium text-white transition-all duration-300 hover:border-[#ebd7be]/40 hover:bg-white/[0.08]"
    >
      <ChatIcon className="size-4 text-[#ebd7be]" /> Consultar por WhatsApp
    </a>
  );
  if (product.priceType === "consultar" || product.price == null)
    return <div className="grid">{wa}</div>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => {
          add(product.slug);
          setOpen(true);
        }}
        className="rounded-full bg-[#ebd7be] py-4 text-sm font-bold text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_25px_rgba(235,215,190,0.4)] hover:scale-[1.01]"
      >
        Comprar ahora
      </button>
      <button
        type="button"
        onClick={() => {
          add(product.slug);
          setAdded(true);
        }}
        className="rounded-full border border-white/20 bg-white/5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10"
        aria-live="polite"
      >
        {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
      </button>
      <div className="sm:col-span-2">{wa}</div>
    </div>
  );
}
