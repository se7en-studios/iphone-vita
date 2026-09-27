"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/types";
import { productMessage, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

/** Botones de compra de un producto: carrito para precio fijo, WhatsApp para "consultar". */
export function BuyButtons({ product, layout = "full", dark = false }: { product: Product; layout?: "full" | "compact"; dark?: boolean }) {
  const primary = "bg-accent text-accent-fg hover:brightness-110 font-semibold";
  const secondary = "border border-fg/20 text-fg hover:border-fg/50 hover:bg-fg/5";
  const { add, setOpen } = useCart();
  const [added, setAdded] = useState(false);
  const wa = (
    <a
      href={waLink(productMessage(product))}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-full border border-fg/20 bg-fg/5 py-3.5 text-sm font-medium text-fg transition hover:border-fg/40 hover:bg-fg/10 hover:text-fg"
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
