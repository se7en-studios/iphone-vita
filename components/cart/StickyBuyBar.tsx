"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { canBuy, isOutOfStock, priceLabel } from "@/lib/format";
import { productMessage, restockMessage, waLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { ChatIcon } from "../ui/Icons";

/** Barra de compra fija en mobile: aparece cuando la caja de compra sale de pantalla. */
export function StickyBuyBar({
  product,
  targetId,
  summary,
}: {
  product: Product;
  targetId: string;
  summary: string;
}) {
  const { add, setOpen } = useCart();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const io = new IntersectionObserver(([e]) =>
      // Solo cuando la caja quedó arriba (ya la pasaste), no antes de llegar.
      setShown(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    io.observe(target);
    return () => io.disconnect();
  }, [targetId]);

  useEffect(() => {
    const root = document.documentElement;
    if (shown) root.dataset.buybar = "";
    else delete root.dataset.buybar;
    return () => {
      delete root.dataset.buybar;
    };
  }, [shown]);

  const btn =
    "flex h-11 shrink-0 items-center justify-center gap-2 rounded-full! bg-fg px-5 text-sm font-semibold text-surface shadow-[0_6px_18px_-10px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:bg-fg/90";
  const out = isOutOfStock(product);
  const consult = !out && (product.priceType === "consultar" || product.price == null);

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-fg/[0.08] bg-surface/85 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.18)] backdrop-blur-xl backdrop-saturate-150 transition duration-500 ease-[var(--ease-out-expo)] lg:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-fg/55">
            {product.name}
            {summary ? ` · ${summary}` : ""}
          </p>
          <p
            className={`tabular truncate text-[17px] font-semibold tracking-[-0.02em] ${
              out ? "text-fg/40" : consult ? "text-vita" : "text-fg"
            }`}
          >
            {out ? "Sin stock" : priceLabel(product)}
          </p>
        </div>
        {!canBuy(product) ? (
          <a
            href={waLink(out ? restockMessage(product) : productMessage(product))}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={shown ? 0 : -1}
            className={btn}
          >
            <ChatIcon className="size-4" /> {out ? "Avisame" : "Consultar"}
          </a>
        ) : (
          <button
            type="button"
            tabIndex={shown ? 0 : -1}
            onClick={() => {
              add(product.slug);
              setOpen(true);
            }}
            className={btn}
          >
            Comprar
          </button>
        )}
      </div>
    </div>
  );
}
