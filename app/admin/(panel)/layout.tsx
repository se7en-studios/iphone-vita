import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/api-guard";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import { AdminUserProvider } from "@/components/admin/AdminUserContext";
import { SetupGuide } from "@/components/admin/SetupGuide";

// Depende de la sesión: nunca prerender ni cachear.
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) return <SetupGuide />;
  const user = await getAdminUser();
  if (!user) redirect("/admin/login?error=unauthorized");
  return (
    <AdminUserProvider user={user}>
      <AdminToastProvider>
        <AdminShell>{children}</AdminShell>
      </AdminToastProvider>
    </AdminUserProvider>
  );
}
