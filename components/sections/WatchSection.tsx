"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { formatUSD } from "@/lib/format";
import { uniqueColors } from "@/lib/products";
import { ProductVisual } from "../ProductVisual";
import { StockNote } from "../ui/Badges";
import { ColorDots } from "../ui/ColorDots";
import { BuyButtons } from "../cart/AddToCart";

/** Apple Watch Series 11: elegir tamaño, color y talle de malla. */
export function WatchSection({ variants }: { variants: Product[] }) {
  const sizes = [...new Set(variants.map((v) => v.size!))];
  const [size, setSize] = useState(sizes[sizes.length - 1]);
  const bySize = useMemo(() => variants.filter((v) => v.size === size), [variants, size]);
  const colors = uniqueColors(bySize);
  const [color, setColor] = useState(colors[0].color);
  const byColor = bySize.filter((v) => v.color === color);
  const current = byColor.length ? byColor : bySize.filter((v) => v.color === colors[0].color);
  const [band, setBand] = useState(current[0].bandSize);
  const active = current.find((v) => v.bandSize === band) ?? current[0];

  const pickSize = (s: string) => {
    setSize(s);
    const first = variants.find((v) => v.size === s && v.color === color) ?? variants.find((v) => v.size === s)!;
    setColor(first.color);
    setBand(first.bandSize);
  };

  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        <div data-reveal className="order-2 space-y-8 lg:order-1">
          <div className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Apple Watch Series 11</p>
            <h2 className="text-[clamp(2.4rem,5.6vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.045em]">El tiempo,<br />a tu manera.</h2>
          </div>

          <div className="space-y-6">
            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm text-white/50">Tamaño de caja</legend>
              <div className="flex gap-2">
                {sizes.map((s) => (
                  <button key={s} type="button" onClick={() => pickSize(s)} aria-pressed={s === size} className={`rounded-full px-5 py-2.5 text-sm transition ${s === size ? "bg-white text-ink" : "bg-white/[0.07] hover:bg-white/15"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-sm text-white/50">Color · <span className="text-white">{active.color}</span></legend>
              <ColorDots variants={colors} activeSlug={colors.find((c) => c.color === active.color)?.slug} onSelect={(v) => { setColor(v.color); setBand(v.bandSize); }} size="md" dark />
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-sm text-white/50">Talle de malla</legend>
              <div className="flex gap-2">
                {current.map((v) => (
                  <button key={v.slug} type="button" onClick={() => setBand(v.bandSize)} aria-pressed={v.slug === active.slug} className={`rounded-full px-4 py-2 text-sm transition ${v.slug === active.slug ? "bg-white text-ink" : "bg-white/[0.07] hover:bg-white/15"}`}>
                    {v.bandSize}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-line-dark pt-6">
            <div className="space-y-1">
              <p className="tabular text-3xl font-semibold tracking-tight">{formatUSD(active.price ?? 0)}</p>
              <StockNote product={active} dark />
            </div>
            <Link href={`/producto/${active.slug}`} className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">Ver detalle</Link>
          </div>
          <BuyButtons product={active} layout="compact" dark />
        </div>

        <div data-reveal className="order-1 lg:order-2">
          <ProductVisual product={active} tone="dark" className="aspect-square rounded-[44px]" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
      </div>
    </section>
  );
}
