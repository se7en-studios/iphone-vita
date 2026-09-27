"use client";

import { Fragment } from "react";
import type { Product } from "@/types";
import { formatUSD, fullName } from "@/lib/format";
import { groupByModel, type ModelGroup } from "@/lib/catalog";
import { ProductThumb } from "./ProductThumb";
import {
  ConditionBadge,
  NameBlock,
  PriceCell,
  RowActions,
  StockCell,
  VisibilityToggles,
  type RowHandlers,
} from "./RowParts";

interface Props {
  products: Product[];
  grouped: boolean;
  arsRate: number | null;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  handlers: RowHandlers;
}

const groupLabel = (g: ModelGroup) =>
  `${g.name} · ${g.variants.length} variante${g.variants.length === 1 ? "" : "s"}${
    g.fromPrice != null ? ` · desde ${formatUSD(g.fromPrice)}` : ""
  }`;

function SelectBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="h-[18px] w-[18px] cursor-pointer accent-[var(--a-accent)]"
    />
  );
}

function DesktopRow({ product, props }: { product: Product; props: Props }) {
  const selected = props.selectedIds.has(product.id);
  const { handlers } = props;
  return (
    <tr
      data-selected={selected}
      className={product.active === false ? "opacity-60" : undefined}
    >
      <td className="w-10 !pr-0">
        <SelectBox
          checked={selected}
          onChange={() => props.onToggleSelect(product.id)}
          label={`Seleccionar ${fullName(product)}`}
        />
      </td>
      <td>
        <div className="flex items-center gap-3">
          <ProductThumb src={product.image} />
          <NameBlock product={product} onEdit={handlers.onEdit} />
        </div>
      </td>
      <td>
        <ConditionBadge product={product} />
      </td>
      <td>
        <PriceCell
          product={product}
          arsRate={props.arsRate}
          onPatch={handlers.onPatch}
        />
      </td>
      <td>
        <StockCell product={product} onPatch={handlers.onPatch} />
      </td>
      <td>
        <VisibilityToggles product={product} onPatch={handlers.onPatch} />
      </td>
      <td>
        <RowActions product={product} handlers={handlers} />
      </td>
    </tr>
  );
}

function MobileCard({ product, props }: { product: Product; props: Props }) {
  const selected = props.selectedIds.has(product.id);
  const { handlers } = props;
  return (
    <div
      className={`rounded-2xl border bg-white p-3.5 ${
        selected
          ? "border-[var(--a-accent)] ring-1 ring-[var(--a-accent)]"
          : "border-[var(--a-border)]"
      } ${product.active === false ? "opacity-70" : ""}`}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-2">
          <ProductThumb src={product.image} size={56} />
          <SelectBox
            checked={selected}
            onChange={() => props.onToggleSelect(product.id)}
            label={`Seleccionar ${fullName(product)}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <NameBlock product={product} onEdit={handlers.onEdit} />
          <div className="mt-1">
            <ConditionBadge product={product} />
          </div>
          <div className="mt-2 flex flex-wrap items-start gap-x-6 gap-y-2">
            <PriceCell
              product={product}
              arsRate={props.arsRate}
              onPatch={handlers.onPatch}
            />
            <StockCell product={product} onPatch={handlers.onPatch} />
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--a-border)] pt-2">
        <VisibilityToggles
          product={product}
          onPatch={handlers.onPatch}
          hideLabels={false}
        />
        <RowActions product={product} handlers={handlers} />
      </div>
    </div>
  );
}

const COLUMNS = [
  "Producto",
  "Condición",
  "Precio",
  "Stock",
  "Visible · Destacado",
  "",
];

export function ProductsTable(props: Props) {
  const { products, grouped, selectedIds } = props;
  const groups: ModelGroup[] = grouped ? groupByModel(products) : [];
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  return (
    <>
      {/* Desktop */}
      <div className="admin-card hidden !p-0 md:block">
        <div className="max-h-[calc(100vh-220px)] overflow-auto rounded-[18px]">
          <table className="admin-table w-full text-sm">
            <thead>
              <tr>
                <th className="w-10 !pr-0">
                  <SelectBox
                    checked={allSelected}
                    onChange={props.onToggleAll}
                    label="Seleccionar todos los del listado"
                  />
                </th>
                {COLUMNS.map((c) => (
                  <th key={c} className={c === "" ? "text-right" : undefined}>
                    {c || <span className="sr-only">Acciones</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped
                ? groups.map((g) => (
                    <Fragment key={g.model}>
                      <tr className="bg-[var(--a-surface-2)] hover:!bg-[var(--a-surface-2)]">
                        <td
                          colSpan={COLUMNS.length + 1}
                          className="!py-2 text-[13px] font-semibold"
                        >
                          {groupLabel(g)}
                        </td>
                      </tr>
                      {g.variants.map((p) => (
                        <DesktopRow key={p.id} product={p} props={props} />
                      ))}
                    </Fragment>
                  ))
                : products.map((p) => (
                    <DesktopRow key={p.id} product={p} props={props} />
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {grouped
          ? groups.map((g) => (
              <section key={g.model} className="space-y-2">
                <h3 className="px-1 pt-2 text-[13px] font-semibold text-[var(--a-muted)]">
                  {groupLabel(g)}
                </h3>
                {g.variants.map((p) => (
                  <MobileCard key={p.id} product={p} props={props} />
                ))}
              </section>
            ))
          : products.map((p) => (
              <MobileCard key={p.id} product={p} props={props} />
            ))}
      </div>
    </>
  );
}
