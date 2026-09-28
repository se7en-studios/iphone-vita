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
  Moon,
  Sun,
  X,
  Sparkles,
  TrendingUp,
  Store,
  RefreshCw,
  Search,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ADMIN_NAV_ITEMS, activeNavItem } from "./admin-nav";
import { useAdminUser } from "./AdminUserContext";
import { errorMessage, useAdminToast } from "./AdminToast";
import { formatARS } from "@/lib/format";
import type { Product, StoreSettings } from "@/types";
import { CommandPalette } from "./CommandPalette";

const COLLAPSED_KEY = "vita-admin-sidebar-collapsed";
const THEME_KEY = "vita-admin-theme";

function RoleBadge({ isOwner }: { isOwner: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
        isOwner
          ? "bg-[var(--a-gold-bg)] text-[var(--a-gold)] border border-[var(--a-gold)]/20"
          : "bg-[var(--a-surface-3)] text-[var(--a-muted)]"
      }`}
    >
      {isOwner ? "👑 Dueño" : "Staff"}
    </span>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [arsRate, setArsRate] = useState<number | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [attentionCount, setAttentionCount] = useState<number>(0);

  const { email, isOwner } = useAdminUser();
  const showToast = useAdminToast();
  const pathname = usePathname();
  const active = activeNavItem(pathname);

  // Load saved sidebar state and theme preference
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "true");
      const savedTheme = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
      const initialTheme = savedTheme || "dark";
      setTheme(initialTheme);
      applyTheme(initialTheme);
    } catch {
      applyTheme("dark");
    }
  }, []);

  // Fetch live store settings for dollar exchange rate in topbar
  const fetchSettings = () => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StoreSettings | null) => {
        if (data?.arsRate) setArsRate(data.arsRate);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSettings();
    const handleUpdate = () => fetchSettings();
    window.addEventListener("vita-rate-updated", handleUpdate);
    return () => window.removeEventListener("vita-rate-updated", handleUpdate);
  }, []);

  // Conteo de inventario que requiere atención
  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((prods: Product[]) => {
        const count = prods.filter(
          (p) =>
            p.active !== false &&
            (p.stock === 0 || p.stockLevel === "bajo" || !p.image),
        ).length;
        setAttentionCount(count);
      })
      .catch(() => {});
  }, [pathname]);

  // Atajo global Ctrl+K / Cmd+K para Command Palette
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function applyTheme(newTheme: "dark" | "light") {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-admin-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

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
    } catch {}
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
    `group flex min-h-[42px] items-center gap-3 rounded-xl px-3.5 text-sm transition-all duration-150 ${
      isActive
        ? "bg-[var(--a-accent-bg)] font-semibold text-[var(--a-accent)] shadow-[0_0_15px_rgba(41,151,255,0.12)] border border-[var(--a-accent-border)]"
        : "text-[var(--a-muted)] hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)]"
    }`;

  return (
    <div
      className={`vita-admin flex ${theme}`}
      style={
        { "--admin-sidebar-w": collapsed ? "72px" : "250px" } as CSSProperties
      }
    >
      {/* ── Mobile: barra superior con blur ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--a-border)] bg-[var(--a-surface)]/85 px-4 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--a-text)] text-[var(--a-bg)] font-bold text-xs">
            V
          </div>
          <span className="text-[15px] font-bold tracking-tight">iPhone Vita</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            aria-label="Buscar productos o acciones"
            className="admin-icon-btn !size-8"
          >
            <Search size={15} />
          </button>
          {arsRate && (
            <Link
              href="/admin/configuracion"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--a-surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--a-text)] border border-[var(--a-border)]"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ${arsRate.toLocaleString("es-AR")}
            </Link>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="admin-icon-btn !size-8"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* ── Mobile: hoja "Más" ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-md lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="w-full space-y-4 rounded-t-[24px] border-t border-[var(--a-border-strong)] bg-[var(--a-surface)] p-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--a-border)] pb-3">
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[var(--a-text)]">
                  {email}
                </span>
                <div className="mt-1">
                  <RoleBadge isOwner={isOwner} />
                </div>
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
            <nav className="space-y-1.5" aria-label="Secciones">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setCommandOpen(true);
                }}
                className="flex min-h-[42px] w-full items-center justify-between rounded-xl px-3.5 text-sm text-[var(--a-text)] bg-[var(--a-surface-2)] border border-[var(--a-border)] mb-2 font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <Search size={16} className="text-[var(--a-muted)]" />
                  <span>Buscador y acciones...</span>
                </span>
                <kbd className="rounded border border-[var(--a-border-strong)] bg-[var(--a-surface)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--a-muted)]">
                  ⌘K
                </kbd>
              </button>
              {ADMIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={navLinkClass(item.href === active.href)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.badgeKey === "attention" && attentionCount > 0 && (
                    <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-500">
                      {attentionCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="space-y-2 border-t border-[var(--a-border)] pt-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex min-h-[40px] w-full items-center justify-between rounded-xl px-3.5 text-sm text-[var(--a-text)] bg-[var(--a-surface-2)] border border-[var(--a-border)]"
              >
                <span className="flex items-center gap-2.5">
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  <span>Modo {theme === "dark" ? "Claro" : "Oscuro"}</span>
                </span>
                <span className="text-xs text-[var(--a-muted)]">Cambiar</span>
              </button>
              <Link
                href="/"
                target="_blank"
                className="flex min-h-[40px] items-center gap-2.5 rounded-xl px-3.5 text-sm text-[var(--a-text)] hover:bg-[var(--a-surface-2)]"
              >
                <ExternalLink size={16} /> Ver tienda pública
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[40px] w-full items-center gap-2.5 rounded-xl px-3.5 text-sm font-medium text-[var(--a-danger)] hover:bg-[var(--a-danger-bg)]"
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: barra inferior con glassmorphism ── */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--a-border)] bg-[var(--a-surface)]/90 px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] backdrop-blur-2xl lg:hidden"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.href === active.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                isActive ? "text-[var(--a-accent)]" : "text-[var(--a-muted)]"
              }`}
            >
              <div className="relative">
                <item.icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {item.badgeKey === "attention" && attentionCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 ring-2 ring-[var(--a-surface)]" />
                )}
              </div>
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-[var(--a-muted)] hover:text-[var(--a-text)]"
        >
          <Menu size={20} strokeWidth={1.8} />
          Más
        </button>
      </nav>

      {/* ── Desktop: Sidebar Executive ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-[var(--a-border)] bg-[var(--a-surface)] transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[72px]" : "w-[250px]"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-18 shrink-0 items-center justify-between px-4 border-b border-[var(--a-border)]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--a-accent)] to-blue-700 text-white font-black text-sm shadow-[0_0_16px_rgba(41,151,255,0.4)]">
                V
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-bold tracking-tight text-[var(--a-text)]">
                  iPhone Vita
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Tienda Online
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--a-accent)] to-blue-700 text-white font-black text-sm shadow-[0_0_16px_rgba(41,151,255,0.4)]">
              V
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className="admin-icon-btn"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 px-3 py-4" aria-label="Secciones">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.href === active.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`${navLinkClass(isActive)} ${collapsed ? "justify-center px-0 relative" : ""}`}
              >
                <item.icon size={19} className="shrink-0" />
                {!collapsed && (
                  <span className="truncate tracking-tight flex-1">{item.label}</span>
                )}
                {item.badgeKey === "attention" && attentionCount > 0 && (
                  collapsed ? (
                    <span className="absolute top-2 right-2 size-2 rounded-full bg-amber-500 ring-2 ring-[var(--a-surface)]" />
                  ) : (
                    <span className="ml-auto rounded-full bg-amber-500/15 text-amber-500 px-2 py-0.5 text-[11px] font-bold">
                      {attentionCount}
                    </span>
                  )
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar Widget: Live Dollar Quote & Controls */}
        <div className="shrink-0 space-y-2 border-t border-[var(--a-border)] p-3">
          {!collapsed && arsRate && (
            <Link
              href="/admin/configuracion"
              title="Ajustar cotización en configuración"
              className="block rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-2.5 transition hover:border-[var(--a-accent)]/40 hover:bg-[var(--a-surface-3)]"
            >
              <div className="flex items-center justify-between text-[11px] text-[var(--a-muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Dólar del día
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Activo
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-extrabold text-[var(--a-text)] tabular">
                  ${arsRate.toLocaleString("es-AR")}
                </span>
                <span className="text-[10px] text-[var(--a-muted)]">ARS / USD</span>
              </div>
            </Link>
          )}

          {!collapsed && (
            <div className="px-2 py-1 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="truncate text-xs font-semibold text-[var(--a-text)]" title={email}>
                  {email}
                </div>
                <div className="mt-0.5">
                  <RoleBadge isOwner={isOwner} />
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                title={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
                className="admin-icon-btn !size-8"
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 pt-1">
            <Link
              href="/"
              target="_blank"
              title={collapsed ? "Ver tienda pública" : undefined}
              className={`flex-1 ${navLinkClass(false)} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <ExternalLink size={16} className="shrink-0" />
              {!collapsed && <span>Ver tienda</span>}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="admin-icon-btn admin-icon-btn--danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Contenido Principal & Top Bar ── */}
      <main className="min-h-screen min-w-0 flex-1 px-4 pt-[4.5rem] pb-28 sm:px-6 lg:px-8 lg:pt-5 lg:pb-12">
        {/* Desktop Executive Top Bar */}
        <header className="sticky top-4 z-30 mb-6 hidden items-center justify-between rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)]/80 px-5 py-3 shadow-lg backdrop-blur-2xl lg:flex">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-[var(--a-muted)] font-medium">
              <span>Admin</span>
              <span aria-hidden className="text-[var(--a-border-strong)]">/</span>
              <span className="flex items-center gap-2 font-bold text-[var(--a-text)]">
                <active.icon size={16} className="text-[var(--a-accent)]" />
                {active.label}
              </span>
            </div>

            {/* Quick Command Palette trigger */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs text-[var(--a-muted)] hover:border-[var(--a-accent)]/50 hover:bg-[var(--a-surface-3)] hover:text-[var(--a-text)] transition cursor-pointer shadow-xs ml-2"
              title="Buscar productos, secciones o acciones (⌘K / Ctrl+K)"
            >
              <Search size={14} className="text-[var(--a-muted)]" />
              <span className="font-medium hidden xl:inline">Buscar o ejecutar comando...</span>
              <span className="font-medium xl:hidden">Buscar...</span>
              <kbd className="rounded border border-[var(--a-border-strong)] bg-[var(--a-surface)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--a-muted)]">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Exchange Rate Pill */}
            {arsRate && (
              <Link
                href="/admin/configuracion"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--a-text)] transition hover:border-[var(--a-accent)]/50 hover:bg-[var(--a-surface-3)]"
              >
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>1 USD = {formatARS(1, arsRate)}</span>
                <span className="text-[10px] text-[var(--a-muted)] font-normal">Ajustar ›</span>
              </Link>
            )}

            {/* Theme switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="admin-icon-btn"
              title={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Direct Store Link */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn--secondary admin-btn--sm"
            >
              <ExternalLink size={14} /> Ver tienda
            </Link>
          </div>
        </header>

        {/* Section View */}
        <div key={pathname} className="admin-section-in mx-auto max-w-[1440px]">
          {children}
        </div>
      </main>

      {/* ── Spotlight Command Palette Global ── */}
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        toggleTheme={toggleTheme}
        theme={theme}
      />
    </div>
  );
}
