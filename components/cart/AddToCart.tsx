"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/types";
import { isOutOfStock } from "@/lib/format";
import { productMessage, restockMessage, waLink } from "@/lib/whatsapp";
import { BagIcon, ChatIcon, CheckIcon } from "../ui/Icons";

const ADDED_FEEDBACK_MS = 1600;
/* rounded-full! : el :focus-visible global fija border-radius 6px y deformaba las píldoras. */
const PRIMARY =
  "sheen flex h-[52px] items-center justify-center gap-2 rounded-full! bg-fg px-6 text-[15px] font-semibold text-surface shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] transition-colors duration-300 hover:bg-fg/90";
const SECONDARY =
  "flex h-[52px] items-center justify-center gap-2 rounded-full! bg-surface px-6 text-[15px] font-semibold text-fg ring-1 ring-fg/15 transition duration-300 hover:bg-bg hover:ring-fg/30";
const WA_BUTTON =
  "flex h-12 items-center justify-center gap-2 rounded-full! px-6 text-sm font-medium text-fg/80 ring-1 ring-fg/[0.1] transition duration-300 hover:bg-bg hover:text-fg hover:ring-fg/25";

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
        className={PRIMARY}
      >
        <ChatIcon className="size-4" /> Avisame cuando llegue
      </a>
    );
  }

  const consult = product.priceType === "consultar" || product.price == null;
  const wa = (
    <a
      href={waLink(productMessage(product))}
      target="_blank"
      rel="noopener noreferrer"
      className={consult ? PRIMARY : WA_BUTTON}
    >
      <ChatIcon className={`size-4 ${consult ? "" : "text-[#25d366]"}`} /> Consultar por WhatsApp
    </a>
  );
  if (consult)
    return <div className="grid">{wa}</div>;

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => {
          add(product.slug);
          setOpen(true);
        }}
        className={PRIMARY}
      >
        Comprar ahora
      </button>
      <button
        type="button"
        onClick={() => {
          add(product.slug);
          setAdded(true);
        }}
        className={SECONDARY}
        aria-live="polite"
      >
        {added ? (
          <>
            <CheckIcon className="size-4 text-vita" /> Agregado al carrito
          </>
        ) : (
          <>
            <BagIcon className="size-4" /> Agregar al carrito
          </>
        )}
      </button>
      <div className="sm:col-span-2">{wa}</div>
    </div>
  );
}
