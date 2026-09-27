import type { Product } from "@/types";
import { badgesFor, isOutOfStock, stockLabel } from "@/lib/format";

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
                ? "bg-fg/10 text-fg/80"
                : "bg-mist text-ink/70"
          }`}
        >
          {b.charAt(0) + b.slice(1).toLowerCase()}
        </span>
      ))}
    </div>
  );
}

/** Etiqueta sobre la foto de una card: solo lo que la distingue (sin stock o semi nuevo). */
export function CardTag({ product }: { product: Product }) {
  if (isOutOfStock(product))
    return (
      <span className="absolute left-3 top-3 z-10 rounded-full bg-bg/80 px-2.5 py-1 text-xs font-semibold text-fg/70 ring-1 ring-fg/15 backdrop-blur-md">
        Sin stock
      </span>
    );
  if (product.condition !== "semi-nuevo") return null;
  return (
    <span className="absolute left-3 top-3 z-10 rounded-full bg-bg/75 px-2.5 py-1 text-xs font-semibold text-vita ring-1 ring-vita/30 backdrop-blur-md">
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
  const dot = isOutOfStock(product)
    ? "bg-fg/30"
    : product.condition === "semi-nuevo" || product.stockLevel === "bajo"
      ? "bg-amber-400/80"
      : product.stockLevel === "medio"
        ? "bg-vita/60"
        : "bg-vita";
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs ${dark ? "text-fg/60" : "text-muted"}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {stockLabel(product)}
    </span>
  );
}
