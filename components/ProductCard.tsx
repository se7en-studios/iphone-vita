import Link from "next/link";
import type { Product } from "@/types";
import { priceLabel } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { ProductBadges, StockNote } from "./ui/Badges";

/** Card de un SKU. Variante compacta para accesorios y grillas densas. */
export function ProductCard({ product: p, compact = false, dark = false }: { product: Product; compact?: boolean; dark?: boolean }) {
  return (
    <Link
      href={`/producto/${p.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[28px] transition duration-500 hover:-translate-y-1 ${
        dark ? "bg-ink-2 text-white ring-1 ring-line-dark hover:ring-white/20" : "bg-mist hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]"
      }`}
    >
      <ProductVisual product={p} tone={dark ? "dark" : "light"} className={compact ? "aspect-square" : "aspect-[4/5]"} />
      <div className={`flex flex-1 flex-col gap-3 ${compact ? "p-4" : "p-5 md:p-6"}`}>
        <ProductBadges product={p} dark={dark} />
        <div>
          <p className={`text-xs ${dark ? "text-white/45" : "text-muted"}`}>{p.brand}</p>
          <h3 className={`${compact ? "text-[15px]" : "text-lg"} font-semibold leading-snug tracking-tight`}>{p.name}</h3>
          <p className={`mt-0.5 text-sm ${dark ? "text-white/55" : "text-muted"}`}>
            {[p.size, p.storage, p.color, p.batteryHealth ? `${p.batteryHealth}% batería` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className={`mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t pt-3 ${dark ? "border-line-dark" : "border-black/5"}`}>
          <StockNote product={p} dark={dark} />
          <span className={`tabular whitespace-nowrap text-right ${p.priceType === "consultar" ? "text-sm" : "text-base font-semibold"}`}>{priceLabel(p)}</span>
        </div>
      </div>
    </Link>
  );
}
