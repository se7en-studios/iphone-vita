"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatUSD, priceLabel } from "@/lib/format";
import { uniqueColors } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";
import { ProductBadges, StockNote } from "./ui/Badges";
import { ColorDots } from "./ui/ColorDots";

/** Card de catálogo: un modelo con sus variantes filtradas. */
export function CatalogCard({ variants }: { variants: Product[] }) {
  const colors = uniqueColors(variants);
  const [active, setActive] = useState(variants[0]);
  const prices = variants.map((v) => v.price).filter((x): x is number => x != null);
  const min = prices.length ? Math.min(...prices) : null;
  const varies = prices.length > 1 && new Set(prices).size > 1;

  return (
    <Link href={`/producto/${active.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-mist transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
      <ProductVisual product={active} className="aspect-[4/5]" sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" />
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <ProductBadges product={active} />
        <div>
          <p className="text-xs text-muted">{active.brand}</p>
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight md:text-base">{active.name}</h3>
          <p className="mt-0.5 text-[13px] text-muted">
            {[active.size, active.storage, active.color, active.batteryHealth ? `${active.batteryHealth}% batería` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        {colors.length > 1 && <ColorDots variants={colors} activeSlug={active.slug} onSelect={setActive} />}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-black/5 pt-3">
          <StockNote product={active} />
          <span className="tabular whitespace-nowrap text-right text-[15px] font-semibold">
            {min != null && varies ? `Desde ${formatUSD(min)}` : priceLabel(active)}
          </span>
        </div>
      </div>
    </Link>
  );
}
