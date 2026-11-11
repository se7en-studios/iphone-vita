import Link from "next/link";
import type { Product } from "@/types";
import { priceLabel } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { CardTag, StockNote } from "./ui/Badges";

/** Card de un SKU. Variante compacta para accesorios y grillas densas. */
export function ProductCard({ product: p, compact = false, dark = true }: { product: Product; compact?: boolean; dark?: boolean }) {
  return (
    <Link
      href={`/producto/${p.slug}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[24px] transition duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 ${
        dark
          ? "bg-surface text-fg shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.08] hover:ring-champagne hover:shadow-[var(--card-shadow)]"
          : "bg-mist hover:shadow-[var(--card-shadow)]"
      }`}
    >
      <div className="relative overflow-hidden">
        <CardTag product={p} />
        <ProductVisual product={p} className="aspect-square md:aspect-[4/5]" />
      </div>
      <div className={`flex flex-1 flex-col gap-2.5 md:gap-3 ${compact ? "p-3.5 md:p-4" : "p-4 md:p-6"}`}>
        <div>
          {p.brand !== "Apple" && <p className={`text-xs ${dark ? "text-fg/45" : "text-muted"}`}>{p.brand}</p>}
          <h3 className={`${compact ? "text-[14px]" : "text-base"} font-semibold tracking-[-0.01em] leading-snug`}>
            {p.name}
          </h3>
          <p className={`mt-1 text-xs ${dark ? "text-fg/55" : "text-muted"}`}>
            {[p.size, p.storage, p.color, p.batteryHealth ? `${p.batteryHealth}% batería` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className={`mt-auto flex flex-col gap-1 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-3 md:border-t md:pt-3.5 ${dark ? "border-fg/[0.08]" : "border-black/5"}`}>
          <StockNote product={p} dark={dark} />
          <span className={`tabular whitespace-nowrap md:text-right ${p.priceType === "consultar" ? "text-xs font-semibold text-vita" : "text-base font-semibold text-fg"}`}>
            {priceLabel(p)}
          </span>
        </div>
      </div>
    </Link>
  );
}
