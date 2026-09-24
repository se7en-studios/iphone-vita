"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/types";
import { productMessage, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

/** Botones de compra de un producto: carrito para precio fijo, WhatsApp para "consultar". */
export function BuyButtons({ product, layout = "full", dark = false }: { product: Product; layout?: "full" | "compact"; dark?: boolean }) {
  const primary = dark ? "bg-white text-ink hover:bg-white/85" : "bg-ink text-white hover:bg-ink-3";
  const secondary = dark ? "border border-white/20 text-white hover:border-white/60" : "border border-line hover:border-ink";
  const { add, setOpen } = useCart();
  const [added, setAdded] = useState(false);
  const wa = (
    <a
      href={waLink(productMessage(product))}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 rounded-full text-sm font-medium transition ${
        product.priceType === "consultar" ? `${primary} py-3.5` : `${secondary} py-3.5`
      }`}
    >
      <ChatIcon className="size-4" /> Consultar por WhatsApp
    </a>
  );
  if (product.priceType === "consultar") return <div className="grid">{wa}</div>;
  return (
    <div className={`grid gap-3 ${layout === "full" ? "sm:grid-cols-2" : "grid-cols-2"}`}>
      <button
        type="button"
        onClick={() => {
          add(product.slug);
          setOpen(true);
        }}
        className={`rounded-full py-3.5 text-sm font-medium transition ${primary}`}
      >
        Comprar ahora
      </button>
      <button
        type="button"
        onClick={() => {
          add(product.slug);
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
        className={`rounded-full py-3.5 text-sm font-medium transition ${secondary}`}
        aria-live="polite"
      >
        {added ? "Agregado al carrito" : "Agregar al carrito"}
      </button>
      {layout === "full" && <div className="sm:col-span-2">{wa}</div>}
    </div>
  );
}
