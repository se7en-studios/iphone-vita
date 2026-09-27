"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatUSD, priceLabel } from "@/lib/format";
import { uniqueColors } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";
import { CardTag, StockNote } from "./ui/Badges";
import { ColorDots } from "./ui/ColorDots";

/** Card de catálogo: un modelo con sus variantes filtradas. */
export function CatalogCard({ variants }: { variants: Product[] }) {
  const colors = uniqueColors(variants);
  const [active, setActive] = useState(variants[0]);
  const prices = variants
    .map((v) => v.price)
    .filter((x): x is number => x != null);
  const min = prices.length ? Math.min(...prices) : null;
  const varies = prices.length > 1 && new Set(prices).size > 1;

  return (
    <Link
      href={`/producto/${active.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface text-fg ring-1 ring-fg/10 transition duration-500 hover:-translate-y-1 hover:ring-accent/40 hover:shadow-[var(--card-shadow)] md:rounded-[28px]"
    >
      <div className="relative">
        <CardTag product={active} />
        <ProductVisual
          product={active}
          className="aspect-square md:aspect-[4/5]"
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 md:gap-3 md:p-5">
        <div>
          {active.brand !== "Apple" && (
            <p className="text-xs text-fg/50">{active.brand}</p>
          )}
          <h3 className="text-[14px] font-bold leading-snug transition group-hover:text-highlight md:text-base">
            {active.name}
          </h3>
          <p className="mt-0.5 text-xs text-fg/60">
            {[
              active.size,
              active.storage,
              active.color,
              active.batteryHealth ? `${active.batteryHealth}% batería` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {colors.length > 1 && (
          <ColorDots
            variants={colors}
            activeSlug={active.slug}
            onSelect={setActive}
            dark
          />
        )}
        <div className="mt-auto flex flex-col gap-1 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-2 md:border-t md:border-fg/10 md:pt-3">
          <StockNote product={active} dark />
          <span className="tabular whitespace-nowrap text-[15px] font-bold text-highlight md:text-right">
            {min != null && varies
              ? `Desde ${formatUSD(min)}`
              : priceLabel(active)}
          </span>
        </div>
      </div>
    </Link>
  );
}
