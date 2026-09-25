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
    <Link
      href={`/producto/${active.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-[#081226] text-white ring-1 ring-white/10 transition duration-500 hover:-translate-y-1 hover:ring-[#ebd7be]/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
    >
      <ProductVisual product={active} className="aspect-[4/5]" sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" />
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <ProductBadges product={active} dark />
        <div>
          <p className="text-xs text-white/50">{active.brand}</p>
          <h3 className="font-serif-luxury font-bold uppercase tracking-wide text-[14px] leading-snug md:text-base group-hover:text-[#ebd7be] transition">
            {active.name}
          </h3>
          <p className="mt-0.5 text-xs text-white/60">
            {[active.size, active.storage, active.color, active.batteryHealth ? `${active.batteryHealth}% batería` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        {colors.length > 1 && <ColorDots variants={colors} activeSlug={active.slug} onSelect={setActive} dark />}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-white/10 pt-3">
          <StockNote product={active} dark />
          <span className="tabular font-serif-luxury font-bold whitespace-nowrap text-right text-[15px] text-[#ebd7be]">
            {min != null && varies ? `Desde ${formatUSD(min)}` : priceLabel(active)}
          </span>
        </div>
      </div>
    </Link>
  );
}
