import type { Condition } from "@/types";
import { adminApi } from "./admin-client";

export interface SaleRecord {
  id: string;
  productId?: string;
  productName: string;
  condition: Condition;
  quantity: number;
  salePriceUSD: number;
  costUSD: number;
  profitUSD: number;
  salePriceARS: number;
  paymentMethod:
    | "efectivo_usd"
    | "transferencia_ars"
    | "canje"
    | "tarjeta"
    | "mixto";
  customerName?: string;
  tradeInModel?: string;
  notes?: string;
  createdAt: string;
}

export const PAYMENT_METHODS: SaleRecord["paymentMethod"][] = [
  "efectivo_usd",
  "transferencia_ars",
  "canje",
  "tarjeta",
  "mixto",
];

export const SALE_COLUMNS =
  "id,product_id,product_name,condition,quantity,sale_price_usd,cost_usd,sale_price_ars,payment_method,customer_name,trade_in_model,notes,created_at";

type SaleRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  condition: Condition;
  quantity: number;
  sale_price_usd: number | string;
  cost_usd: number | string;
  sale_price_ars: number | string;
  payment_method: SaleRecord["paymentMethod"];
  customer_name: string | null;
  trade_in_model: string | null;
  notes: string | null;
  created_at: string;
};

/** Fila de Supabase → venta. La ganancia se deriva: sin costo cargado es 0. */
export function rowToSale(r: SaleRow): SaleRecord {
  const salePriceUSD = Number(r.sale_price_usd);
  const costUSD = Number(r.cost_usd);
  return {
    id: r.id,
    productId: r.product_id ?? undefined,
    productName: r.product_name,
    condition: r.condition,
    quantity: r.quantity,
    salePriceUSD,
    costUSD,
    profitUSD: costUSD > 0 ? salePriceUSD - costUSD : 0,
    salePriceARS: Number(r.sale_price_ars),
    paymentMethod: r.payment_method,
    customerName: r.customer_name ?? undefined,
    tradeInModel: r.trade_in_model ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

export type NewSale = Omit<SaleRecord, "id" | "createdAt" | "profitUSD">;

/* Avisa a Resumen y Ventas que recarguen, esté abierta la pantalla que esté. */
const SALES_EVENT = "vita-sales-updated";
const notify = () => window.dispatchEvent(new Event(SALES_EVENT));

export function onSalesUpdated(fn: () => void): () => void {
  window.addEventListener(SALES_EVENT, fn);
  return () => window.removeEventListener(SALES_EVENT, fn);
}

export async function fetchSales(): Promise<SaleRecord[]> {
  await importLocalSales();
  return adminApi<SaleRecord[]>("/api/admin/sales");
}

export async function createSale(sale: NewSale): Promise<SaleRecord> {
  const saved = await adminApi<SaleRecord>("/api/admin/sales", {
    method: "POST",
    body: JSON.stringify(sale),
  });
  notify();
  return saved;
}

export async function removeSale(id: string): Promise<void> {
  await adminApi(`/api/admin/sales/${id}`, { method: "DELETE" });
  notify();
}

/*
 * Una sola vez por navegador: sube a la base las ventas que se cargaron cuando vivían en
 * localStorage y borra la copia local. Las 4 de ejemplo (ids "sale-1".."sale-4") se descartan.
 * ponytail: se puede borrar cuando ya nadie tenga ventas viejas en el navegador.
 */
const LEGACY_KEY = "vita_sales_history_v1";
const DEMO_IDS = new Set(["sale-1", "sale-2", "sale-3", "sale-4"]);

async function importLocalSales(): Promise<void> {
  let legacy: SaleRecord[];
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    legacy = Array.isArray(parsed) ? parsed : [];
  } catch {
    return;
  }
  // Sin productId: el producto puede haberse borrado y la base rechazaría la venta.
  const real = legacy
    .filter((s) => s && !DEMO_IDS.has(s.id))
    .map((s) => ({ ...s, productId: undefined }));
  try {
    if (real.length > 0) {
      await adminApi("/api/admin/sales", {
        method: "POST",
        body: JSON.stringify(real),
      });
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch (error) {
    // La copia local queda y se reintenta en la próxima carga; no bloquea el panel.
    console.error("[ventas] no se pudieron subir las ventas del navegador:", error);
  }
}

export interface SalesMetrics {
  totalRevenueUSD: number;
  totalRevenueARS: number;
  totalProfitUSD: number;
  totalUnitsSold: number;
  averageTicketUSD: number;
  averageMarginPct: number;
  newCount: number;
  semiCount: number;
}

export function computeSalesMetrics(sales: SaleRecord[]): SalesMetrics {
  const totalRevenueUSD = sales.reduce((sum, s) => sum + s.salePriceUSD, 0);
  const totalRevenueARS = sales.reduce((sum, s) => sum + s.salePriceARS, 0);
  const totalProfitUSD = sales.reduce((sum, s) => sum + s.profitUSD, 0);
  const totalUnitsSold = sales.reduce((sum, s) => sum + (s.quantity || 1), 0);
  const totalCostUSD = totalRevenueUSD - totalProfitUSD;

  const averageTicketUSD =
    sales.length > 0 ? Math.round(totalRevenueUSD / sales.length) : 0;
  const averageMarginPct =
    totalCostUSD > 0 ? Math.round((totalProfitUSD / totalCostUSD) * 100) : 0;

  const newCount = sales.filter((s) => s.condition === "nuevo").length;
  const semiCount = sales.filter((s) => s.condition === "semi-nuevo").length;

  return {
    totalRevenueUSD,
    totalRevenueARS,
    totalProfitUSD,
    totalUnitsSold,
    averageTicketUSD,
    averageMarginPct,
    newCount,
    semiCount,
  };
}

export function paymentMethodLabel(pm: SaleRecord["paymentMethod"]): string {
  switch (pm) {
    case "efectivo_usd":
      return "Efectivo USD";
    case "transferencia_ars":
      return "Transferencia ARS";
    case "canje":
      return "Plan Canje";
    case "tarjeta":
      return "Tarjeta de Crédito";
    case "mixto":
      return "Pago Mixto";
    default:
      return pm;
  }
}

export function generateSaleReceiptText(sale: SaleRecord): string {
  const dateStr = new Date(sale.createdAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = new Date(sale.createdAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [
    `*COMPROBANTE DE VENTA · iPHONE VITA* 🍏`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Operación #:* ${sale.id.slice(-6).toUpperCase()}`,
    `📅 *Fecha:* ${dateStr} - ${timeStr}`,
  ];

  if (sale.customerName) {
    lines.push(`👤 *Cliente:* ${sale.customerName}`);
  }

  lines.push(
    ``,
    `📱 *EQUIPO ENTREGADO*`,
    `• ${sale.productName}`,
    `• Condición: ${sale.condition === "nuevo" ? "Sellado en caja (Garantía Oficial Apple)" : "Semi-nuevo Selección Premium (Garantía 3 meses)"}`,
    `• Cantidad: ${sale.quantity || 1}`,
    ``,
    `💰 *DETALLE DE OPERACIÓN*`,
    `• Importe USD: $${sale.salePriceUSD.toLocaleString("es-AR")}`,
    `• Importe ARS: $${sale.salePriceARS.toLocaleString("es-AR")}`,
    `• Forma de pago: ${paymentMethodLabel(sale.paymentMethod)}`,
  );

  if (sale.tradeInModel) {
    lines.push(`• Equipo tomado en parte de pago: ${sale.tradeInModel}`);
  }

  if (sale.notes) {
    lines.push(`• Observaciones: ${sale.notes}`);
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `✨ ¡Muchas gracias por elegir iPhone Vita!`,
    `Servicio técnico, venta y plan canje en Neuquén.`,
  );

  return lines.join("\n");
}

export function exportSalesToCSV(sales: SaleRecord[]): void {
  const headers = [
    "ID",
    "Fecha",
    "Hora",
    "Cliente",
    "Producto",
    "Condición",
    "Cantidad",
    "Precio Venta (USD)",
    "Costo (USD)",
    "Ganancia (USD)",
    "Margen (%)",
    "Precio Venta (ARS)",
    "Método de Pago",
    "Plan Canje Tomado",
    "Notas",
  ];

  const rows = sales.map((s) => {
    const dateObj = new Date(s.createdAt);
    const date = dateObj.toLocaleDateString("es-AR");
    const time = dateObj.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const margin =
      s.costUSD > 0
        ? `${Math.round(((s.salePriceUSD - s.costUSD) / s.costUSD) * 100)}%`
        : "-";

    return [
      `"${s.id}"`,
      `"${date}"`,
      `"${time}"`,
      `"${(s.customerName || "").replace(/"/g, '""')}"`,
      `"${s.productName.replace(/"/g, '""')}"`,
      `"${s.condition}"`,
      s.quantity || 1,
      s.salePriceUSD,
      s.costUSD,
      s.profitUSD,
      `"${margin}"`,
      s.salePriceARS,
      `"${paymentMethodLabel(s.paymentMethod)}"`,
      `"${(s.tradeInModel || "").replace(/"/g, '""')}"`,
      `"${(s.notes || "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  // UTF-8 BOM para que Microsoft Excel abra caracteres especiales correctamente
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const nowStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `ventas-iphone-vita-${nowStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
