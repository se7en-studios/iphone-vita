"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { formatUSD, fullName } from "@/lib/format";
import { AdminModal } from "../AdminModal";
import { AdminButton } from "../AdminButton";
import { AdminField } from "../AdminField";

const PRESETS = [-10, -5, 5, 10];
const PREVIEW_ROWS = 8;
// Mismos límites y redondeo que adjustPrices() en lib/admin-products.ts.
const MIN_PERCENT = -90;
const MAX_PERCENT = 500;
const adjusted = (price: number, percent: number) =>
  Math.round(price * (1 + percent / 100));


export function BulkPriceModal({
  products,
  onConfirm,
  onClose,
}: {
  products: Product[];
  onConfirm: (percent: number) => Promise<void>;
  onClose: () => void;
}) {
  const [raw, setRaw] = useState("5");
  const [saving, setSaving] = useState(false);
  const percent = Number(raw);
  const valid =
    raw.trim() !== "" &&
    Number.isFinite(percent) &&
    percent !== 0 &&
    percent > MIN_PERCENT &&
    percent <= MAX_PERCENT;
  const priced = products.filter((p) => p.price != null);
  const skipped = products.length - priced.length;

  async function submit() {
    if (!valid) return;
    setSaving(true);
    try {
      await onConfirm(percent);
      onClose();
    } catch {
      setSaving(false); // el hook ya mostró el toast con el error
    }
  }

  return (
    <AdminModal
      title="Ajustar precio"
      onClose={() => !saving && onClose()}
      maxWidth={520}
      footer={
        <div className="flex justify-end gap-2.5">
          <AdminButton variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </AdminButton>
          <AdminButton
            onClick={submit}
            disabled={!valid || priced.length === 0}
            loading={saving}
          >
            Aplicar a {priced.length} producto{priced.length === 1 ? "" : "s"}
          </AdminButton>
        </div>
      }
    >
      <AdminField
        label="Porcentaje"
        htmlFor="bulk-percent"
        error={
          raw && !valid
            ? "Ingresá un porcentaje distinto de 0, mayor a -90 y hasta 500"
            : undefined
        }
        hint="Positivo sube, negativo baja. Ej: 5 = +5 %, -10 = -10 %."
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="bulk-percent"
            type="number"
            step="0.5"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-invalid={Boolean(raw) && !valid}
            className="admin-input !w-28"
            autoFocus
          />
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setRaw(String(p))}
              className={`admin-pill ${percent === p ? "admin-pill--active" : ""}`}
            >
              {p > 0 ? `+${p}` : p}%
            </button>
          ))}
        </div>
      </AdminField>

      <div className="rounded-xl border border-[var(--a-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[var(--a-muted)]">
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 text-right font-medium">Antes</th>
              <th className="px-3 py-2 text-right font-medium">Después</th>
            </tr>
          </thead>
          <tbody>
            {priced.slice(0, PREVIEW_ROWS).map((p) => (
              <tr key={p.id} className="border-t border-[var(--a-border)]">
                <td className="max-w-[220px] truncate px-3 py-2">
                  {fullName(p)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-[var(--a-muted)]">
                  {formatUSD(p.price!)}
                </td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  {valid ? formatUSD(adjusted(p.price!, percent)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {priced.length > PREVIEW_ROWS && (
          <p className="border-t border-[var(--a-border)] px-3 py-2 text-xs text-[var(--a-muted)]">
            y {priced.length - PREVIEW_ROWS} más…
          </p>
        )}
      </div>
      {skipped > 0 && (
        <p className="text-xs text-[var(--a-muted)]">
          {skipped} producto{skipped === 1 ? "" : "s"} con “Consultar precio” no
          cambia{skipped === 1 ? "" : "n"}.
        </p>
      )}
    </AdminModal>
  );
}
