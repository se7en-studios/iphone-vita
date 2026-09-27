"use client";

import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName, STOCK_LABEL } from "@/lib/format";
import { categoryName } from "@/lib/catalog";
import { categories } from "@/data/products";
import type { ProductPatch } from "@/lib/validation";
import { AdminToggle } from "../AdminToggle";
import { InlineNumber } from "./InlineNumber";

// Mismos topes que lib/validation.ts (MAX_PRICE / MAX_STOCK).
const MAX_PRICE = 1_000_000;
const MAX_STOCK = 100_000;

export interface RowHandlers {
  onPatch: (p: Product, patch: ProductPatch) => void;
  onEdit: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  /** undefined para staff: no puede borrar. */
  onDelete?: (p: Product) => void;
}

export function NameBlock({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: RowHandlers["onEdit"];
}) {
  const subName = categories
    .find((c) => c.slug === product.category)
    ?.subcategories?.find((sc) => sc.slug === product.subcategory)?.name;
  const sub = subName ? ` · ${subName}` : "";
  return (
    <div className="min-w-0">
      <button
        type="button"
        className="line-clamp-2 text-left font-medium hover:text-[var(--a-accent)]"
        onClick={() => onEdit(product)}
      >
        {fullName(product)}
      </button>
      <span className="block truncate text-xs text-[var(--a-muted)]">
        {categoryName(product.category)}
        {sub}
        {product.brand !== "Apple" ? ` · ${product.brand}` : ""}
      </span>
    </div>
  );
}

export function ConditionBadge({ product }: { product: Product }) {
  if (product.condition === "nuevo")
    return <span className="text-xs text-[var(--a-muted)]">Nuevo</span>;
  return (
    <span className="inline-flex rounded-full bg-[var(--a-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--a-warning)]">
      Semi nuevo
      {product.batteryHealth ? ` · ${product.batteryHealth}%` : ""}
    </span>
  );
}

export function PriceCell({
  product,
  arsRate,
  onPatch,
}: {
  product: Product;
  arsRate: number | null;
  onPatch: RowHandlers["onPatch"];
}) {
  return (
    <div>
      <InlineNumber
        label="Precio USD"
        value={product.price}
        display={product.price == null ? "Consultar" : formatUSD(product.price)}
        max={MAX_PRICE}
        step={1}
        onSave={(price) => onPatch(product, { price })}
      />
      {product.price != null && arsRate != null && (
        <span className="block text-xs tabular-nums text-[var(--a-muted)]">
          {formatARS(product.price, arsRate)}
        </span>
      )}
    </div>
  );
}

export function StockCell({
  product,
  onPatch,
}: {
  product: Product;
  onPatch: RowHandlers["onPatch"];
}) {
  const out = product.stock === 0;
  return (
    <div>
      <InlineNumber
        label="Stock"
        integer
        value={product.stock}
        display={product.stock == null ? "—" : `${product.stock} u.`}
        max={MAX_STOCK}
        onSave={(stock) => onPatch(product, { stock })}
      />
      <span
        className={`block text-xs ${
          out
            ? "font-medium text-[var(--a-danger)]"
            : product.stockLevel === "bajo"
              ? "text-[var(--a-warning)]"
              : "text-[var(--a-muted)]"
        }`}
      >
        {out ? "Sin stock" : STOCK_LABEL[product.stockLevel]}
      </span>
    </div>
  );
}

export function VisibilityToggles({
  product,
  onPatch,
  hideLabels = true,
}: {
  product: Product;
  onPatch: RowHandlers["onPatch"];
  hideLabels?: boolean;
}) {
  const name = fullName(product);
  return (
    <div className="flex items-center gap-3">
      <AdminToggle
        label={hideLabels ? `Visible en la tienda: ${name}` : "Visible"}
        hideLabel={hideLabels}
        checked={product.active !== false}
        onChange={(active) => onPatch(product, { active })}
      />
      <AdminToggle
        label={hideLabels ? `Destacado: ${name}` : "Destacado"}
        hideLabel={hideLabels}
        checked={Boolean(product.featured)}
        onChange={(featured) => onPatch(product, { featured })}
      />
    </div>
  );
}

export function RowActions({
  product,
  handlers,
}: {
  product: Product;
  handlers: RowHandlers;
}) {
  const hidden = product.active === false;
  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        className="admin-icon-btn"
        title="Editar"
        aria-label={`Editar ${fullName(product)}`}
        onClick={() => handlers.onEdit(product)}
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        className="admin-icon-btn"
        title="Duplicar como variante"
        aria-label={`Duplicar ${fullName(product)} como variante`}
        onClick={() => handlers.onDuplicate(product)}
      >
        <Copy size={16} />
      </button>
      {hidden ? (
        <span
          className="admin-icon-btn"
          aria-disabled="true"
          title="Está oculto: no se ve en la tienda"
        >
          <ExternalLink size={16} />
        </span>
      ) : (
        <a
          href={`/producto/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-icon-btn"
          title="Ver en la tienda"
          aria-label={`Ver ${fullName(product)} en la tienda`}
        >
          <ExternalLink size={16} />
        </a>
      )}
      {handlers.onDelete && (
        <button
          type="button"
          className="admin-icon-btn admin-icon-btn--danger"
          title="Eliminar"
          aria-label={`Eliminar ${fullName(product)}`}
          onClick={() => handlers.onDelete?.(product)}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
