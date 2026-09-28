"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatUSD } from "@/lib/format";
import { ProductVisual } from "../ProductVisual";

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
          <div key={col} className="text-center">
            <label className="sr-only" htmlFor={`compare-${col}`}>
              Modelo {col + 1}
            </label>
            <select
              id={`compare-${col}`}
              value={picked[col]}
              onChange={(e) =>
                setPicked((prev) =>
                  prev.map((v, i) => (i === col ? Number(e.target.value) : v)),
                )
              }
              className="h-11 w-full rounded-full border border-fg/15 bg-surface px-3 text-sm text-fg focus:border-vita focus:outline-none"
            >
              {models.map((opt, i) => (
                <option key={opt.model} value={i}>
                  {opt.name}
                </option>
              ))}
            </select>
            <ProductVisual
              product={m}
              className="mx-auto mt-5 aspect-square w-full max-w-[160px] rounded-[20px]"
              sizes="45vw"
            />
            {m.price != null && (
              <p className="tabular mt-4 text-sm text-fg/50">
                Desde {formatUSD(m.price)}
              </p>
            )}
            <Link
              href={`/producto/${m.slug}`}
              className="mt-3 inline-flex h-11 items-center rounded-full bg-champagne px-5 text-sm font-semibold text-black transition hover:bg-champagne-light"
            >
              Comprar
            </Link>
          </div>
        ))}
      </div>

      <dl className="mt-8">
        {rows.map((row) => (
          <div key={row} className="border-t border-fg/10 py-5">
            <dt className="text-center text-xs text-fg/50">{row}</dt>
            <div className="mt-2 grid grid-cols-2 gap-3 text-center">
              {cols.map((m, col) => (
                <dd key={col} className="text-[15px] leading-snug">
                  {specs[m.model]?.[row] ?? "—"}
                </dd>
              ))}
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
