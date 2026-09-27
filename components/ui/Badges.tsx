import type { Product } from "@/types";
import { badgesFor, stockLabel } from "@/lib/format";

export function ProductBadges({
  product,
  dark = false,
}: {
  product: Product;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {badgesFor(product).map((b) => (
        <span
          key={b}
          className={`rounded-full px-2.5 py-1 font-semibold text-xs ${
            b === "SEMI NUEVO"
              ? "bg-vita-soft text-vita"
              : dark
                ? "bg-white/10 text-white/80"
                : "bg-mist text-ink/70"
          }`}
        >
          {b.charAt(0) + b.slice(1).toLowerCase()}
        </span>
      ))}
    </div>
  );
}

/** Etiqueta sobre la foto de una card: sólo lo que la distingue (hoy, semi nuevo). */
export function CardTag({ product }: { product: Product }) {
  if (product.condition !== "semi-nuevo") return null;
  return (
    <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-vita ring-1 ring-vita/30 backdrop-blur-md">
      Semi nuevo
    </span>
  );
}

/** Stock con un punto discreto: nada de rojos agresivos. */
export function StockNote({
  product,
  dark = false,
}: {
  product: Product;
  dark?: boolean;
}) {
  const dot =
    product.condition === "semi-nuevo" || product.stockLevel === "bajo"
      ? "bg-amber-400/80"
      : product.stockLevel === "medio"
        ? "bg-vita/60"
        : "bg-vita";
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs ${dark ? "text-white/60" : "text-muted"}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {stockLabel(product)}
    </span>
  );
}
