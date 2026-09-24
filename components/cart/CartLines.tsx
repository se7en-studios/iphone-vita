"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { ProductVisual } from "../ProductVisual";
import { MinusIcon, PlusIcon } from "../ui/Icons";
import { formatUSD } from "@/lib/format";

export function CartLines() {
  const { lines, setQty, remove, setOpen } = useCart();
  return (
    <ul className="divide-y divide-line">
      {lines.map(({ product: p, quantity }) => (
        <li key={p.slug} className="flex gap-4 py-5">
          <Link href={`/producto/${p.slug}`} onClick={() => setOpen(false)} className="group block size-20 shrink-0 overflow-hidden rounded-2xl bg-mist">
            <ProductVisual product={p} className="size-full" sizes="80px" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted">{[p.size, p.storage, p.color].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="tabular shrink-0 text-sm font-medium">{formatUSD((p.price ?? 0) * quantity)}</p>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center rounded-full border border-line">
                <button type="button" aria-label="Restar uno" onClick={() => setQty(p.slug, quantity - 1)} className="grid size-8 place-items-center hover:text-vita"><MinusIcon /></button>
                <span className="tabular w-6 text-center text-sm">{quantity}</span>
                <button type="button" aria-label="Sumar uno" onClick={() => setQty(p.slug, quantity + 1)} className="grid size-8 place-items-center hover:text-vita"><PlusIcon /></button>
              </div>
              <button type="button" onClick={() => remove(p.slug)} className="text-xs text-muted underline-offset-4 hover:underline">Quitar</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
