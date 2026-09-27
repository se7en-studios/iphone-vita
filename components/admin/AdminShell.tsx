"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ADMIN_NAV_ITEMS, activeNavItem } from "./admin-nav";
import { useAdminUser } from "./AdminUserContext";
import { errorMessage, useAdminToast } from "./AdminToast";

const COLLAPSED_KEY = "vita-admin-sidebar-collapsed";

function RoleBadge({ isOwner }: { isOwner: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isOwner
          ? "bg-[var(--a-accent-bg)] text-[var(--a-accent)]"
          : "bg-[var(--a-surface-3)] text-[var(--a-muted)]"
      }`}
    >
      {isOwner ? "Dueño" : "Staff"}
    </span>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { email, isOwner } = useAdminUser();
  const showToast = useAdminToast();
  const pathname = usePathname();
  const active = activeNavItem(pathname);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "true");
    } catch {
      /* storage bloqueado: queda expandido */
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
      /* no persiste, no pasa nada */
    }
  }

  async function handleLogout() {
    const { error } = await createSupabaseBrowserClient().auth.signOut();
    if (error) {
      showToast(errorMessage(error, "No se pudo cerrar la sesión"), "error");
      return;
    }
    window.location.href = "/admin/login";
  }

  const navLinkClass = (isActive: boolean) =>
    `flex min-h-[40px] items-center gap-3 rounded-[10px] px-3 text-sm transition-colors ${
      isActive
        ? "bg-[var(--a-accent-bg)] font-semibold text-[var(--a-accent)]"
        : "text-[var(--a-muted)] hover:bg-[var(--a-surface-3)] hover:text-[var(--a-text)]"
    }`;

  return (
    <div
      className="vita-admin flex"
      style={
        { "--admin-sidebar-w": collapsed ? "68px" : "240px" } as CSSProperties
      }
    >
      {/* ── Mobile: barra superior ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--a-border)] bg-white/85 px-3 backdrop-blur-xl lg:hidden">
        <span className="text-[15px] font-semibold">iPhone Vita</span>
        <span className="text-sm text-[var(--a-muted)]">{active.label}</span>
      </header>

      {/* ── Mobile: hoja "Más" ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="w-full space-y-4 rounded-t-[20px] bg-white p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--a-border)] pb-3">
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {email}
                </span>
                <RoleBadge isOwner={isOwner} />
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="admin-icon-btn"
                aria-label="Cerrar menú"
                autoFocus
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-1" aria-label="Secciones">
              {ADMIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={navLinkClass(item.href === active.href)}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="space-y-1 border-t border-[var(--a-border)] pt-3">
              <Link href="/" target="_blank" className={navLinkClass(false)}>
                <ExternalLink size={16} /> Ver tienda
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[40px] w-full items-center gap-3 rounded-[10px] px-3 text-sm text-[var(--a-danger)] hover:bg-[var(--a-danger-bg)]"
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: navegación inferior ── */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--a-border)] bg-white/90 px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] backdrop-blur-xl lg:hidden"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.href === active.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                isActive ? "text-[var(--a-accent)]" : "text-[var(--a-muted)]"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-[var(--a-muted)]"
        >
          <Menu size={20} strokeWidth={1.8} />
          Más
        </button>
      </nav>

      {/* ── Desktop: sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-[var(--a-border)] bg-white transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          {!collapsed && (
            <span className="text-[17px] font-semibold tracking-tight">
              iPhone Vita
            </span>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className="admin-icon-btn mx-auto lg:mx-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Secciones">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.href === active.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`${navLinkClass(isActive)} ${collapsed ? "justify-center px-0" : ""}`}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 space-y-1 border-t border-[var(--a-border)] p-3">
          {!collapsed && (
            <div className="px-3 pb-2">
              <div className="truncate text-xs font-medium" title={email}>
                {email}
              </div>
              <RoleBadge isOwner={isOwner} />
            </div>
          )}
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "Ver tienda" : undefined}
            className={`${navLinkClass(false)} ${collapsed ? "justify-center px-0" : ""}`}
          >
            <ExternalLink size={16} className="shrink-0" />
            {!collapsed && "Ver tienda"}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={`flex min-h-[40px] w-full items-center gap-3 rounded-[10px] px-3 text-sm text-[var(--a-danger)] hover:bg-[var(--a-danger-bg)] ${collapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* ── Contenido ── */}
      <main className="min-h-screen min-w-0 flex-1 px-4 pt-[4.5rem] pb-28 sm:px-6 lg:px-8 lg:pt-6 lg:pb-12">
        <header className="sticky top-4 z-30 mb-6 hidden items-center justify-between rounded-2xl border border-[var(--a-border)] bg-white/80 px-5 py-2.5 backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-2 text-sm text-[var(--a-muted)]">
            <span>Admin</span>
            <span aria-hidden>/</span>
            <span className="flex items-center gap-1.5 font-semibold text-[var(--a-text)]">
              <active.icon size={15} className="text-[var(--a-accent)]" />
              {active.label}
            </span>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--secondary admin-btn--sm"
          >
            <ExternalLink size={14} /> Ver tienda
          </Link>
        </header>
        <div key={pathname} className="admin-section-in mx-auto max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
