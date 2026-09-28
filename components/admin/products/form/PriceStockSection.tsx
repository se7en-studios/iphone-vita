"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  DollarSign,
  Percent,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { StockLevel } from "@/types";
import { formatARS, STOCK_LABEL } from "@/lib/format";
import { AdminField } from "../../AdminField";
import { FormSection, invalidProps, type SectionProps } from "./FormSection";

const MARGIN_PRESETS = [10, 15, 20, 25, 30];

export function PriceStockSection({
  state,
  set,
  errors,
  arsRate,
}: SectionProps & { arsRate: number | null }) {
  const price = Number(state.price);
  const cost = Number(state.cost);
  const [customMargin, setCustomMargin] = useState<string>("");

  const hasCost = state.cost.trim() !== "" && Number.isFinite(cost) && cost > 0;
  const hasPrice =
    !state.consultar &&
    state.price.trim() !== "" &&
    Number.isFinite(price) &&
    price > 0;

  const profitUSD = hasCost && hasPrice ? price - cost : null;
  const marginPct =
    hasCost && hasPrice && cost > 0
      ? Math.round(((price - cost) / cost) * 100)
      : null;

  const showArs = hasPrice && arsRate != null;

  function applyMargin(pct: number) {
    if (!hasCost) return;
    const newPrice = Math.round(cost * (1 + pct / 100));
    set({ price: String(newPrice), consultar: false });
  }

  return (
    <FormSection title="Precio, costo y stock" icon={DollarSign}>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Costo de compra */}
        <AdminField
          label="Costo de compra (USD)"
          htmlFor="pf-cost"
          error={errors.cost}
          hint={
            hasCost && arsRate != null
              ? `Costo en ARS: ≈ ${formatARS(cost, arsRate)}`
              : "Lo que pagaste por el equipo (privado, solo para vos)"
          }
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--a-muted)]">
              US$
            </span>
            <input
              id="pf-cost"
              type="number"
              min={0}
              step="1"
              inputMode="decimal"
              className="admin-input !pl-12"
              value={state.cost}
              onChange={(e) => set({ cost: e.target.value })}
              placeholder="Ej: 850"
              {...invalidProps(errors, "cost", "pf-cost")}
            />
          </div>
        </AdminField>

        {/* Precio de venta */}
        <AdminField
          label="Precio de venta al público (USD) *"
          htmlFor="pf-price"
          error={errors.price}
          hint={
            showArs
              ? `≈ ${formatARS(price, arsRate)} con la cotización del día`
              : undefined
          }
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--a-muted)]">
              US$
            </span>
            <input
              id="pf-price"
              type="number"
              min={0}
              step="1"
              inputMode="decimal"
              className="admin-input !pl-12"
              value={state.consultar ? "" : state.price}
              disabled={state.consultar}
              onChange={(e) => set({ price: e.target.value })}
              placeholder={state.consultar ? "Consultar precio" : "1100"}
              {...invalidProps(errors, "price", "pf-price")}
            />
          </div>
          <label className="mt-1 flex min-h-[30px] cursor-pointer items-center gap-2 text-xs text-[var(--a-muted)]">
            <input
              type="checkbox"
              checked={state.consultar}
              onChange={(e) => set({ consultar: e.target.checked })}
              className="h-4 w-4 accent-[var(--a-accent)]"
            />
            Precio a consultar (deriva a WhatsApp, sin precio público)
          </label>
        </AdminField>
      </div>

      {/* Widget Interactivo de Margen y Rentabilidad */}
      <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--a-border)] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--a-accent)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--a-muted)]">
              Margen de Ganancia del Dueño
            </span>
          </div>
          {profitUSD != null && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                profitUSD > 0
                  ? "bg-[var(--a-success-bg)] text-[var(--a-success)] border border-[var(--a-success-border)]"
                  : profitUSD === 0
                    ? "bg-[var(--a-surface-3)] text-[var(--a-muted)]"
                    : "bg-[var(--a-danger-bg)] text-[var(--a-danger)] border border-[var(--a-danger-border)]"
              }`}
            >
              {profitUSD > 0 ? (
                <>
                  <ArrowUpRight size={13} />
                  Ganancia: +US$ {profitUSD.toLocaleString("es-AR")} (+
                  {marginPct}%)
                </>
              ) : profitUSD === 0 ? (
                "Al costo (0% ganancia)"
              ) : (
                `Pérdida: -US$ ${Math.abs(profitUSD).toLocaleString("es-AR")} (${marginPct}%)`
              )}
            </span>
          )}
        </div>

        {/* Desglose y atajos de cálculo */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="text-xs text-[var(--a-muted)]">
              Fijar precio por margen sobre el costo:
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {MARGIN_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  disabled={!hasCost}
                  onClick={() => applyMargin(pct)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    hasCost
                      ? "border border-[var(--a-border-strong)] bg-[var(--a-surface)] hover:border-[var(--a-accent)] hover:text-[var(--a-accent)] active:scale-95"
                      : "cursor-not-allowed opacity-50 bg-[var(--a-surface-3)] text-[var(--a-muted)]"
                  }`}
                  title={
                    hasCost
                      ? `Fijar precio al costo + ${pct}% = US$ ${Math.round(cost * (1 + pct / 100))}`
                      : "Cargá primero el costo de compra arriba"
                  }
                >
                  +{pct}%
                </button>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Otro %"
                  disabled={!hasCost}
                  value={customMargin}
                  onChange={(e) => setCustomMargin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customMargin) {
                      e.preventDefault();
                      applyMargin(Number(customMargin));
                      setCustomMargin("");
                    }
                  }}
                  className="admin-input !h-7 !w-16 !p-1 text-center text-xs"
                />
                <button
                  type="button"
                  disabled={!hasCost || !customMargin}
                  onClick={() => {
                    applyMargin(Number(customMargin));
                    setCustomMargin("");
                  }}
                  className="rounded-md bg-[var(--a-accent)] px-2 py-1 text-xs font-medium text-white hover:bg-[var(--a-accent-hover)] disabled:opacity-40"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-right text-xs">
            {profitUSD != null && profitUSD > 0 && arsRate != null && (
              <p className="text-[var(--a-success)] font-medium">
                Ganancia neta en ARS: ≈{" "}
                <strong>{formatARS(profitUSD, arsRate)}</strong>
              </p>
            )}
            {!hasCost && (
              <p className="text-xs text-[var(--a-muted)] italic">
                Cargá el costo de compra para ver la ganancia neta en USD y ARS.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stock físico y nivel de disponibilidad */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <AdminField
          label="Stock físico (unidades)"
          htmlFor="pf-stock"
          error={errors.stock}
          hint="0 = agotado. Vacío = stock continuo sin límite."
        >
          <input
            id="pf-stock"
            type="number"
            min={0}
            inputMode="numeric"
            className="admin-input"
            value={state.stock}
            onChange={(e) => set({ stock: e.target.value })}
            placeholder="1"
            {...invalidProps(errors, "stock", "pf-stock")}
          />
        </AdminField>

        <AdminField label="Indicador en tienda" htmlFor="pf-level">
          <select
            id="pf-level"
            className="admin-input"
            value={state.stockLevel}
            onChange={(e) =>
              set({ stockLevel: e.target.value as StockLevel })
            }
          >
            {(Object.keys(STOCK_LABEL) as StockLevel[]).map((level) => (
              <option key={level} value={level}>
                {STOCK_LABEL[level]}
              </option>
            ))}
          </select>
        </AdminField>
      </div>
    </FormSection>
  );
}
