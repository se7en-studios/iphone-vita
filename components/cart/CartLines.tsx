"use client";

import Link from "next/link";
import { maxQty, useCart } from "./CartProvider";
import { ProductVisual } from "../ProductVisual";
import { MinusIcon, PlusIcon } from "../ui/Icons";
import { formatUSD } from "@/lib/format";

export function CartLines() {
  const { lines, setQty, remove, setOpen } = useCart();
  return (
    <ul className="divide-y divide-fg/10">
      {lines.map(({ product: p, quantity }) => {
        const atMax = quantity >= maxQty(p);
        return (
          <li key={p.slug} className="flex gap-4 py-5">
            <Link
              href={`/producto/${p.slug}`}
              onClick={() => setOpen(false)}
              className="group block size-20 shrink-0 overflow-hidden rounded-2xl border border-fg/10 bg-bg p-1"
            >
              <ProductVisual product={p} className="size-full" sizes="80px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-fg/50">
                    {[p.size, p.storage, p.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="tabular shrink-0 text-sm font-bold text-highlight">
                  {formatUSD((p.price ?? 0) * quantity)}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center rounded-full border border-fg/15 bg-fg/5">
                  <button
                    type="button"
                    aria-label={`Restar uno: ${p.name}`}
                    onClick={() => setQty(p.slug, quantity - 1)}
                    className="grid size-9 place-items-center text-fg/70 transition hover:text-highlight"
                  >
                    <MinusIcon />
                  </button>
                  <span
                    className="tabular w-6 text-center text-xs font-semibold text-fg"
                    aria-label={`Cantidad: ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Sumar uno: ${p.name}`}
                    onClick={() => setQty(p.slug, quantity + 1)}
                    disabled={atMax}
                    title={
                      atMax ? "No hay más unidades disponibles" : undefined
                    }
                    className="grid size-9 place-items-center text-fg/70 transition hover:text-highlight disabled:opacity-30 disabled:hover:text-fg/70"
                  >
                    <PlusIcon />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.slug)}
                  className="py-2 text-xs text-fg/50 underline-offset-4 transition hover:text-red-500 hover:underline"
                >
                  Quitar
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
