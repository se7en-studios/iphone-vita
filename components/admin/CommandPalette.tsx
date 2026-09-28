"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calculator,
  CornerDownLeft,
  DollarSign,
  ExternalLink,
  FileSpreadsheet,
  LayoutDashboard,
  Moon,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react";
import type { Product } from "@/types";
import { formatARS, formatUSD, fullName } from "@/lib/format";
import { useAdminProducts } from "./products/useAdminProducts";
import { ProductThumb } from "./products/ProductThumb";

interface CommandItem {
  id: string;
  title: string;
  category: "Navegación" | "Acción" | "Productos";
  icon: any;
  shortcut?: string;
  onSelect: () => void;
  product?: Product;
}

export function CommandPalette({
  open,
  onClose,
  onOpenTradeIn,
  onOpenNewSale,
  toggleTheme,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  onOpenTradeIn?: () => void;
  onOpenNewSale?: () => void;
  toggleTheme?: () => void;
  theme?: "dark" | "light";
}) {
  const router = useRouter();
  const { products, arsRate } = useAdminProducts();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Lista base de comandos y navegación
  const baseCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      {
        id: "nav-resumen",
        title: "Ir a Resumen / Dashboard",
        category: "Navegación",
        icon: LayoutDashboard,
        onSelect: () => {
          router.push("/admin/dashboard");
          onClose();
        },
      },
      {
        id: "nav-productos",
        title: "Ir a Catálogo de Productos",
        category: "Navegación",
        icon: Package,
        onSelect: () => {
          router.push("/admin/productos");
          onClose();
        },
      },
      {
        id: "nav-ventas",
        title: "Ir a Ventas & Operaciones",
        category: "Navegación",
        icon: Receipt,
        onSelect: () => {
          router.push("/admin/ventas");
          onClose();
        },
      },
      {
        id: "nav-configuracion",
        title: "Ir a Configuración & Dólar",
        category: "Navegación",
        icon: Settings,
        onSelect: () => {
          router.push("/admin/configuracion");
          onClose();
        },
      },
      {
        id: "act-new-product",
        title: "Nuevo iPhone / Publicar Producto",
        category: "Acción",
        icon: Plus,
        shortcut: "N",
        onSelect: () => {
          router.push("/admin/productos?new=true");
          onClose();
        },
      },
    ];

    if (onOpenNewSale) {
      list.push({
        id: "act-new-sale",
        title: "Registrar Venta Comercial",
        category: "Acción",
        icon: DollarSign,
        onSelect: () => {
          onClose();
          onOpenNewSale();
        },
      });
    }

    if (onOpenTradeIn) {
      list.push({
        id: "act-tradein",
        title: "Abrir Cotizador de Plan Canje Express",
        category: "Acción",
        icon: Calculator,
        onSelect: () => {
          onClose();
          onOpenTradeIn();
        },
      });
    }

    if (toggleTheme) {
      list.push({
        id: "act-toggle-theme",
        title: `Cambiar a Modo ${theme === "dark" ? "Claro" : "Oscuro"}`,
        category: "Acción",
        icon: theme === "dark" ? Sun : Moon,
        onSelect: () => {
          toggleTheme();
          onClose();
        },
      });
    }

    list.push({
      id: "act-view-store",
      title: "Abrir Tienda Pública en nueva pestaña",
      category: "Acción",
      icon: ExternalLink,
      onSelect: () => {
        window.open("/", "_blank");
        onClose();
      },
    });

    return list;
  }, [router, onClose, onOpenNewSale, onOpenTradeIn, toggleTheme, theme]);

  // Filtrado de comandos y productos
  const items = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase();

    // Si no hay query, mostrar comandos base
    if (!q) {
      return baseCommands;
    }

    // Filtrar comandos
    const matchedCommands = baseCommands.filter((c) =>
      c.title.toLowerCase().includes(q),
    );

    // Filtrar productos
    const matchedProducts: CommandItem[] = products
      .filter((p) => {
        const full = fullName(p).toLowerCase();
        const color = (p.color || "").toLowerCase();
        const cap = (p.storage || "").toLowerCase();
        const cond = p.condition.toLowerCase();
        const batt = p.batteryHealth ? `bateria ${p.batteryHealth}` : "";
        return (
          full.includes(q) ||
          color.includes(q) ||
          cap.includes(q) ||
          cond.includes(q) ||
          batt.includes(q)
        );
      })
      .slice(0, 7)
      .map((p) => ({
        id: `prod-${p.id}`,
        title: fullName(p),
        category: "Productos",
        icon: Package,
        product: p,
        onSelect: () => {
          router.push(`/admin/productos?edit=${p.id}`);
          onClose();
        },
      }));

    return [...matchedProducts, ...matchedCommands];
  }, [query, baseCommands, products, router, onClose]);

  // Ajustar índice seleccionado al cambiar items
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length]);

  // Manejo de teclado dentro del buscador
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev - 1 < 0 ? Math.max(0, items.length - 1) : prev - 1,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].onSelect();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, items, selectedIndex, onClose]);

  // Scroll automático hacia el elemento activo
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`,
    ) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 sm:pt-24 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--a-border-strong)] bg-[var(--a-surface)] shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[var(--a-border)] px-4 py-3.5">
          <Search
            size={18}
            className="text-[var(--a-muted)] shrink-0 mr-3"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos, secciones o ejecutar acciones..."
            className="w-full bg-transparent text-[15px] font-medium text-[var(--a-text)] placeholder-[var(--a-muted)] outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[var(--a-muted)] hover:text-[var(--a-text)] p-1"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block rounded-md border border-[var(--a-border)] bg-[var(--a-surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--a-muted)]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[var(--a-border)]"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--a-muted)]">
              No se encontraron coincidencias para &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-0.5">
              {items.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                if (item.product) {
                  const p = item.product;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-index={idx}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-[var(--a-accent-bg)] text-[var(--a-text)]"
                          : "hover:bg-[var(--a-surface-2)] text-[var(--a-text)]"
                      }`}
                    >
                      <ProductThumb src={p.image} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">
                            {item.title}
                          </span>
                          <span className="rounded bg-[var(--a-surface-3)] px-1.5 py-0.2 text-[10px] uppercase font-bold text-[var(--a-muted)]">
                            {p.condition}
                          </span>
                          {p.batteryHealth && (
                            <span className="text-[11px] text-[var(--a-muted)]">
                              {p.batteryHealth}% bat.
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--a-muted)]">
                          {p.price ? (
                            <span className="font-mono font-bold text-emerald-500">
                              {formatUSD(p.price)}
                              {arsRate && (
                                <span className="text-[11px] font-normal text-[var(--a-muted)] ml-1.5">
                                  ≈ {formatARS(p.price, arsRate)}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span>A consultar</span>
                          )}
                          <span className="mx-1.5">·</span>
                          <span>Stock: {p.stock ?? 1}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--a-muted)]">
                        <span className="text-[11px] font-medium hidden sm:inline">
                          Editar
                        </span>
                        <CornerDownLeft size={13} />
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-index={idx}
                    onClick={item.onSelect}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-[var(--a-accent-bg)] text-[var(--a-accent)] font-semibold"
                        : "hover:bg-[var(--a-surface-2)] text-[var(--a-text)]"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-[var(--a-accent)] text-[var(--a-accent-fg)]"
                          : "bg-[var(--a-surface-2)] text-[var(--a-muted)]"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="flex-1 truncate text-sm">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[var(--a-surface-3)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--a-muted)]">
                        {item.category}
                      </span>
                      {isSelected && (
                        <CornerDownLeft size={13} className="text-[var(--a-muted)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-[var(--a-border)] bg-[var(--a-surface-2)] px-4 py-2 text-[11px] text-[var(--a-muted)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-[var(--a-border)] bg-[var(--a-surface)] px-1.5 py-0.5">
                ↑
              </kbd>{" "}
              <kbd className="rounded border border-[var(--a-border)] bg-[var(--a-surface)] px-1.5 py-0.5">
                ↓
              </kbd>{" "}
              Navegar
            </span>
            <span>
              <kbd className="rounded border border-[var(--a-border)] bg-[var(--a-surface)] px-1.5 py-0.5">
                ↵
              </kbd>{" "}
              Seleccionar
            </span>
          </div>
          <span>
            <kbd className="rounded border border-[var(--a-border)] bg-[var(--a-surface)] px-1.5 py-0.5">
              ESC
            </kbd>{" "}
            Cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
