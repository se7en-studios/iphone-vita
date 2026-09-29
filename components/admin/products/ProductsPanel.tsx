"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Calculator, Download, PackageSearch, Plus, RefreshCw, Share2 } from "lucide-react";
import type { Product } from "@/types";
import { fullName } from "@/lib/format";
import type { ProductPatch } from "@/lib/validation";
import { AdminPageHeader } from "../AdminCard";
import { AdminButton } from "../AdminButton";
import { ConfirmDialog } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { TableSkeleton } from "../TableSkeleton";
import { useAdminUser } from "../AdminUserContext";
import { useAdminProducts } from "./useAdminProducts";
import {
  applyFilters,
  downloadCsv,
  filtersToQuery,
  parseFilters,
  type Filters,
} from "./filters";
import { ProductsToolbar } from "./ProductsToolbar";
import { ProductsTable } from "./ProductsTable";
import { BulkBar } from "./BulkBar";
import type { FormMode } from "./form/ProductForm";

/* Las ventanas se descargan recién al abrirlas: juntas eran la mayor parte del JS de esta pantalla. */
const BulkPriceModal = dynamic(() => import("./BulkPriceModal").then((m) => m.BulkPriceModal));
const PriceListModal = dynamic(() => import("./PriceListModal").then((m) => m.PriceListModal));
const ProductForm = dynamic(() => import("./form/ProductForm").then((m) => m.ProductForm));
const RecordSaleModal = dynamic(() => import("./RecordSaleModal").then((m) => m.RecordSaleModal));
const TradeInCalculatorModal = dynamic(() =>
  import("../TradeInCalculatorModal").then((m) => m.TradeInCalculatorModal),
);

type Deleting =
  { kind: "one"; product: Product } | { kind: "many"; ids: string[] };

