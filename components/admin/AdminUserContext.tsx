"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AdminUser } from "@/lib/api-guard";

const AdminUserContext = createContext<AdminUser | null>(null);

export function AdminUserProvider({
  user,
  children,
}: {
  user: AdminUser;
  children: ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={user}>
      {children}
    </AdminUserContext.Provider>
  );
}

/** Usuario del panel. La UI oculta lo que staff no puede hacer; la API igual lo bloquea. */
export function useAdminUser() {
  const user = useContext(AdminUserContext);
  if (!user)
    throw new Error("useAdminUser debe usarse dentro de AdminUserProvider");
  return { ...user, isOwner: user.role === "owner" };
}
