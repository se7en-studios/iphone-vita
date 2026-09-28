import type { Metadata } from "next";
import { SalesPanel } from "@/components/admin/SalesPanel";

export const metadata: Metadata = {
  title: "Ventas & Operaciones · iPhone Vita Admin",
  description: "Historial de ventas, métricas comerciales y comprobantes digitales.",
};

export default function AdminVentasPage() {
  return <SalesPanel />;
}
