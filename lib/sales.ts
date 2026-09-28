import type { Condition } from "@/types";

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

const STORAGE_KEY = "vita_sales_history_v1";

// Ventas demo iniciales para que el panel arranque con métricas reales y útiles si está vacío
const INITIAL_DEMO_SALES: SaleRecord[] = [
  {
    id: "sale-1",
    productName: "iPhone 15 Pro 128GB Titán Natural",
    condition: "nuevo",
    quantity: 1,
    salePriceUSD: 1050,
    costUSD: 870,
    profitUSD: 180,
    salePriceARS: 1449000,
    paymentMethod: "efectivo_usd",
    customerName: "Lucas M.",
    notes: "Retiró en persona en Neuquén",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "sale-2",
    productName: "iPhone 13 128GB Midnight (Batería 88%)",
    condition: "semi-nuevo",
    quantity: 1,
    salePriceUSD: 520,
    costUSD: 410,
    profitUSD: 110,
    salePriceARS: 717600,
    paymentMethod: "transferencia_ars",
    customerName: "Camila R.",
    notes: "Envío a Cipolletti",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: "sale-3",
    productName: "iPhone 14 Pro Max 256GB Deep Purple",
    condition: "semi-nuevo",
    quantity: 1,
    salePriceUSD: 890,
    costUSD: 720,
    profitUSD: 170,
    salePriceARS: 1228200,
    paymentMethod: "canje",
    customerName: "Martín G.",
    tradeInModel: "Entregó iPhone 11 128GB ($220 USD)",
    notes: "Diferencia abonada en efectivo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 95).toISOString(),
  },
  {
    id: "sale-4",
    productName: "Apple Watch Series 9 45mm Midnight",
    condition: "nuevo",
    quantity: 1,
    salePriceUSD: 460,
    costUSD: 380,
    profitUSD: 80,
    salePriceARS: 634800,
    paymentMethod: "transferencia_ars",
    customerName: "Sofía V.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
  },
];

export function getStoredSales(): SaleRecord[] {
  if (typeof window === "undefined") return INITIAL_DEMO_SALES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SALES));
      return INITIAL_DEMO_SALES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_SALES;
  } catch {
    return INITIAL_DEMO_SALES;
  }
}

export function saveSale(
  sale: Omit<SaleRecord, "id" | "createdAt" | "profitUSD"> & {
    profitUSD?: number;
  },
): SaleRecord {
  const current = getStoredSales();
  const profitUSD =
    sale.profitUSD ??
    (sale.salePriceUSD != null && sale.costUSD != null
      ? sale.salePriceUSD - sale.costUSD
      : 0);

  const newRecord: SaleRecord = {
    ...sale,
    profitUSD,
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("vita-sales-updated"));
    } catch (e) {
      console.error("Error saving sale:", e);
    }
  }
  return newRecord;
}

export function deleteSale(id: string): void {
  const current = getStoredSales();
  const updated = current.filter((s) => s.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("vita-sales-updated"));
    } catch (e) {
      console.error("Error deleting sale:", e);
    }
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
