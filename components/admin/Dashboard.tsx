"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  DollarSign,
  EyeOff,
  ImageOff,
  MessageCircle,
  Package,
  PackageX,
  Plus,
  Receipt,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName } from "@/lib/format";
import {
  computeSalesMetrics,
  deleteSale,
  getStoredSales,
  type SaleRecord,
} from "@/lib/sales";
import { AdminButton } from "./AdminButton";
import { AdminCard, AdminKpiCard, AdminPageHeader } from "./AdminCard";
import { EmptyState } from "./EmptyState";
import { KpiSkeleton, TableSkeleton } from "./TableSkeleton";
import { ProductThumb } from "./products/ProductThumb";
import { useAdminProducts } from "./products/useAdminProducts";
import { RecordSaleModal } from "./products/RecordSaleModal";
import { TradeInCalculatorModal } from "./TradeInCalculatorModal";

const ATTENTION_LIMIT = 15;

function issuesOf(p: Product): string[] {
  const issues: string[] = [];
  if (!p.image) issues.push("Sin foto");
  if (p.stock === 0) issues.push("Sin stock");
  if (p.price == null) issues.push("Sin precio");
  if (
    p.condition === "semi-nuevo" &&
    p.batteryHealth != null &&
    p.batteryHealth < 85
  ) {
    issues.push(`Batería ${p.batteryHealth}%`);
  }
  return issues;
}

