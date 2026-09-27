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
      className={`group flex h-full flex-col overflow-hidden rounded-[28px] transition duration-500 hover:-translate-y-1 ${
        dark
          ? "bg-[#0a0a0a] text-white ring-1 ring-white/10 hover:ring-[#ebd7be]/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
          : "bg-mist hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]"
      }`}
    >
      <div className="relative">
        <CardTag product={p} />
        <ProductVisual product={p} className="aspect-[4/5]" />
      </div>
      <div className={`flex flex-1 flex-col gap-3 ${compact ? "p-4" : "p-5 md:p-6"}`}>
        <div>
          {p.brand !== "Apple" && <p className={`text-xs ${dark ? "text-white/45" : "text-muted"}`}>{p.brand}</p>}
          <h3 className={`${compact ? "text-[14px]" : "text-base"} font-semibold tracking-tight leading-snug group-hover:text-[#ebd7be] transition`}>
            {p.name}
          </h3>
          <p className={`mt-0.5 text-xs ${dark ? "text-white/55" : "text-muted"}`}>
            {[p.size, p.storage, p.color, p.batteryHealth ? `${p.batteryHealth}% batería` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className={`mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t pt-3 ${dark ? "border-white/10" : "border-black/5"}`}>
          <StockNote product={p} dark={dark} />
          <span className={`tabular whitespace-nowrap text-right ${p.priceType === "consultar" ? "text-xs text-[#ebd7be]" : "text-sm font-semibold text-[#ebd7be]"}`}>
            {priceLabel(p)}
          </span>
        </div>
      </div>
    </Link>
  );
}
