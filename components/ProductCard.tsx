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
      className={`group relative flex h-full flex-col overflow-hidden rounded-[24px] transition-all duration-500 hover:-translate-y-1.5 ${
        dark
          ? "bg-[#0c0c0e] text-fg ring-1 ring-white/10 hover:ring-champagne/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_25px_rgba(235,215,190,0.14)]"
          : "bg-mist hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]"
      }`}
    >
      <div className="relative overflow-hidden">
        <CardTag product={p} />
        <div className="transition-transform duration-500 ease-out group-hover:scale-105">
          <ProductVisual product={p} className="aspect-square md:aspect-[4/5]" />
        </div>
      </div>
      <div className={`flex flex-1 flex-col gap-2.5 md:gap-3 ${compact ? "p-3.5 md:p-4" : "p-4 md:p-6"}`}>
        <div>
          {p.brand !== "Apple" && <p className={`text-xs ${dark ? "text-fg/45" : "text-muted"}`}>{p.brand}</p>}
          <h3 className={`${compact ? "text-[14px]" : "text-base"} font-bold tracking-tight leading-snug group-hover:text-champagne transition-colors duration-300`}>
            {p.name}
          </h3>
          <p className={`mt-1 text-xs ${dark ? "text-fg/55" : "text-muted"}`}>
            {[p.size, p.storage, p.color, p.batteryHealth ? `${p.batteryHealth}% batería` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className={`mt-auto flex flex-col gap-1 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-3 md:border-t md:pt-3 ${dark ? "border-white/10" : "border-black/5"}`}>
          <StockNote product={p} dark={dark} />
          <span className={`tabular whitespace-nowrap md:text-right ${p.priceType === "consultar" ? "text-xs font-semibold text-champagne" : "text-base font-bold text-champagne"}`}>
            {priceLabel(p)}
          </span>
        </div>
      </div>
    </Link>
  );
}