export function ProductsPanel({
  initialParams,
}: {
  initialParams: Record<string, string>;
}) {
  const { isOwner } = useAdminUser();
  const {
    products,
    arsRate,
    loading,
    loadError,
    load,
    patch,
    adjustPrice,
    removeMany,
    remove,
    create,
    update,
  } = useAdminProducts();
  const [filters, setFilters] = useState<Filters>(() =>
    parseFilters(initialParams),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormMode | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const [priceModal, setPriceModal] = useState(false);
  const [priceListModal, setPriceListModal] = useState(false);
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [tradeInModal, setTradeInModal] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [editParam, setEditParam] = useState<string | null>(initialParams.edit ?? null);

  const filtered = useMemo(
    () => applyFilters(products, filters),
    [products, filters],
  );
  const models = useMemo(
    () => [...new Set(products.map((p) => p.model))].sort(),
    [products],
  );
  const selectedIds = filtered
    .filter((p) => selected.has(p.id))
    .map((p) => p.id);

  // Filtros → URL sin recargar, para que sobrevivan al volver o recargar.
  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `/admin/productos${filtersToQuery(filters)}`,
    );
  }, [filters]);

  // ?edit=<id> (link desde el Resumen) abre el formulario apenas cargan los productos.
  useEffect(() => {
    if (!editParam || loading) return;
    const product = products.find((p) => p.id === editParam);
    if (product) setForm({ kind: "edit", product });
    setEditParam(null);
  }, [editParam, loading, products]);

  function changeFilters(next: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...next }));
    setSelected(new Set());
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const all =
      filtered.length > 0 && filtered.every((p) => selected.has(p.id));
    setSelected(all ? new Set() : new Set(filtered.map((p) => p.id)));
  }

  async function bulkPatch(changes: ProductPatch, message: string) {
    setBulkBusy(true);
    if (await patch(selectedIds, changes, message)) setSelected(new Set());
    setBulkBusy(false);
  }

  async function confirmDelete() {
    if (!deleting) return;
    if (deleting.kind === "one") await remove(deleting.product);
    else {
      await removeMany(deleting.ids);
      setSelected(new Set());
    }
    setDeleting(null);
  }

  async function save(input: Parameters<typeof create>[0]) {
    if (form?.kind === "edit") await update(form.product.id, input);
    else await create(input);
  }

  const handlers = {
    onPatch: (p: Product, changes: ProductPatch) => void patch([p.id], changes),
    onEdit: (p: Product) => setForm({ kind: "edit", product: p }),
    onDuplicate: (p: Product) => setForm({ kind: "duplicate", product: p }),
    onRecordSale: (p: Product) => setSaleProduct(p),
    onDelete: isOwner
      ? (p: Product) => setDeleting({ kind: "one", product: p })
      : undefined,
  };

  const selectedProducts = filtered.filter((p) => selected.has(p.id));

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description="Tocá un precio o un stock para editarlo al toque. Enter guarda, Esc cancela."
        actions={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setTradeInModal(true)}
              disabled={products.length === 0}
            >
              <Calculator size={16} /> Plan Canje
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => setPriceListModal(true)}
              disabled={filtered.length === 0}
            >
              <Share2 size={16} /> Lista WhatsApp / Redes
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => downloadCsv(filtered)}
              disabled={filtered.length === 0}
            >
              <Download size={16} /> Exportar CSV
            </AdminButton>
            <AdminButton onClick={() => setForm({ kind: "create" })}>
              <Plus size={16} /> Nuevo producto
            </AdminButton>
          </>
        }
      />

      <ProductsToolbar
        filters={filters}
        onChange={changeFilters}
        total={products.length}
        shown={filtered.length}
      />

      {selectedIds.length > 0 && (
        <BulkBar
          count={selectedIds.length}
          busy={bulkBusy}
          onPatch={bulkPatch}
          onAdjustPrice={() => setPriceModal(true)}
          onDelete={
            isOwner
              ? () => setDeleting({ kind: "many", ids: selectedIds })
              : undefined
          }
          onClear={() => setSelected(new Set())}
        />
      )}

      {loadError ? (
        <EmptyState
          icon={PackageSearch}
          title="No se pudieron cargar los productos"
          description={loadError}
          action={
            <AdminButton variant="secondary" onClick={load}>
              <RefreshCw size={16} /> Reintentar
            </AdminButton>
          }
        />
      ) : loading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={
            products.length === 0
              ? "Todavía no hay productos"
              : "Ningún producto coincide"
          }
          description={
            products.length === 0
              ? "Cargá el primero con “Nuevo producto”."
              : "Probá con otra búsqueda o limpiá los filtros."
          }
        />
      ) : (
        <ProductsTable
          products={filtered}
          grouped={filters.agrupar}
          arsRate={arsRate}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          handlers={handlers}
        />
      )}

      {form && (
        <ProductForm
          key={form.kind + ("product" in form ? form.product.id : "")}
          mode={form}
          models={models}
          arsRate={arsRate}
          onSave={save}
          onClose={() => setForm(null)}
        />
      )}

      {priceListModal && (
        <PriceListModal
          products={filtered}
          arsRate={arsRate}
          onClose={() => setPriceListModal(false)}
        />
      )}

      {priceModal && (
        <BulkPriceModal
          products={selectedProducts}
          onClose={() => setPriceModal(false)}
          onConfirm={async (percent) => {
            await adjustPrice(selectedIds, percent);
            setSelected(new Set());
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={
            deleting.kind === "one"
              ? "Eliminar producto"
              : `Eliminar ${deleting.ids.length} productos`
          }
          message={
            deleting.kind === "one"
              ? `¿Eliminar “${fullName(deleting.product)}”? Se borran también sus fotos. No se puede deshacer.`
              : `¿Eliminar los ${deleting.ids.length} productos seleccionados y sus fotos? No se puede deshacer. Si solo querés que no se vean, usá “Ocultar”.`
          }
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {saleProduct && (
        <RecordSaleModal
          product={saleProduct}
          arsRate={arsRate}
          onClose={() => setSaleProduct(null)}
          onStockDeducted={(p, newStock) => {
            patch([p.id], { stock: newStock });
          }}
        />
      )}

      {tradeInModal && (
        <TradeInCalculatorModal
          products={products}
          arsRate={arsRate}
          onClose={() => setTradeInModal(false)}
        />
      )}
    </>
  );
}
