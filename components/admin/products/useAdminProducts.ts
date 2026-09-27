"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product, StoreSettings } from "@/types";
import type { ProductInput } from "@/lib/product-row";
import type { ProductPatch } from "@/lib/validation";
import { adminApi } from "@/lib/admin-client";
import { errorMessage, useAdminToast } from "../AdminToast";

interface BulkResult {
  count: number;
  products: Product[];
}

const plural = (n: number) => (n === 1 ? "1 producto" : `${n} productos`);

function applyPatch(p: Product, patch: ProductPatch): Product {
  const next = { ...p, ...patch };
  if ("price" in patch)
    next.priceType = patch.price == null ? "consultar" : "fijo";
  return next;
}

/*
 * Catálogo completo del admin (incluye ocultos) + cotización para mostrar ARS.
 * Las ediciones rápidas son optimistas: se ven al instante y vuelven atrás
 * con un toast si la API falla. Create/update relanzan el error para que el
 * formulario lo muestre.
 */
export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [arsRate, setArsRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const showToast = useAdminToast();
  const productsRef = useRef(products);
  productsRef.current = products;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setProducts(await adminApi<Product[]>("/api/admin/products"));
    } catch (err) {
      setLoadError(errorMessage(err, "No se pudieron cargar los productos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    adminApi<StoreSettings>("/api/admin/settings")
      .then((s) => setArsRate(s.arsRate))
      .catch((err) =>
        showToast(
          `No se pudo leer la cotización: ${errorMessage(err)}`,
          "error",
        ),
      );
  }, [load, showToast]);

  const replace = (updated: Product[]) => {
    const byId = new Map(updated.map((p) => [p.id, p]));
    setProducts((prev) => prev.map((p) => byId.get(p.id) ?? p));
  };

  const patch = useCallback(
    async (
      ids: string[],
      changes: ProductPatch,
      successMessage?: string,
    ): Promise<boolean> => {
      const before = productsRef.current;
      const idSet = new Set(ids);
      setProducts((prev) =>
        prev.map((p) => (idSet.has(p.id) ? applyPatch(p, changes) : p)),
      );
      try {
        const res = await adminApi<BulkResult>("/api/admin/products/bulk", {
          method: "POST",
          body: JSON.stringify({ ids, action: "patch", patch: changes }),
        });
        replace(res.products);
        if (successMessage) showToast(successMessage);
        return true;
      } catch (err) {
        const beforeById = new Map(
          before.filter((p) => idSet.has(p.id)).map((p) => [p.id, p]),
        );
        setProducts((prev) => prev.map((p) => beforeById.get(p.id) ?? p));
        showToast(errorMessage(err, "No se pudo guardar el cambio"), "error");
        return false;
      }
    },
    [showToast],
  );

  async function adjustPrice(ids: string[], percent: number) {
    try {
      const res = await adminApi<BulkResult>("/api/admin/products/bulk", {
        method: "POST",
        body: JSON.stringify({ ids, action: "adjust-price", percent }),
      });
      replace(res.products);
      showToast(`Precio ajustado en ${plural(res.count)}`);
    } catch (err) {
      showToast(errorMessage(err, "No se pudo ajustar el precio"), "error");
      throw err;
    }
  }

  async function removeMany(ids: string[]) {
    try {
      const res = await adminApi<BulkResult>("/api/admin/products/bulk", {
        method: "POST",
        body: JSON.stringify({ ids, action: "delete" }),
      });
      const gone = new Set(res.products.map((p) => p.id));
      setProducts((prev) => prev.filter((p) => !gone.has(p.id)));
      showToast(`${plural(res.count)} eliminado${res.count === 1 ? "" : "s"}`);
    } catch (err) {
      showToast(errorMessage(err, "No se pudo eliminar"), "error");
      throw err;
    }
  }

  async function remove(product: Product) {
    try {
      await adminApi(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast("Producto eliminado");
    } catch (err) {
      showToast(errorMessage(err, "No se pudo eliminar"), "error");
      throw err;
    }
  }

  async function create(input: ProductInput) {
    const created = await adminApi<Product>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setProducts((prev) => [...prev, created]);
    showToast("Producto creado");
  }

  async function update(id: string, input: ProductInput) {
    const updated = await adminApi<Product>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    replace([updated]);
    showToast("Cambios guardados");
  }

  return {
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
  };
}
