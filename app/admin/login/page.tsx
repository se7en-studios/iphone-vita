import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase";
import { LoginForm } from "@/components/admin/LoginForm";
import { SetupGuide } from "@/components/admin/SetupGuide";

export const metadata: Metadata = { title: "Ingresar" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isSupabaseConfigured) return <SetupGuide />;
  const { error } = await searchParams;
  return <LoginForm initialError={error === "unauthorized" ? "Tu usuario no tiene acceso al panel." : undefined} />;
}
