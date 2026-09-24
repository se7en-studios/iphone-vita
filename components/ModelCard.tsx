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
export function ModelCard({ group, size = "lg", dark = false, stretch = false }: { group: ModelGroup; size?: "lg" | "md"; dark?: boolean; stretch?: boolean }) {
  const colors = uniqueColors(group.variants);
  const [active, setActive] = useState(colors[0]);
  const specs = [...new Set(group.variants.map((v) => [v.size, v.storage].filter(Boolean).join(" · ")))].filter(Boolean);

  return (
    <Link
      href={`/producto/${active.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[32px] transition duration-500 hover:-translate-y-1 ${dark ? "bg-ink-2 text-white ring-1 ring-line-dark" : "bg-mist"}`}
    >
      <ProductVisual product={active} tone={dark ? "dark" : "light"} className={stretch ? "aspect-[4/3] lg:aspect-auto lg:min-h-[360px] lg:flex-1" : size === "lg" ? "aspect-[4/5] md:aspect-[5/6]" : "aspect-[4/3]"} sizes="(max-width: 768px) 100vw, 40vw" />
      <div className={`flex flex-col gap-4 p-6 md:p-7 ${stretch ? "" : "flex-1"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] md:text-[28px]">{group.name}</h3>
            <p className={`mt-1 text-sm ${dark ? "text-white/55" : "text-muted"}`}>{specs.join(" / ")}</p>
          </div>
          <span className={`grid size-10 shrink-0 place-items-center rounded-full transition group-hover:translate-x-1 ${dark ? "bg-white/10" : "bg-white"}`}>
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
            <p className="tabular text-right">
              <span className={`block text-xs ${dark ? "text-white/45" : "text-muted"}`}>Desde</span>
              <span className="text-lg font-semibold">{formatUSD(group.fromPrice)}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
