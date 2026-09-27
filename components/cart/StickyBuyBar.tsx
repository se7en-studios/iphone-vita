"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { priceLabel } from "@/lib/format";
import { productMessage, waLink } from "@/lib/whatsapp";
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
    "flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#ebd7be] px-5 py-3 text-sm font-semibold text-black transition hover:bg-white";

  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl transition duration-300 ease-[var(--ease-soft)] lg:hidden ${
        shown ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {product.name}
          </p>
          <p className="tabular truncate text-xs text-white/55">
            {[summary, priceLabel(product)].filter(Boolean).join(" · ")}
          </p>
        </div>
        {product.priceType === "consultar" ? (
          <a
            href={waLink(productMessage(product))}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={shown ? 0 : -1}
            className={btn}
          >
            <ChatIcon className="size-4" /> Consultar
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
