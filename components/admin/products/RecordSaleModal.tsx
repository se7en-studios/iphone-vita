"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Package,
  Receipt,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName } from "@/lib/format";
import { saveSale, type SaleRecord } from "@/lib/sales";
import { AdminModal } from "../AdminModal";
import { AdminButton } from "../AdminButton";
import { AdminField } from "../AdminField";
import { useAdminToast } from "../AdminToast";
import { ProductThumb } from "./ProductThumb";

const PAYMENT_METHODS = [
  { value: "efectivo_usd", label: "💵 Efectivo USD" },
  { value: "transferencia_ars", label: "🏦 Transferencia ARS" },
  { value: "canje", label: "🔄 Plan Canje (Usado + Dif.)" },
  { value: "tarjeta", label: "💳 Tarjeta" },
  { value: "mixto", label: "⚖️ Mixto (USD + ARS)" },
] as const;

export function RecordSaleModal({
  product,
  arsRate,
  onClose,
  onStockDeducted,
}: {
  product: Product;
  arsRate: number | null;
  onClose: () => void;
  onStockDeducted?: (product: Product, newStock: number) => void;
}) {
  const showToast = useAdminToast();

  const [salePriceUSD, setSalePriceUSD] = useState<string>(
    product.price != null ? String(product.price) : "",
  );
  const [costUSD, setCostUSD] = useState<string>(
    product.cost != null ? String(product.cost) : "",
  );
  const [paymentMethod, setPaymentMethod] =
    useState<SaleRecord["paymentMethod"]>("efectivo_usd");
  const [customerName, setCustomerName] = useState<string>("");
  const [tradeInModel, setTradeInModel] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [deductStock, setDeductStock] = useState<boolean>(
    (product.stock ?? 1) > 0,
  );
  const [saving, setSaving] = useState(false);

  const priceNum = Number(salePriceUSD);
  const costNum = Number(costUSD);

  const hasPrice = salePriceUSD.trim() !== "" && Number.isFinite(priceNum);
  const hasCost = costUSD.trim() !== "" && Number.isFinite(costNum);

  const profitUSD = hasPrice && hasCost ? priceNum - costNum : 0;
  const marginPct =
    hasPrice && hasCost && costNum > 0
      ? Math.round(((priceNum - costNum) / costNum) * 100)
      : null;

  const priceARS =
    hasPrice && arsRate != null ? Math.round(priceNum * arsRate) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasPrice || priceNum <= 0) {
      showToast("Ingresá un precio de venta válido", "error");
      return;
    }

    setSaving(true);
    try {
      saveSale({
        productId: product.id,
        productName: fullName(product),
        condition: product.condition,
        quantity: 1,
        salePriceUSD: priceNum,
        costUSD: hasCost ? costNum : 0,
        profitUSD,
        salePriceARS: priceARS,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        tradeInModel:
          paymentMethod === "canje" ? tradeInModel.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      // Si se marcó descontar stock
      if (deductStock && onStockDeducted && product.stock != null) {
        const newStock = Math.max(0, product.stock - 1);
        onStockDeducted(product, newStock);
      }

      showToast(
        `¡Venta registrada! Ganancia: +US$ ${profitUSD.toLocaleString("es-AR")}`,
        "success",
      );
      onClose();
    } catch {
      showToast("No se pudo registrar la venta", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      title="Registrar Venta"
      onClose={onClose}
      maxWidth={560}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--a-muted)]">
            {deductStock && (product.stock ?? 0) > 0 ? (
              <span>
                Se restará 1 unidad del stock (quedarán{" "}
                <strong>{Math.max(0, (product.stock ?? 1) - 1)}</strong>)
              </span>
            ) : (
              <span>El stock no se modificará</span>
            )}
          </div>
          <div className="flex gap-2">
            <AdminButton variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </AdminButton>
            <AdminButton
              type="submit"
              form="record-sale-form"
              loading={saving}
              variant="primary"
            >
              Confirmar Venta
            </AdminButton>
          </div>
        </div>
      }
    >
      <form
        id="record-sale-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Resumen del equipo */}
        <div className="flex items-center gap-3 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-3">
          <ProductThumb src={product.image} size={48} />
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold text-sm text-[var(--a-text)]">
              {fullName(product)}
            </h4>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--a-muted)]">
              <span className="capitalize">{product.condition}</span>
              {product.batteryHealth && (
                <span>• Batería {product.batteryHealth}%</span>
              )}
              <span>•</span>
              <span>Stock actual: {product.stock ?? "—"} unid.</span>
            </div>
          </div>
        </div>

        {/* Precios: Venta y Costo */}
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField
            label="Precio cobrado (USD) *"
            htmlFor="rs-price"
            hint={
              hasPrice && arsRate != null
                ? `≈ ${formatARS(priceNum, arsRate)} ARS`
                : undefined
            }
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--a-muted)]">
                US$
              </span>
              <input
                id="rs-price"
                type="number"
                min={0}
                required
                className="admin-input !pl-12 font-semibold"
                value={salePriceUSD}
                onChange={(e) => setSalePriceUSD(e.target.value)}
                placeholder="Ej: 1050"
              />
            </div>
          </AdminField>

          <AdminField
            label="Costo del equipo (USD)"
            htmlFor="rs-cost"
            hint="Lo que te costó adquirirlo"
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--a-muted)]">
                US$
              </span>
              <input
                id="rs-cost"
                type="number"
                min={0}
                className="admin-input !pl-12"
                value={costUSD}
                onChange={(e) => setCostUSD(e.target.value)}
                placeholder="Ej: 850"
              />
            </div>
          </AdminField>
        </div>

        {/* Tarjeta de Ganancia en Vivo */}
        {hasPrice && (
          <div className="flex items-center justify-between rounded-xl border border-[var(--a-success-border)] bg-[var(--a-success-bg)] p-3 text-sm text-[var(--a-success)]">
            <div className="flex items-center gap-2 font-medium">
              <TrendingUp size={16} />
              <span>Ganancia neta estimada:</span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold tabular-nums">
                +US$ {profitUSD.toLocaleString("es-AR")}
              </span>
              {marginPct != null && (
                <span className="ml-1.5 text-xs font-semibold opacity-90">
                  (+{marginPct}%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Método de pago */}
        <AdminField label="Método de pago" htmlFor="rs-method">
          <select
            id="rs-method"
            className="admin-input"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as SaleRecord["paymentMethod"],
              )
            }
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </AdminField>

        {/* Si fue Canje: datos del equipo entregado */}
        {paymentMethod === "canje" && (
          <AdminField
            label="Detalle del equipo tomado en canje"
            htmlFor="rs-tradein"
            hint="Ej: iPhone 11 128GB Batería 84% tomado en $200 USD"
          >
            <input
              id="rs-tradein"
              className="admin-input"
              value={tradeInModel}
              onChange={(e) => setTradeInModel(e.target.value)}
              placeholder="iPhone 11 128GB Black tomado en $200 USD"
            />
          </AdminField>
        )}

        {/* Datos del comprador */}
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField
            label="Nombre del cliente (opcional)"
            htmlFor="rs-customer"
          >
            <input
              id="rs-customer"
              className="admin-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Juan Pérez (WhatsApp)"
            />
          </AdminField>

          <AdminField label="Nota interna (opcional)" htmlFor="rs-notes">
            <input
              id="rs-notes"
              className="admin-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Garantía 6 meses, entrega en local"
            />
          </AdminField>
        </div>

        {/* Checkbox de descontar stock */}
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] p-2.5 text-xs text-[var(--a-text)]">
          <input
            type="checkbox"
            checked={deductStock}
            onChange={(e) => setDeductStock(e.target.checked)}
            className="h-4 w-4 accent-[var(--a-accent)]"
          />
          <span>
            Descontar <strong>1 unidad</strong> del inventario físico
            automáticamente al guardar.
          </span>
        </label>
      </form>
    </AdminModal>
  );
}
