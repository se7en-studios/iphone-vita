"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatUSD, STOCK_LABEL } from "@/lib/format";

/** Selector de colores grande: cambia foto, nombre y precio del modelo. */
export function ColorPicker({ variants }: { variants: Product[] }) {
  const [i, setI] = useState(0);
  const active = variants[i];
  if (!active) return null;

  return (
    <section
      id="colores"
      className="scroll-mt-28 border-t border-white/10 bg-black py-16 text-white md:py-40"
    >
      <div
        data-reveal
        className="mx-auto max-w-[980px] px-4 text-center md:px-8"
      >
        <p className="text-lg font-semibold text-[#ebd7be] md:text-xl">
          Colores
        </p>
        <h2 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          {active.name}, en {variants.length} colores.
        </h2>
      </div>

      <div
        data-reveal
        className="stage relative mx-auto mt-10 aspect-square w-full max-w-[560px] overflow-hidden rounded-[28px] md:mt-16"
      >
        {variants.map((v, idx) =>
          v.image ? (
            <Image
              key={v.slug}
              src={v.image}
              alt={`${v.name} color ${v.color}`}
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              aria-hidden={idx !== i}
              className={`stage-product object-contain p-6 transition-all duration-700 ease-[var(--ease-soft)] ${idx === i ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
            />
          ) : null,
        )}
      </div>

      <div className="mx-auto mt-10 max-w-md px-4 text-center">
        <div
          className="flex justify-center gap-4"
          role="radiogroup"
          aria-label={`Color del ${active.name}`}
        >
          {variants.map((v, idx) => (
            <button
              key={v.slug}
              type="button"
              role="radio"
              aria-checked={idx === i}
              aria-label={v.color}
              onClick={() => setI(idx)}
              className={`size-9 rounded-full ring-1 ring-white/25 transition ${idx === i ? "ring-2 ring-white ring-offset-4 ring-offset-black" : "hover:scale-110"}`}
              style={{ background: v.colorHex }}
            />
          ))}
        </div>
        <p className="mt-6 text-xl font-semibold" aria-live="polite">
          {active.color}
        </p>
        <p className="mt-1 text-sm text-white/50">
          {[active.storage, "aluminio", STOCK_LABEL[active.stockLevel]]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-6 flex items-center justify-center gap-6">
          {active.price != null && (
            <p className="tabular text-lg text-white">
              {formatUSD(active.price)}
            </p>
          )}
          <Link
            href={`/producto/${active.slug}`}
            className="rounded-full bg-[#ebd7be] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white"
          >
            Comprar
          </Link>
        </div>
      </div>
    </section>
  );
}
