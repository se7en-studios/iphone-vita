"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatUSD } from "@/lib/format";
import { ProductVisual } from "../ProductVisual";
import { ChevronIcon } from "../ui/Icons";

/** Mismo escenario gris claro que las miniaturas del comparador de escritorio. */
const THUMB =
  "mx-auto mt-4 aspect-[4/5] w-full max-w-[168px] rounded-[20px] bg-none! bg-bg! ring-1 ring-fg/[0.05] ring-inset";

/** Comparador mobile: dos selectores y dos columnas a lo ancho, como en apple.com. */
export function CompareMobile({
  models,
  specs,
  rows,
}: {
  models: Product[];
  specs: Record<string, Record<string, string>>;
  rows: string[];
}) {
  const [picked, setPicked] = useState([0, Math.min(1, models.length - 1)]);
  const cols = picked.map((i) => models[i]);

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 gap-3">
        {cols.map((m, col) => (
          <div key={col} className="flex flex-col items-center text-center">
            <label className="sr-only" htmlFor={`compare-${col}`}>
              Modelo {col + 1}
            </label>
            <div className="relative w-full">
              <select
                id={`compare-${col}`}
                value={picked[col]}
                onChange={(e) =>
                  setPicked((prev) =>
                    prev.map((v, i) => (i === col ? Number(e.target.value) : v)),
                  )
                }
                className="h-11 w-full appearance-none truncate rounded-full bg-bg pl-4 pr-8 text-[13px] font-semibold text-fg ring-1 ring-fg/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-vita"
              >
                {models.map((opt, i) => (
                  <option key={opt.model} value={i}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 rotate-90 text-fg/50" />
            </div>
            <ProductVisual product={m} className={THUMB} sizes="45vw" />
            {m.price != null && (
              <p className="tabular mt-4 text-sm text-fg/55">
                Desde {formatUSD(m.price)}
              </p>
            )}
            <Link
              href={`/producto/${m.slug}`}
              aria-label={`Comprar ${m.name}`}
              className="mt-3 inline-flex h-11 items-center rounded-full bg-champagne px-6 text-sm font-semibold text-black transition-colors duration-300 hover:bg-champagne-light"
            >
              Comprar
            </Link>
          </div>
        ))}
      </div>

      <dl className="mt-10">
        {rows.map((row) => {
          const differs =
            new Set(cols.map((m) => specs[m.model]?.[row] ?? "—")).size > 1;
          return (
            <div
              key={row}
              className="grid grid-cols-2 gap-x-4 border-t border-fg/[0.08] py-5 text-center"
            >
              <dt className="col-span-2 mb-2 text-xs font-semibold text-fg/50">
                {row}
              </dt>
              {cols.map((m, col) => (
                <dd
                  key={col}
                  className={`text-[15px] leading-snug ${
                    differs ? "font-medium text-fg" : "text-fg/65"
                  }`}
                >
                  {specs[m.model]?.[row] ?? "—"}
                </dd>
              ))}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
