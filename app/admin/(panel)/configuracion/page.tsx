import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Configuración" };

export default function AdminSettingsPage() {
  return <SettingsForm />;
}
