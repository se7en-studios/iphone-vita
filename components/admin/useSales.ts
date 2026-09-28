"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchSales,
  onSalesUpdated,
  removeSale,
  type SaleRecord,
} from "@/lib/sales";
import { errorMessage, useAdminToast } from "./AdminToast";

/** Ventas desde la base. Se recargan solas cuando otra pantalla registra o borra una. */
export function useSales() {
  const showToast = useAdminToast();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setSales(await fetchSales());
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err, "No se pudieron cargar las ventas"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    return onSalesUpdated(reload);
  }, [reload]);

  const deleteSale = useCallback(
    async (id: string) => {
      try {
        await removeSale(id);
        showToast("Venta eliminada", "success");
      } catch (err) {
        showToast(errorMessage(err, "No se pudo eliminar la venta"), "error");
      }
    },
    [showToast],
  );

  return { sales, loading, loadError, reload, deleteSale };
}