export function Dashboard() {
  const { products, arsRate, loading, loadError, load, patch } =
    useAdminProducts();

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [selectedProductForSale, setSelectedProductForSale] =
    useState<Product | null>(null);
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

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

  const metrics = computeSalesMetrics(sales);

  const count = (fn: (p: Product) => boolean) => products.filter(fn).length;
  const attention = products
    .filter((p) => p.active !== false)
    .map((p) => ({ p, issues: issuesOf(p) }))
    .filter((x) => x.issues.length > 0);

  // Valuación de inventario a precio de venta
  const totalValuationUSD = products
    .filter((p) => p.active !== false && p.price != null && (p.stock ?? 1) > 0)
    .reduce(
      (sum, p) =>
        sum +
        (p.price as number) *
          (p.stock ?? (p.condition === "semi-nuevo" ? 1 : 1)),
      0,
    );

  // Costo total de adquisición en inventario (cuando está cargado)
  const totalCostUSD = products
    .filter((p) => p.active !== false && p.cost != null && (p.stock ?? 1) > 0)
    .reduce(
      (sum, p) =>
        sum +
        (p.cost as number) *
          (p.stock ?? (p.condition === "semi-nuevo" ? 1 : 1)),
      0,
    );

  // Ganancia proyectada del inventario actual
  const projectedProfitUSD =
    totalValuationUSD > 0 && totalCostUSD > 0
      ? totalValuationUSD - totalCostUSD
      : null;

  const totalUnits = products
    .filter((p) => p.active !== false && (p.stock == null || p.stock > 0))
    .reduce(
      (sum, p) => sum + (p.stock ?? (p.condition === "semi-nuevo" ? 1 : 1)),
      0,
    );

  const nuevosCount = products.filter(
    (p) => p.active !== false && p.condition === "nuevo",
  ).length;
  const semiNuevosCount = products.filter(
    (p) => p.active !== false && p.condition === "semi-nuevo",
  ).length;

  const kpis = [
    {
      label: "Activos en tienda",
      value: count((p) => p.active !== false),
      icon: Package,
      href: "/admin/productos?estado=activo",
    },
    {
      label: "Ocultos",
      value: count((p) => p.active === false),
      icon: EyeOff,
      href: "/admin/productos?estado=oculto",
    },
    {
      label: "Sin stock",
      value: count((p) => p.stock === 0),
      icon: PackageX,
      href: "/admin/productos?stock=sin",
      tone: "danger" as const,
    },
    {
      label: "Últimas unidades",
      value: count((p) => p.stockLevel === "bajo"),
      icon: TrendingDown,
      href: "/admin/productos?stock=bajo",
      tone: "warning" as const,
    },
    {
      label: "Consultar precio",
      value: count((p) => p.price == null),
      icon: MessageCircle,
      href: "/admin/productos?stock=consultar",
    },
    {
      label: "Sin foto",
      value: count((p) => !p.image),
      icon: ImageOff,
      href: "/admin/productos?stock=sinfoto",
      tone: "warning" as const,
    },
    {
      label: "Destacados",
      value: count((p) => Boolean(p.featured)),
      icon: Star,
      href: "/admin/productos?stock=destacado",
      tone: "success" as const,
    },
    {
      label: "Batería < 85%",
      value: count(
        (p) =>
          p.condition === "semi-nuevo" &&
          p.batteryHealth != null &&
          p.batteryHealth < 85,
      ),
      icon: TrendingDown,
      href: "/admin/productos",
      tone: "warning" as const,
    },
  ];

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Resumen" />
        <EmptyState
          icon={AlertTriangle}
          title="No se pudo cargar el resumen"
          description={loadError}
          action={
            <AdminButton variant="secondary" onClick={load}>
              Reintentar
            </AdminButton>
          }
        />
      </>
    );
  }

  // Producto por defecto para registrar venta si se abre desde el botón principal
  const defaultSaleProduct = selectedProductForSale || products[0];

  return (
    <>
      <AdminPageHeader
        title="Dashboard & Métricas Comerciales"
        description="Ventas realizadas, recaudación, márgenes de ganancia y estado del catálogo."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton
              variant="secondary"
              onClick={() => setShowTradeInModal(true)}
              disabled={products.length === 0}
            >
              <Calculator size={15} /> Tasador Plan Canje
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={() => setShowNewSaleModal(true)}
              disabled={products.length === 0}
            >
              <Receipt size={15} /> Registrar Venta
            </AdminButton>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <KpiSkeleton count={8} />
          <TableSkeleton rows={4} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECCIÓN 1: Métricas de Ventas y Recaudación */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--a-success)]" />
                <h3 className="text-base font-bold text-[var(--a-text)]">
                  Métricas de Ventas & Recaudación Real
                </h3>
              </div>
              <span className="text-xs text-[var(--a-muted)]">
                {metrics.totalUnitsSold} equipos vendidos registrados
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Recaudado */}
              <div className="admin-card border-l-4 !border-l-[var(--a-accent)]">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                  Total Recaudado (Ventas)
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-text)]">
                  {formatUSD(metrics.totalRevenueUSD)}
                </div>
                <div className="mt-1 text-xs text-[var(--a-muted)]">
                  {arsRate
                    ? `≈ ${formatARS(metrics.totalRevenueUSD, arsRate)} ARS`
                    : "Monto total ingresado"}
                </div>
              </div>

              {/* Ganancia Neta Realizada */}
              <div className="admin-card border-l-4 !border-l-[#34c759]">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                  Ganancia Neta Realizada
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-[#34c759]">
                  +{formatUSD(metrics.totalProfitUSD)}
                </div>
                <div className="mt-1 text-xs text-[var(--a-muted)]">
                  Margen promedio:{" "}
                  <strong className="text-[var(--a-text)]">
                    +{metrics.averageMarginPct}%
                  </strong>{" "}
                  sobre costo
                </div>
              </div>

              {/* Unidades Vendidas */}
              <div className="admin-card">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                  Equipos Vendidos
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-text)]">
                  {metrics.totalUnitsSold}{" "}
                  <span className="text-sm font-normal text-[var(--a-muted)]">
                    unidades
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--a-muted)]">
                  {metrics.newCount} nuevos · {metrics.semiCount} semi-nuevos
                </div>
              </div>

              {/* Ticket Promedio */}
              <div className="admin-card">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                  Ticket Promedio
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-text)]">
                  {formatUSD(metrics.averageTicketUSD)}
                </div>
                <div className="mt-1 text-xs text-[var(--a-muted)]">
                  Promedio por venta cerrada
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Análisis Financiero del Inventario Actual */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="admin-card">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                Valorización de Inventario (Venta)
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-text)]">
                {formatUSD(totalValuationUSD)}
              </div>
              <div className="mt-1 text-xs text-[var(--a-muted)]">
                {arsRate
                  ? `≈ ${formatARS(totalValuationUSD, arsRate)} (cotiz. $${arsRate.toLocaleString("es-AR")})`
                  : "En stock activo"}
              </div>
            </div>

            <div className="admin-card">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                Costo Total en Stock
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-text)]">
                {totalCostUSD > 0 ? formatUSD(totalCostUSD) : "Cargando costos…"}
              </div>
              <div className="mt-1 text-xs text-[var(--a-muted)]">
                {totalCostUSD > 0
                  ? "Capital invertido en equipos disponibles"
                  : "Cargá el costo de compra en tus productos"}
              </div>
            </div>

            <div className="admin-card">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                Ganancia Proyectada del Stock
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-success)]">
                {projectedProfitUSD != null && projectedProfitUSD > 0
                  ? `+${formatUSD(projectedProfitUSD)}`
                  : formatUSD(totalValuationUSD * 0.2)}
              </div>
              <div className="mt-1 text-xs text-[var(--a-muted)]">
                {projectedProfitUSD != null
                  ? `Margen estimado: ≈ +${Math.round((projectedProfitUSD / totalCostUSD) * 100)}%`
                  : "Ganancia si se vende todo el inventario"}
              </div>
            </div>
          </div>

          {/* KPIs de Estado de Catálogo */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpis.map((k) => (
              <AdminKpiCard key={k.label} {...k} />
            ))}
          </div>

          {/* SECCIÓN 3: Historial de Ventas Recientes */}
          <AdminCard className="!p-0">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--a-border)] px-5 py-4">
              <div>
                <h3 className="text-[17px] font-semibold">
                  Historial de Ventas Registradas
                </h3>
                <p className="text-xs text-[var(--a-muted)]">
                  Registro de ventas con desglose de ganancia, método de pago y cliente.
                </p>
              </div>
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setShowNewSaleModal(true)}
              >
                <Plus size={14} /> Nueva Venta
              </AdminButton>
            </div>

            {sales.length === 0 ? (
              <p className="p-6 text-center text-sm text-[var(--a-muted)]">
                Aún no registraste ninguna venta. Tocá en{" "}
                <strong>Registrar Venta</strong> para cargar la primera.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--a-border)] bg-[var(--a-surface-2)] text-[11px] font-semibold uppercase text-[var(--a-muted)]">
                    <tr>
                      <th className="px-4 py-2.5">Fecha</th>
                      <th className="px-4 py-2.5">Equipo</th>
                      <th className="px-4 py-2.5">Precio Cobrado</th>
                      <th className="px-4 py-2.5">Costo</th>
                      <th className="px-4 py-2.5">Ganancia Neta</th>
                      <th className="px-4 py-2.5">Método de Pago</th>
                      <th className="px-4 py-2.5">Cliente / Detalle</th>
                      <th className="px-4 py-2.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--a-border)]">
                    {sales.slice(0, 10).map((s) => (
                      <tr key={s.id} className="hover:bg-[#fafafc]">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-[var(--a-muted)]">
                          {new Date(s.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[var(--a-text)]">
                            {s.productName}
                          </span>
                          <span className="ml-1.5 rounded bg-[var(--a-surface-3)] px-1.5 py-0.5 text-[10px] text-[var(--a-muted)] capitalize">
                            {s.condition}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold tabular-nums text-[var(--a-text)]">
                          US$ {s.salePriceUSD.toLocaleString("es-AR")}
                          {arsRate != null && (
                            <span className="block text-[10px] font-normal text-[var(--a-muted)]">
                              ≈ {formatARS(s.salePriceUSD, arsRate)}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[var(--a-muted)]">
                          {s.costUSD > 0
                            ? `US$ ${s.costUSD.toLocaleString("es-AR")}`
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-[var(--a-success)]">
                          +US$ {s.profitUSD.toLocaleString("es-AR")}
                          {s.costUSD > 0 && (
                            <span className="ml-1 text-[10px] font-medium opacity-85">
                              (+{Math.round((s.profitUSD / s.costUSD) * 100)}%)
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex rounded-full bg-[var(--a-surface-2)] px-2 py-0.5 text-[11px] font-medium border border-[var(--a-border)]">
                            {s.paymentMethod === "efectivo_usd" && "💵 Efectivo USD"}
                            {s.paymentMethod === "transferencia_ars" && "🏦 Transf. ARS"}
                            {s.paymentMethod === "canje" && "🔄 Plan Canje"}
                            {s.paymentMethod === "tarjeta" && "💳 Tarjeta"}
                            {s.paymentMethod === "mixto" && "⚖️ Mixto"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[var(--a-muted)]">
                          {s.customerName && (
                            <strong className="text-[var(--a-text)] block">
                              {s.customerName}
                            </strong>
                          )}
                          {s.tradeInModel && <span>{s.tradeInModel}</span>}
                          {s.notes && <span>{s.notes}</span>}
                          {!s.customerName && !s.tradeInModel && !s.notes && "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteSale(s.id)}
                            title="Eliminar venta registrada"
                            className="text-[var(--a-muted)] hover:text-[var(--a-danger)] transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>

          {/* Requieren atención */}
          <AdminCard className="!p-0">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--a-border)] px-5 py-4">
              <h2 className="text-[17px] font-semibold">Requieren atención</h2>
              <span className="text-sm text-[var(--a-muted)]">
                {attention.length}
              </span>
            </div>
            {attention.length === 0 ? (
              <p className="flex items-center gap-2 px-5 py-6 text-sm text-[var(--a-success)]">
                <CheckCircle2 size={18} aria-hidden /> Todo en orden: los
                productos visibles tienen foto, precio y stock.
              </p>
            ) : (
              <ul>
                {attention.slice(0, ATTENTION_LIMIT).map(({ p, issues }) => (
                  <li
                    key={p.id}
                    className="border-t border-[var(--a-border)] first:border-t-0"
                  >
                    <div className="flex min-h-[56px] items-center gap-3 px-5 py-2.5 hover:bg-[#fafafc]">
                      <ProductThumb src={p.image} size={40} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {fullName(p)}
                      </span>
                      <span className="flex flex-wrap justify-end gap-1">
                        {issues.map((i) => (
                          <span
                            key={i}
                            className="rounded-full bg-[var(--a-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--a-warning)]"
                          >
                            {i}
                          </span>
                        ))}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductForSale(p);
                            setShowNewSaleModal(true);
                          }}
                          className="rounded-lg bg-[var(--a-success-bg)] px-2 py-1 text-xs font-semibold text-[var(--a-success)] hover:brightness-95"
                          title="Registrar venta de este equipo"
                        >
                          Vendido
                        </button>
                        <Link
                          href={`/admin/productos?edit=${p.id}`}
                          className="text-sm text-[var(--a-accent)] hover:underline"
                        >
                          Editar
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {attention.length > ATTENTION_LIMIT && (
              <p className="border-t border-[var(--a-border)] px-5 py-3 text-sm text-[var(--a-muted)]">
                Y {attention.length - ATTENTION_LIMIT} más. Usá los filtros de{" "}
                <Link
                  href="/admin/productos"
                  className="text-[var(--a-accent)] underline"
                >
                  Productos
                </Link>{" "}
                para verlos todos.
              </p>
            )}
          </AdminCard>
        </div>
      )}

      {/* Modal para Registrar Venta */}
      {showNewSaleModal && defaultSaleProduct && (
        <RecordSaleModal
          product={defaultSaleProduct}
          arsRate={arsRate}
          onClose={() => {
            setShowNewSaleModal(false);
            setSelectedProductForSale(null);
          }}
          onStockDeducted={(p, newStock) => {
            patch([p.id], { stock: newStock });
          }}
        />
      )}

      {/* Modal de Tasador Plan Canje */}
      {showTradeInModal && (
        <TradeInCalculatorModal
          products={products}
          arsRate={arsRate}
          onClose={() => setShowTradeInModal(false)}
        />
      )}
    </>
  );
}
