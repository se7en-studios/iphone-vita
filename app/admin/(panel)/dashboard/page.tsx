import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/Dashboard";

export const metadata: Metadata = { title: "Resumen" };

export default function AdminDashboardPage() {
  return <Dashboard />;
}
