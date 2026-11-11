"use client";

import Link from "next/link";
import { maxQty, useCart } from "./CartProvider";
import { ProductVisual } from "../ProductVisual";
import { MinusIcon, PlusIcon } from "../ui/Icons";
import { formatUSD } from "@/lib/format";

/** Líneas del carrito: compartidas por el drawer y /carrito (`size` agranda la foto en la página). */
export function CartLines({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { lines, setQty, remove, setOpen } = useCart();
  const lg = size === "lg";
  return (
    <ul className="divide-y divide-fg/[0.08]">
      {lines.map(({ product: p, quantity }) => {
        const atMax = quantity >= maxQty(p);
        const unit = p.price ?? 0;
        const variant = [p.size, p.storage, p.color].filter(Boolean).join(" · ");
        return (
          <li
            key={p.slug}
            className={`flex gap-4 ${lg ? "py-6 md:gap-6 md:py-7" : "py-5"}`}
          >
            <Link
              href={`/producto/${p.slug}`}
              onClick={() => setOpen(false)}
              aria-label={`Ver ${p.name}`}
              className={`group block shrink-0 overflow-hidden rounded-2xl ring-1 ring-fg/[0.06] ${
                lg ? "size-24 md:size-32 md:rounded-[20px]" : "size-[84px]"
              }`}
            >
              <ProductVisual
                product={p}
                className="size-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] motion-reduce:transition-none"
                sizes={lg ? "128px" : "84px"}
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/producto/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className={`line-clamp-2 font-semibold leading-snug tracking-[-0.01em] text-fg transition-colors hover:text-vita ${
                      lg ? "text-[15px] md:text-[17px]" : "text-[15px]"
                    }`}
                  >
                    {p.name}
                  </Link>
                  {variant && (
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-fg/55">{variant}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`tabular font-semibold tracking-[-0.01em] text-fg ${
                      lg ? "text-[15px] md:text-[17px]" : "text-[15px]"
                    }`}
                  >
                    {formatUSD(unit * quantity)}
                  </p>
                  {quantity > 1 && (
                    <p className="tabular mt-0.5 text-xs text-fg/45">
                      {formatUSD(unit)} c/u
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                <div
                  role="group"
                  aria-label={`Cantidad de ${p.name}`}
                  className="flex h-9 items-center rounded-full bg-fg/[0.04] ring-1 ring-fg/10"
                >
                  <button
                    type="button"
                    aria-label={quantity > 1 ? `Restar uno: ${p.name}` : `Quitar ${p.name}`}
                    onClick={() => setQty(p.slug, quantity - 1)}
                    className="grid size-9 place-items-center rounded-full text-fg/70 transition hover:bg-fg/[0.06] hover:text-fg"
                  >
                    <MinusIcon className="size-3.5" />
                  </button>
                  <span
                    className="tabular w-7 text-center text-sm font-semibold text-fg"
                    aria-live="polite"
                    aria-label={`Cantidad: ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Sumar uno: ${p.name}`}
                    onClick={() => setQty(p.slug, quantity + 1)}
                    disabled={atMax}
                    title={atMax ? "No hay más unidades disponibles" : undefined}
                    className="grid size-9 place-items-center rounded-full text-fg/70 transition hover:bg-fg/[0.06] hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <PlusIcon className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.slug)}
                  aria-label={`Quitar ${p.name} del carrito`}
                  className="rounded-full px-2 py-1.5 text-[13px] font-medium text-link transition-colors hover:text-fg hover:underline hover:underline-offset-4"
                >
                  Quitar
                </button>
              </div>
              {atMax && Number.isFinite(maxQty(p)) && (
                <p className="mt-2 text-xs text-fg/45">
                  Llegaste al máximo disponible ({maxQty(p)}).
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
