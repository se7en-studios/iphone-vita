"use client";

import type { StockLevel } from "@/types";
import { formatARS, STOCK_LABEL } from "@/lib/format";
import { AdminField } from "../../AdminField";
import { FormSection, invalidProps, type SectionProps } from "./FormSection";

export function PriceStockSection({
  state,
  set,
  errors,
  arsRate,
}: SectionProps & { arsRate: number | null }) {
  const price = Number(state.price);
  const showArs =
    !state.consultar &&
    state.price.trim() !== "" &&
    Number.isFinite(price) &&
    arsRate != null;
  return (
    <FormSection title="Precio y stock">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="Precio (USD)"
          htmlFor="pf-price"
          error={errors.price}
          hint={
            showArs
              ? `≈ ${formatARS(price, arsRate)} con la cotización actual`
              : undefined
          }
        >
          <input
            id="pf-price"
            type="number"
            min={0}
            step="1"
            inputMode="decimal"
            className="admin-input"
            value={state.consultar ? "" : state.price}
            disabled={state.consultar}
            onChange={(e) => set({ price: e.target.value })}
            placeholder={state.consultar ? "Consultar precio" : "1299"}
            {...invalidProps(errors, "price", "pf-price")}
          />
          <label className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.consultar}
              onChange={(e) => set({ consultar: e.target.checked })}
              className="h-[18px] w-[18px] accent-[var(--a-accent)]"
            />
            Consultar precio (se deriva a WhatsApp)
          </label>
        </AdminField>
        <div className="grid grid-cols-2 gap-3">
          <AdminField
            label="Stock (unidades)"
            htmlFor="pf-stock"
            error={errors.stock}
            hint="0 = sin stock. Vacío = no se lleva la cuenta."
          >
            <input
              id="pf-stock"
              type="number"
              min={0}
              inputMode="numeric"
              className="admin-input"
              value={state.stock}
              onChange={(e) => set({ stock: e.target.value })}
              {...invalidProps(errors, "stock", "pf-stock")}
            />
          </AdminField>
          <AdminField label="Nivel" htmlFor="pf-level">
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
      </div>
    </FormSection>
  );
}
