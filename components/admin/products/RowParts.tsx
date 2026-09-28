"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Pencil, Receipt, Share2, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName, STOCK_LABEL } from "@/lib/format";
import { categoryName } from "@/lib/catalog";
import { categories } from "@/data/products";
import type { ProductPatch } from "@/lib/validation";
import { AdminToggle } from "../AdminToggle";
import { InlineNumber } from "./InlineNumber";
import { useAdminToast } from "../AdminToast";

// Mismos topes que lib/validation.ts (MAX_PRICE / MAX_STOCK).
const MAX_PRICE = 1_000_000;
const MAX_STOCK = 100_000;

export interface RowHandlers {
  onPatch: (p: Product, patch: ProductPatch) => void;
  onEdit: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onRecordSale?: (p: Product) => void;
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
  const hasCost = product.cost != null && product.cost > 0;
  const hasPrice = product.price != null && product.price > 0;
  const profit =
    product.price != null && product.cost != null && hasCost && hasPrice
      ? product.price - product.cost
      : null;
  const marginPct =
    profit != null && product.cost != null && product.cost > 0
      ? Math.round((profit / product.cost) * 100)
      : null;

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
      {profit != null && (
        <span
          className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-semibold tabular-nums ${
            profit > 0
              ? "bg-[var(--a-success-bg)] text-[var(--a-success)]"
              : profit === 0
                ? "bg-[var(--a-surface-3)] text-[var(--a-muted)]"
                : "bg-[var(--a-danger-bg)] text-[var(--a-danger)]"
          }`}
          title={`Costo: US$ ${product.cost} · Ganancia: US$ ${profit}`}
        >
          {profit > 0 ? `+US$ ${profit} (${marginPct}%)` : `US$ ${profit}`}
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
  const currentStock = product.stock ?? 0;

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() =>
            onPatch(product, { stock: Math.max(0, currentStock - 1) })
          }
          disabled={currentStock <= 0}
          title="Restar 1 unidad"
          aria-label={`Restar 1 unidad de ${fullName(product)}`}
          className="flex size-5 items-center justify-center rounded border border-[var(--a-border)] bg-[var(--a-surface-1)] text-xs font-semibold text-[var(--a-muted)] transition hover:bg-[var(--a-surface-3)] hover:text-[var(--a-fg)] disabled:opacity-20"
        >
          -
        </button>
        <InlineNumber
          label="Stock"
          integer
          value={product.stock}
          display={product.stock == null ? "—" : `${product.stock} u.`}
          max={MAX_STOCK}
          onSave={(stock) => onPatch(product, { stock })}
        />
        <button
          type="button"
          onClick={() => onPatch(product, { stock: currentStock + 1 })}
          title="Sumar 1 unidad"
          aria-label={`Sumar 1 unidad de ${fullName(product)}`}
          className="flex size-5 items-center justify-center rounded border border-[var(--a-border)] bg-[var(--a-surface-1)] text-xs font-semibold text-[var(--a-muted)] transition hover:bg-[var(--a-surface-3)] hover:text-[var(--a-fg)]"
        >
          +
        </button>
      </div>
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

function formatQuote(p: Product, rate?: number | null): string {
  const name = fullName(p);
  const cond =
    p.condition === "nuevo"
      ? "Nuevo y sellado (1 año garantía oficial Apple)"
    : `Semi-Nuevo revisado${p.batteryHealth ? ` · Batería ${p.batteryHealth}%` : ""}`;
  const price =
    p.priceType === "consultar" || p.price == null
      ? "Consultar precio especial"
      : `${formatUSD(p.price)} (aprox. ${formatARS(p.price, rate ?? undefined)})`;

  return [
    `📱 *${name}*`,
    `✨ *Estado:* ${cond}`,
    `💵 *Precio:* ${price}`,
    `🛡️ *Garantía:* ${p.condition === "nuevo" ? "1 año oficial Apple a nivel mundial" : "Garantía de funcionamiento por escrito"}`,
    p.category === "iphone" ? "🎁 *Regalo:* Funda de silicona + templado 9D de regalo" : "",
    "🚚 *Envío:* Seguro prioritario a todo el país o entrega presencial",
    `🌐 *Ver fotos:* ${typeof window !== "undefined" ? window.location.origin : ""}/producto/${p.slug}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function RowActions({
  product,
  handlers,
  arsRate,
}: {
  product: Product;
  handlers: RowHandlers;
  arsRate?: number | null;
}) {
  const showToast = useAdminToast();
  const [copied, setCopied] = useState(false);
  const hidden = product.active === false;

  async function handleCopyQuote() {
    try {
      const text = formatQuote(product, arsRate);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Presupuesto copiado al portapapeles", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("No se pudo copiar al portapapeles", "error");
    }
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        className="admin-icon-btn"
        title={copied ? "¡Copiado!" : "Copiar presupuesto para WhatsApp"}
        aria-label={`Copiar presupuesto de ${fullName(product)} para WhatsApp`}
        onClick={handleCopyQuote}
      >
        {copied ? (
          <Check size={16} className="text-[var(--a-success)]" />
        ) : (
          <Share2 size={16} />
        )}
      </button>
      {handlers.onRecordSale && (
        <button
          type="button"
          className="admin-icon-btn text-[#34c759] hover:bg-[var(--a-success-bg)]"
          title="Registrar venta de este equipo"
          aria-label={`Registrar venta de ${fullName(product)}`}
          onClick={() => handlers.onRecordSale?.(product)}
        >
          <Receipt size={16} />
        </button>
      )}
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
