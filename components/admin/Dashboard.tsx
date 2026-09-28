"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  ImageOff,
  MessageCircle,
  Package,
  PackageX,
  Star,
  TrendingDown,
} from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName } from "@/lib/format";
import { AdminButton } from "./AdminButton";
import { AdminCard, AdminKpiCard, AdminPageHeader } from "./AdminCard";
import { EmptyState } from "./EmptyState";
import { KpiSkeleton, TableSkeleton } from "./TableSkeleton";
import { ProductThumb } from "./products/ProductThumb";
import { useAdminProducts } from "./products/useAdminProducts";

const ATTENTION_LIMIT = 15;

function issuesOf(p: Product): string[] {
  const issues: string[] = [];
  if (!p.image) issues.push("Sin foto");
  if (p.stock === 0) issues.push("Sin stock");
  if (p.price == null) issues.push("Sin precio");
  if (p.condition === "semi-nuevo" && p.batteryHealth != null && p.batteryHealth < 85) {
    issues.push(`Batería ${p.batteryHealth}%`);
  }
  return issues;
}

export function Dashboard() {
  const { products, arsRate, loading, loadError, load } = useAdminProducts();

  const count = (fn: (p: Product) => boolean) => products.filter(fn).length;
  // Ocultos no molestan en la tienda: la lista de atención mira solo lo visible.
  const attention = products
    .filter((p) => p.active !== false)
    .map((p) => ({ p, issues: issuesOf(p) }))
    .filter((x) => x.issues.length > 0);

  const totalValuationUSD = products
    .filter((p) => p.active !== false && p.price != null && (p.stock ?? 1) > 0)
    .reduce(
      (sum, p) =>
        sum + (p.price as number) * (p.stock ?? (p.condition === "semi-nuevo" ? 1 : 1)),
      0,
    );

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
      label: "Activos",
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

  return (
    <>
      <AdminPageHeader
        title="Resumen"
        description="El estado del catálogo de un vistazo."
      />
      {loading ? (
        <div className="space-y-6">
          <KpiSkeleton count={8} />
          <TableSkeleton rows={4} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Valorización y Resumen Financiero de Inventario */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="admin-card">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                Valorización de Inventario
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-fg)]">
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
                Unidades Físicas Disponibles
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-fg)]">
                {totalUnits.toLocaleString("es-AR")}{" "}
                <span className="text-sm font-normal text-[var(--a-muted)]">
                  unidades
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--a-muted)]">
                {products.filter((p) => p.stock === 0).length} agotados sin unidades
              </div>
            </div>

            <div className="admin-card">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--a-muted)]">
                Distribución de Catálogo
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-[var(--a-fg)]">
                {nuevosCount}{" "}
                <span className="text-sm font-normal text-[var(--a-muted)]">
                  nuevos
                </span>{" "}
                · {semiNuevosCount}{" "}
                <span className="text-sm font-normal text-[var(--a-muted)]">
                  semi-nuevos
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--a-muted)]">
                {count((p) => Boolean(p.featured))} productos destacados en portada
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpis.map((k) => (
              <AdminKpiCard key={k.label} {...k} />
            ))}
          </div>

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
                    <Link
                      href={`/admin/productos?edit=${p.id}`}
                      className="flex min-h-[56px] items-center gap-3 px-5 py-2.5 hover:bg-[#fafafc]"
                    >
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
                      <span className="hidden text-sm text-[var(--a-accent)] sm:inline">
                        Editar
                      </span>
                    </Link>
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
    </>
  );
}
