"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Package,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Share2,
  Trash2,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import type { Condition, Product } from "@/types";
import { formatARS, formatUSD } from "@/lib/format";
import {
  computeSalesMetrics,
  deleteSale,
  exportSalesToCSV,
  getStoredSales,
  paymentMethodLabel,
  type SaleRecord,
} from "@/lib/sales";
import { AdminButton } from "./AdminButton";
import { AdminCard, AdminKpiCard, AdminPageHeader } from "./AdminCard";
import { AdminModal } from "./AdminModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { RecordSaleModal } from "./products/RecordSaleModal";
import { SaleReceiptModal } from "./SaleReceiptModal";
import { useAdminProducts } from "./products/useAdminProducts";

type Timeframe = "all" | "today" | "7days" | "month" | "30days";
type PaymentFilter = "all" | SaleRecord["paymentMethod"];

export function SalesPanel() {
  const { products, arsRate } = useAdminProducts();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [query, setQuery] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [conditionFilter, setConditionFilter] = useState<"all" | Condition>("all");

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<SaleRecord | null>(null);

  function reloadSales() {
    setSales(getStoredSales());
  }

  useEffect(() => {
    reloadSales();
    function onUpdate() {
      reloadSales();
    }
    window.addEventListener("vita-sales-updated", onUpdate);
    return () => window.removeEventListener("vita-sales-updated", onUpdate);
  }, []);

  // Filtrado reactivo
  const filteredSales = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();

    return sales.filter((s) => {
      // Búsqueda de texto
      if (q) {
        const matchText =
          s.productName.toLowerCase().includes(q) ||
          (s.customerName && s.customerName.toLowerCase().includes(q)) ||
          (s.tradeInModel && s.tradeInModel.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q)) ||
          s.id.toLowerCase().includes(q);
        if (!matchText) return false;
      }

      // Filtro de condición
      if (conditionFilter !== "all" && s.condition !== conditionFilter) {
        return false;
      }

      // Filtro de método de pago
      if (paymentFilter !== "all" && s.paymentMethod !== paymentFilter) {
        return false;
      }

      // Filtro de fecha
      if (timeframe !== "all") {
        const itemDate = new Date(s.createdAt);
        const diffMs = now.getTime() - itemDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeframe === "today") {
          const isToday =
            itemDate.getDate() === now.getDate() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (timeframe === "7days") {
          if (diffDays > 7) return false;
        } else if (timeframe === "30days") {
          if (diffDays > 30) return false;
        } else if (timeframe === "month") {
          const isSameMonth =
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
          if (!isSameMonth) return false;
        }
      }

      return true;
    });
  }, [sales, query, conditionFilter, paymentFilter, timeframe]);

  const metrics = useMemo(() => computeSalesMetrics(filteredSales), [filteredSales]);

  function handleDeleteSale(id: string) {
    deleteSale(id);
    setSaleToDelete(null);
  }

  const hasActiveFilters =
    query.trim() !== "" ||
    timeframe !== "all" ||
    paymentFilter !== "all" ||
    conditionFilter !== "all";

  function clearFilters() {
    setQuery("");
    setTimeframe("all");
    setPaymentFilter("all");
    setConditionFilter("all");
  }

  return (
    <>
      <AdminPageHeader
        title="Ventas & Operaciones"
        description="Historial comercial, métricas de rentabilidad, exportación para contabilidad y emisión de comprobantes digitales."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <AdminButton
              variant="secondary"
              onClick={() => exportSalesToCSV(filteredSales)}
              disabled={filteredSales.length === 0}
              title="Descargar listado en formato CSV compatible con Excel y Google Sheets"
            >
              <Download size={15} /> Exportar CSV / Excel
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={() => setShowNewSaleModal(true)}
            >
              <Plus size={15} /> Registrar Venta
            </AdminButton>
          </div>
        }
      />

      {/* ── Métricas y KPIs ── */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard
          label="Facturación Total"
          value={formatUSD(metrics.totalRevenueUSD)}
          subvalue={
            metrics.totalRevenueARS > 0
              ? `≈ $${(metrics.totalRevenueARS / 1000000).toFixed(2)}M ARS`
              : undefined
          }
          icon={DollarSign}
          tone="default"
        />
        <AdminKpiCard
          label="Ganancia Neta"
          value={formatUSD(metrics.totalProfitUSD)}
          subvalue={
            metrics.averageMarginPct > 0
              ? `Margen promedio: +${metrics.averageMarginPct}%`
              : undefined
          }
          icon={TrendingUp}
          tone="success"
        />
        <AdminKpiCard
          label="Ticket Promedio"
          value={formatUSD(metrics.averageTicketUSD)}
          subvalue={`${filteredSales.length} transacciones registradas`}
          icon={Receipt}
          tone="purple"
        />
        <AdminKpiCard
          label="Equipos Vendidos"
          value={`${metrics.totalUnitsSold} u.`}
          subvalue={`${metrics.newCount} nuevos · ${metrics.semiCount} semi-nuevos`}
          icon={Package}
          tone="gold"
        />
      </section>

      {/* ── Toolbar de Filtros y Búsqueda ── */}
      <div className="mb-4 space-y-3 rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-muted)]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por cliente, iPhone, método de pago, canje o notas..."
              className="admin-input !pl-10 !h-10 w-full"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-muted)] hover:text-[var(--a-text)]"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Clear */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[var(--a-accent)] hover:underline sm:self-center"
            >
              <RotateCcw size={13} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Fila de Selectores */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--a-border)] text-xs">
          <span className="text-[var(--a-muted)] font-medium mr-1 flex items-center gap-1">
            <Filter size={13} /> Filtrar por:
          </span>

          {/* Periodo */}
          <div className="inline-flex rounded-xl bg-[var(--a-surface-2)] p-1 border border-[var(--a-border)]">
            {(
              [
                { id: "all", label: "Todo" },
                { id: "today", label: "Hoy" },
                { id: "7days", label: "7 días" },
                { id: "month", label: "Este mes" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeframe(t.id)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  timeframe === t.id
                    ? "bg-[var(--a-text)] text-[var(--a-bg)] shadow-xs"
                    : "text-[var(--a-muted)] hover:text-[var(--a-text)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Condición */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--a-text)] outline-none focus:border-[var(--a-accent)]"
          >
            <option value="all">Todas las condiciones</option>
            <option value="nuevo">Nuevos sellados</option>
            <option value="semi-nuevo">Semi-nuevos</option>
          </select>

          {/* Método de pago */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--a-text)] outline-none focus:border-[var(--a-accent)]"
          >
            <option value="all">Todos los medios de pago</option>
            <option value="efectivo_usd">Efectivo USD</option>
            <option value="transferencia_ars">Transferencia ARS</option>
            <option value="canje">Plan Canje</option>
            <option value="tarjeta">Tarjeta de Crédito</option>
            <option value="mixto">Pago Mixto</option>
          </select>

          <span className="ml-auto text-xs text-[var(--a-muted)]">
            Mostrando <b>{filteredSales.length}</b> de <b>{sales.length}</b> ventas
          </span>
        </div>
      </div>

      {/* ── Tabla de Ventas ── */}
      <AdminCard className="!p-0 overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Receipt}
              title={
                hasActiveFilters
                  ? "No hay ventas que coincidan con los filtros"
                  : "No hay ventas registradas"
              }
              description={
                hasActiveFilters
                  ? "Prueba cambiando o limpiando los filtros para ver más resultados."
                  : "Registra cada venta completada para llevar control de ingresos, ganancias netas y emitir comprobantes de garantía."
              }
              action={
                hasActiveFilters ? (
                  <AdminButton variant="secondary" onClick={clearFilters}>
                    Limpiar filtros
                  </AdminButton>
                ) : (
                  <AdminButton
                    variant="primary"
                    onClick={() => setShowNewSaleModal(true)}
                  >
                    <Plus size={15} /> Registrar Venta
                  </AdminButton>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Fecha & Hora</th>
                  <th>Cliente</th>
                  <th>Producto / Equipo</th>
                  <th>Método de Pago</th>
                  <th className="text-right">Precio Venta</th>
                  <th className="text-right">Ganancia Neta</th>
                  <th className="text-center">Comprobante</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--a-border)]">
                {filteredSales.map((s) => {
                  const marginPct =
                    s.costUSD > 0
                      ? Math.round(((s.salePriceUSD - s.costUSD) / s.costUSD) * 100)
                      : null;

                  return (
                    <tr key={s.id} className="hover:bg-[var(--a-surface-2)] transition">
                      {/* Fecha */}
                      <td className="whitespace-nowrap font-mono text-xs text-[var(--a-muted)]">
                        <div className="font-semibold text-[var(--a-text)]">
                          {new Date(s.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px]">
                          {new Date(s.createdAt).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-[var(--a-surface-3)] text-[var(--a-muted)]">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--a-text)]">
                              {s.customerName || "Venta de mostrador"}
                            </div>
                            {s.tradeInModel && (
                              <div className="text-[11px] text-amber-500 font-medium">
                                Canje: {s.tradeInModel}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Producto */}
                      <td>
                        <div className="min-w-[200px] max-w-[280px]">
                          <div className="text-sm font-bold text-[var(--a-text)] truncate">
                            {s.productName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--a-muted)] mt-0.5">
                            <span className="font-semibold uppercase text-[10px] rounded bg-[var(--a-surface-3)] px-1.5 py-0.2">
                              {s.condition}
                            </span>
                            {s.quantity > 1 && <span>x{s.quantity} u.</span>}
                            {s.notes && (
                              <span className="truncate italic">· {s.notes}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Método de pago */}
                      <td className="whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            s.paymentMethod === "efectivo_usd"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : s.paymentMethod === "canje"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : s.paymentMethod === "transferencia_ars"
                                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                  : "bg-[var(--a-surface-3)] text-[var(--a-text)] border border-[var(--a-border)]"
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {paymentMethodLabel(s.paymentMethod)}
                        </span>
                      </td>

                      {/* Precio Venta */}
                      <td className="whitespace-nowrap text-right">
                        <div className="font-mono text-sm font-bold text-[var(--a-text)]">
                          {formatUSD(s.salePriceUSD)}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--a-muted)]">
                          ${s.salePriceARS.toLocaleString("es-AR")} ARS
                        </div>
                      </td>

                      {/* Ganancia Neta */}
                      <td className="whitespace-nowrap text-right font-mono">
                        <div className="text-sm font-bold text-emerald-500">
                          +{formatUSD(s.profitUSD)}
                        </div>
                        {marginPct != null && (
                          <div className="text-[10px] text-[var(--a-muted)] font-semibold">
                            +{marginPct}% margen
                          </div>
                        )}
                      </td>

                      {/* Comprobante / Recibo digital */}
                      <td className="whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => setReceiptSale(s)}
                          className="admin-btn admin-btn--secondary admin-btn--sm !px-2.5 !py-1 text-xs font-semibold"
                          title="Ver recibo y compartir por WhatsApp"
                        >
                          <Receipt size={13} className="text-[var(--a-accent)]" /> Recibo
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setSaleToDelete(s)}
                          className="admin-icon-btn admin-icon-btn--danger !size-7"
                          title="Eliminar registro de venta"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── Modal de Registrar Venta ── */}
      {showNewSaleModal && (
        <RecordSaleModal
          product={null}
          arsRate={arsRate}
          onClose={() => setShowNewSaleModal(false)}
          onSaved={() => {
            reloadSales();
            setShowNewSaleModal(false);
          }}
        />
      )}

      {/* ── Modal de Comprobante / Recibo Digital ── */}
      <SaleReceiptModal
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />

      {/* ── Dialog de Confirmar Borrado ── */}
      {saleToDelete && (
        <ConfirmDialog
          title="¿Eliminar registro de venta?"
          message={`Esta acción quitará la venta de "${saleToDelete.productName}" (${formatUSD(saleToDelete.salePriceUSD)}) del historial contable.`}
          confirmLabel="Eliminar venta"
          onConfirm={() => handleDeleteSale(saleToDelete.id)}
          onCancel={() => setSaleToDelete(null)}
        />
      )}
    </>
  );
}
