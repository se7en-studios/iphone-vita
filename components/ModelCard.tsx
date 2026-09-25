"use client";

import Link from "next/link";
import { useState } from "react";
import type { ModelGroup } from "@/lib/products";
import { uniqueColors } from "@/lib/products";
import { formatUSD, STOCK_LABEL } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { ColorDots } from "./ui/ColorDots";
import { ArrowIcon } from "./ui/Icons";

/** Card grande de un modelo con sus variantes de color. */
export function ModelCard({ group, size = "lg", dark = true, stretch = false }: { group: ModelGroup; size?: "lg" | "md"; dark?: boolean; stretch?: boolean }) {
  const colors = uniqueColors(group.variants);
  const [active, setActive] = useState(colors[0]);
  const specs = [...new Set(group.variants.map((v) => [v.size, v.storage].filter(Boolean).join(" · ")))].filter(Boolean);

  return (
    <Link
      href={`/producto/${active.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[32px] transition duration-500 hover:-translate-y-1 ${
        dark
          ? "bg-[#0a0a0a] text-white ring-1 ring-white/10 hover:ring-[#ebd7be]/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
          : "bg-mist"
      }`}
    >
      <ProductVisual
        product={active}
        tone={dark ? "dark" : "light"}
        className={stretch ? "aspect-[4/5] lg:aspect-auto lg:min-h-[380px] lg:flex-1" : size === "lg" ? "aspect-[4/5] md:aspect-[5/6]" : "aspect-[4/5]"}
        sizes="(max-width: 768px) 100vw, 40vw"
      />
      <div className={`flex flex-col gap-4 p-6 md:p-7 ${stretch ? "" : "flex-1"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-serif-luxury font-bold tracking-wide uppercase text-white md:text-[22px] group-hover:text-[#ebd7be] transition">
              {group.name}
            </h3>
            <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-muted"}`}>{specs.join(" / ")}</p>
          </div>
          <span className={`grid size-10 shrink-0 place-items-center rounded-full transition group-hover:translate-x-1 group-hover:bg-[#ebd7be] group-hover:text-[#050b18] ${dark ? "bg-white/10 text-white" : "bg-white"}`}>
            <ArrowIcon />
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            {colors.length > 1 && <ColorDots variants={colors} activeSlug={active.slug} onSelect={setActive} dark={dark} />}
            <p className={`text-xs ${dark ? "text-white/50" : "text-muted"}`}>
              {active.color} · {STOCK_LABEL[active.stockLevel]}
            </p>
          </div>
          {group.fromPrice != null && (
            <div className="flex items-center gap-2 rounded-full border border-[#ebd7be]/30 bg-[#ebd7be]/10 px-3.5 py-1 text-right">
              <span className="text-[11px] uppercase tracking-wider text-[#ebd7be]/80">Desde</span>
              <span className="text-base font-serif-luxury font-bold text-[#ebd7be]">{formatUSD(group.fromPrice)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
