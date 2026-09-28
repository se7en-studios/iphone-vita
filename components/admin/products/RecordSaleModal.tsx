"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import type { Condition, Product } from "@/types";
import { formatARS, formatUSD, fullName } from "@/lib/format";
import { createSale, type SaleRecord } from "@/lib/sales";
import { AdminModal } from "../AdminModal";
import { AdminButton } from "../AdminButton";
import { AdminField } from "../AdminField";
import { errorMessage, useAdminToast } from "../AdminToast";
import { ProductThumb } from "./ProductThumb";
import { useAdminProducts } from "./useAdminProducts";

const PAYMENT_METHODS = [
  { value: "efectivo_usd", label: "💵 Efectivo USD" },
  { value: "transferencia_ars", label: "🏦 Transferencia ARS" },
  { value: "canje", label: "🔄 Plan Canje (Usado + Dif.)" },
  { value: "tarjeta", label: "💳 Tarjeta de Crédito" },
  { value: "mixto", label: "⚖️ Mixto (USD + ARS)" },
] as const;

export function RecordSaleModal({
  open = true,
  product: initialProduct = null,
  arsRate,
  onClose,
  onStockDeducted,
  onSaved,
}: {
  open?: boolean;
  product?: Product | null;
  arsRate: number | null;
  onClose: () => void;
  onStockDeducted?: (product: Product, newStock: number) => void;
  onSaved?: () => void;
}) {
  const showToast = useAdminToast();
  const { products, patch } = useAdminProducts();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || "",
  );
  const [customProductName, setCustomProductName] = useState("");
  const [condition, setCondition] = useState<Condition>(
    initialProduct?.condition || "nuevo",
  );
  const [salePriceUSD, setSalePriceUSD] = useState<string>(
    initialProduct?.price != null ? String(initialProduct.price) : "",
  );
  const [costUSD, setCostUSD] = useState<string>(
    initialProduct?.cost != null ? String(initialProduct.cost) : "",
  );
  const [paymentMethod, setPaymentMethod] =
    useState<SaleRecord["paymentMethod"]>("efectivo_usd");
  const [customerName, setCustomerName] = useState<string>("");
  const [tradeInModel, setTradeInModel] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [deductStock, setDeductStock] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  // Determinar producto activo
  const activeProduct = initialProduct || products.find((p) => p.id === selectedProductId) || null;

  // Actualizar valores al seleccionar un producto del inventario
  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
      setSalePriceUSD(initialProduct.price != null ? String(initialProduct.price) : "");
      setCostUSD(initialProduct.cost != null ? String(initialProduct.cost) : "");
      setCondition(initialProduct.condition);
      setDeductStock((initialProduct.stock ?? 1) > 0);
    }
  }, [initialProduct]);

  function handleProductSelect(id: string) {
    setSelectedProductId(id);
    if (!id) return;
    const found = products.find((p) => p.id === id);
    if (found) {
      if (found.price != null) setSalePriceUSD(String(found.price));
      if (found.cost != null) setCostUSD(String(found.cost));
      setCondition(found.condition);
      setDeductStock((found.stock ?? 1) > 0);
    }
  }

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

  if (!open) return null;

  const finalProductName = activeProduct
    ? fullName(activeProduct)
    : customProductName.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!finalProductName) {
      showToast("Ingresá el nombre o elegí el equipo vendido", "error");
      return;
    }
    if (!hasPrice || priceNum <= 0) {
      showToast("Ingresá un precio de venta válido", "error");
      return;
    }

    setSaving(true);
    try {
      await createSale({
        productId: activeProduct?.id,
        productName: finalProductName,
        condition: activeProduct?.condition || condition,
        quantity: 1,
        salePriceUSD: priceNum,
        costUSD: hasCost ? costNum : 0,
        salePriceARS: priceARS,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        tradeInModel:
          paymentMethod === "canje" ? tradeInModel.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      // Si se marcó descontar stock
      if (deductStock && activeProduct && activeProduct.stock != null) {
        const newStock = Math.max(0, activeProduct.stock - 1);
        if (onStockDeducted) {
          onStockDeducted(activeProduct, newStock);
        } else {
          // Descontar directamente en API si no hay callback
          patch([activeProduct.id], { stock: newStock });
        }
      }

      showToast(
        `¡Venta registrada! Ganancia: +US$ ${profitUSD.toLocaleString("es-AR")}`,
        "success",
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showToast(errorMessage(err, "No se pudo registrar la venta"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      title="Registrar Venta"
      onClose={onClose}
      maxWidth={580}
      footer={
        <div className="flex items-center justify-between gap-3">
          <AdminButton variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </AdminButton>
          {/* Fuera del <form>: `form` lo sigue enviando con validación nativa. */}
          <AdminButton type="submit" form="record-sale-form" loading={saving} variant="primary">
            Confirmar Venta
          </AdminButton>
        </div>
      }
    >
      <form
        id="record-sale-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Selector de Producto */}
        {initialProduct ? (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-3">
            <ProductThumb src={initialProduct.image} size={48} />
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-semibold text-sm text-[var(--a-text)]">
                {fullName(initialProduct)}
              </h4>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--a-muted)]">
                <span className="capitalize">{initialProduct.condition}</span>
                {initialProduct.batteryHealth && (
                  <span>• Batería {initialProduct.batteryHealth}%</span>
                )}
                <span>• Stock actual: {initialProduct.stock ?? "—"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-3.5">
            <label className="block text-xs font-semibold text-[var(--a-text)]">
              Elegir equipo del catálogo o ingresar manual:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="admin-input !text-sm"
            >
              <option value="">-- Ingresar producto manual / Accesorio --</option>
              {products
                .filter((p) => p.active !== false)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {fullName(p)} ({p.condition}) - {p.price ? `$${p.price} USD` : "Sin precio"} - Stock: {p.stock ?? 1}
                  </option>
                ))}
            </select>

            {!selectedProductId && (
              <div className="grid gap-2 sm:grid-cols-3 pt-1">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Ej: AirPods Pro 2 / Funda Magsafe / iPhone 12"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    className="admin-input !text-sm"
                  />
                </div>
                <div>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Condition)}
                    className="admin-input !text-sm"
                  >
                    <option value="nuevo">Nuevo sellado</option>
                    <option value="semi-nuevo">Semi-nuevo</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Precios: Venta y Costo */}
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField
            label="Precio de venta cobrado (USD) *"
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
            hint="Lo que costó adquirirlo para calcular ganancia"
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
              placeholder="Ej: Martín Gómez"
            />
          </AdminField>

          <AdminField label="Nota interna (opcional)" htmlFor="rs-notes">
            <input
              id="rs-notes"
              className="admin-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Retiro en local, funda de regalo"
            />
          </AdminField>
        </div>

        {/* Checkbox de descontar stock si es producto del catálogo */}
        {activeProduct && (
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] p-2.5 text-xs text-[var(--a-text)]">
            <input
              type="checkbox"
              checked={deductStock}
              onChange={(e) => setDeductStock(e.target.checked)}
              className="h-4 w-4 accent-[var(--a-accent)]"
            />
            <span>
              Descontar <strong>1 unidad</strong> del inventario físico
              automáticamente al registrar la venta.
            </span>
          </label>
        )}

      </form>
    </AdminModal>
  );
}
