"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
        <RowActions
          product={product}
          handlers={handlers}
          arsRate={props.arsRate}
        />
      </td>
    </tr>
  );
}

function MobileCard({ product, props }: { product: Product; props: Props }) {
  const selected = props.selectedIds.has(product.id);
  const { handlers } = props;
  return (
    <div
      // content-visibility: las tarjetas fuera de pantalla no se dibujan hasta acercarse.
      className={`rounded-2xl border bg-[var(--a-surface)] p-3.5 [contain-intrinsic-size:auto_260px] [content-visibility:auto] ${
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
        {/* En celular: botones del ancho de la tarjeta y 44px de alto, para el dedo. */}
        <RowActions
          product={product}
          handlers={handlers}
          arsRate={props.arsRate}
          className="grid w-full auto-cols-fr grid-flow-col gap-1 [&>*]:!h-11 [&>*]:!w-full"
        />
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

/* Mismo corte que md: de Tailwind. */
const DESKTOP_QUERY = "(min-width: 768px)";
const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** null en el servidor (se renderizan las dos vistas y decide el CSS); en el navegador, una sola. */
function useIsDesktop(): boolean | null {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => null,
  );
}

/* De a tandas: armar las 70 tarjetas juntas trababa ~1 s la pantalla en un celular medio. */
const PAGE = 24;

/** Suma otra tanda cuando el final de la lista se acerca a la pantalla. */
function LoadMore({ remaining, onMore }: { remaining: number; onMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onMore(), {
      rootMargin: "600px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onMore]);
  return (
    <div ref={ref} className="flex justify-center py-3">
      <button type="button" onClick={onMore} className="admin-btn admin-btn--secondary">
        Mostrar {Math.min(remaining, PAGE)} más
      </button>
    </div>
  );
}

export function ProductsTable(props: Props) {
  const { grouped, selectedIds } = props;
  const [limit, setLimit] = useState(PAGE);
  // ponytail: la vista agrupada muestra todo; es la menos usada y cortar grupos confunde.
  const products = grouped ? props.products : props.products.slice(0, limit);
  const remaining = grouped ? 0 : props.products.length - products.length;
  const showMore = useRef(() => setLimit((l) => l + PAGE)).current;
  // Armar tabla y tarjetas para 70 productos y esconder una por CSS duplicaba el trabajo
  // en cada carga y en cada cambio de precio o stock.
  const isDesktop = useIsDesktop();
  const groups: ModelGroup[] = grouped ? groupByModel(products) : [];
  const allSelected =
    props.products.length > 0 && props.products.every((p) => selectedIds.has(p.id));

  return (
    <>
      {/* Desktop */}
      {isDesktop !== false && (
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
          {remaining > 0 && <LoadMore remaining={remaining} onMore={showMore} />}
        </div>
      </div>
      )}

      {/* Mobile */}
      {isDesktop !== true && (
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
        {remaining > 0 && <LoadMore remaining={remaining} onMore={showMore} />}
      </div>
      )}
    </>
  );
}
