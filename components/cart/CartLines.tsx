"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { ProductVisual } from "../ProductVisual";
import { MinusIcon, PlusIcon } from "../ui/Icons";
import { formatUSD } from "@/lib/format";

export function CartLines() {
  const { lines, setQty, remove, setOpen } = useCart();
  return (
    <ul className="divide-y divide-white/10">
      {lines.map(({ product: p, quantity }) => (
        <li key={p.slug} className="flex gap-4 py-5">
          <Link href={`/producto/${p.slug}`} onClick={() => setOpen(false)} className="group block size-20 shrink-0 overflow-hidden rounded-2xl bg-black border border-white/10 p-1">
            <ProductVisual product={p} className="size-full" sizes="80px" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                <p className="truncate text-xs text-white/50">{[p.size, p.storage, p.color].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="tabular shrink-0 text-sm font-bold text-[#ebd7be]">{formatUSD((p.price ?? 0) * quantity)}</p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center rounded-full border border-white/15 bg-white/5">
                <button type="button" aria-label="Restar uno" onClick={() => setQty(p.slug, quantity - 1)} className="grid size-7 place-items-center text-white/70 hover:text-[#ebd7be] transition"><MinusIcon /></button>
                <span className="tabular w-6 text-center text-xs font-semibold text-white">{quantity}</span>
                <button type="button" aria-label="Sumar uno" onClick={() => setQty(p.slug, quantity + 1)} className="grid size-7 place-items-center text-white/70 hover:text-[#ebd7be] transition"><PlusIcon /></button>
              </div>
              <button type="button" onClick={() => remove(p.slug)} className="text-xs text-white/40 underline-offset-4 hover:text-red-400 hover:underline transition">Quitar</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
