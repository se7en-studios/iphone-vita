import {
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "attention" | "sales";
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package, badgeKey: "attention" },
  { href: "/admin/ventas", label: "Ventas", icon: Receipt },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function activeNavItem(pathname: string | null): AdminNavItem {
  return (
    ADMIN_NAV_ITEMS.find((item) => pathname?.startsWith(item.href)) ??
    ADMIN_NAV_ITEMS[0]
  );
}
