import type { Product } from "@/types";
import { formatARS, priceLabel, stockLabel } from "@/lib/format";

/*
 * Aproximación de la card del catálogo de la tienda (CatalogCard): mismo orden
 * de datos y jerarquía. No se reutiliza el componente real porque vive en la
 * zona de la tienda y depende de su contexto.
 */
export function LivePreview({
  product,
  arsRate,
}: {
  product: Product;
  arsRate: number | null;
}) {
  const variant = [
    product.size,
    product.storage,
    product.color,
    product.batteryHealth ? `${product.batteryHealth}% batería` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const out = product.stock === 0;
  return (
    <div className="lg:sticky lg:top-0">
      <p className="mb-2 text-xs font-medium text-[var(--a-muted)]">
        Así se ve en la tienda
      </p>
      <div className="overflow-hidden rounded-[28px] bg-white ring-1 ring-black/10">
        <div className="relative flex aspect-[4/5] items-center justify-center bg-[#fafafa]">
          {product.condition === "semi-nuevo" && (
            <span className="absolute top-3 left-3 rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[10px] font-semibold text-white">
              SEMI NUEVO
            </span>
          )}
          {product.image ? (
            <img
              src={product.image}
              alt=""
              className="h-full w-full object-contain p-6"
            />
          ) : (
            <span className="text-sm text-[var(--a-muted)]">Sin foto</span>
          )}
          {product.active === false && (
            <span className="absolute inset-x-3 bottom-3 rounded-lg bg-black/70 py-1 text-center text-xs font-medium text-white">
              Oculto: no aparece en la tienda
            </span>
          )}
        </div>
        <div className="space-y-2.5 p-5">
          <div>
            {product.brand !== "Apple" && (
              <p className="text-xs text-black/50">{product.brand}</p>
            )}
            <h3 className="font-bold leading-snug">{product.name}</h3>
            {variant && (
              <p className="mt-0.5 text-xs text-black/60">{variant}</p>
            )}
          </div>
          {product.colorHex && (
            <span
              className="block h-4 w-4 rounded-full ring-1 ring-black/15"
              style={{ background: product.colorHex }}
              aria-label={`Color ${product.color ?? ""}`}
            />
          )}
          <div className="flex items-end justify-between gap-2 border-t border-black/10 pt-3">
            <span
              className={`text-xs ${out ? "font-medium text-[var(--a-danger)]" : "text-black/60"}`}
            >
              {out ? "Sin stock" : stockLabel(product)}
            </span>
            <span className="text-right">
              <span className="block text-[15px] font-bold tabular-nums">
                {priceLabel(product)}
              </span>
              {product.price != null && arsRate != null && (
                <span className="block text-xs tabular-nums text-black/50">
                  {formatARS(product.price, arsRate)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
