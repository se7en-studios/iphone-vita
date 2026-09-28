"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Palette,
  Smartphone,
  Sliders,
} from "lucide-react";
import type { Product } from "@/types";
import type { ProductInput } from "@/lib/product-row";
import { formatARS, fullName } from "@/lib/format";
import { AdminModal } from "../../AdminModal";
import { AdminButton } from "../../AdminButton";
import { ConfirmDialog } from "../../ConfirmDialog";
import { useAdminToast } from "../../AdminToast";
import { ProductThumb } from "../ProductThumb";
import { BasicSection } from "./BasicSection";
import { VariantSection } from "./VariantSection";
import { PriceStockSection } from "./PriceStockSection";
import { ImagesSection } from "./ImagesSection";
import { DetailsSection } from "./DetailsSection";
import { VisibilitySection } from "./VisibilitySection";
import { LivePreview } from "./LivePreview";
import {
  fromProduct,
  previewProduct,
  toInput,
  validate,
  type FormErrors,
  type FormState,
} from "./formState";

export type FormMode =
  | { kind: "create" }
  | { kind: "edit"; product: Product }
  | { kind: "duplicate"; product: Product };

const TITLES = {
  create: "Nuevo producto",
  duplicate: "Nueva variante",
  edit: "Editar producto",
} as const;

type TabKey =
  | "all"
  | "priceStock"
  | "images"
  | "variant"
  | "basic"
  | "details"
  | "visibility"
  | "preview";

interface TabItem {
  key: TabKey;
  label: string;
  icon: typeof DollarSign;
}

const TABS: TabItem[] = [
  { key: "all", label: "Todos", icon: Sliders },
  { key: "priceStock", label: "Precio & Stock", icon: DollarSign },
  { key: "images", label: "Fotos", icon: ImageIcon },
  { key: "variant", label: "Variante & Batería", icon: Palette },
  { key: "basic", label: "Básico", icon: Layers },
  { key: "details", label: "Ficha & Specs", icon: FileText },
  { key: "visibility", label: "Visibilidad", icon: Eye },
  { key: "preview", label: "Vista previa", icon: Smartphone },
];

const TAB_ERROR_KEYS: Record<string, (keyof FormState)[]> = {
  priceStock: ["price", "cost", "stock", "stockLevel"],
  images: ["images"],
  variant: [
    "color",
    "colorHex",
    "storage",
    "size",
    "bandSize",
    "batteryHealth",
  ],
  basic: ["name", "brand", "model", "category", "subcategory"],
  details: ["description", "specs"],
  visibility: ["slug", "sortOrder"],
};

export function ProductForm({
  mode,
  models,
  arsRate,
  onSave,
  onClose,
}: {
  mode: FormMode;
  models: string[];
  arsRate: number | null;
  onSave: (input: ProductInput) => Promise<void>;
  onClose: () => void;
}) {
  const initial = useMemo(
    () =>
      fromProduct(
        mode.kind === "create" ? null : mode.product,
        mode.kind === "duplicate",
      ),
    [mode],
  );
  const [state, setState] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [copiedLink, setCopiedLink] = useState(false);
  const showToast = useAdminToast();
  const formRef = useRef<HTMLFormElement>(null);
  const dirty = JSON.stringify(state) !== JSON.stringify(initial);

  // Atajo de teclado: Ctrl+S o Cmd+S para guardar rápido
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Aviso del navegador si se cierra la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function set(patch: Partial<FormState>) {
    setState((prev) => ({ ...prev, ...patch }));
    // El error de un campo se limpia apenas se toca.
    setErrors((prev) => {
      const keys = Object.keys(patch) as (keyof FormState)[];
      if (!keys.some((k) => prev[k])) return prev;
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }

  function requestClose() {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  }

  function copyProductLink(slug: string) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/producto/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedLink(true);
        showToast("Enlace copiado al portapapeles", "success");
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(() => {
        showToast("No se pudo copiar el enlace", "error");
      });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(state);
    setErrors(found);
    setServerError(null);

    if (Object.keys(found).length > 0) {
      // Si la sección con error no está en pantalla, cambiamos al tab con error
      const firstErrorKey = Object.keys(found)[0] as keyof FormState;
      const matchingTab = Object.entries(TAB_ERROR_KEYS).find(([, keys]) =>
        keys.includes(firstErrorKey),
      );

      if (matchingTab && activeTab !== "all" && activeTab !== matchingTab[0]) {
        setActiveTab(matchingTab[0] as TabKey);
      }

      setTimeout(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      }, 50);
      return;
    }

    setSaving(true);
    try {
      await onSave(toInput(state));
      showToast(
        mode.kind === "edit"
          ? "Producto actualizado correctamente"
          : "Producto creado con éxito",
        "success",
      );
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  const title =
    mode.kind === "edit"
      ? `${TITLES.edit}: ${fullName(mode.product)}`
      : TITLES[mode.kind];
  const errorCount = Object.keys(errors).length;
  const sectionProps = { state, set, errors };

  function tabHasError(key: string) {
    const keys = TAB_ERROR_KEYS[key];
    return keys ? keys.some((k) => Boolean(errors[k])) : false;
  }

  // Lista de tabs ordenados para navegación anterior/siguiente (excluyendo "all" y "preview")
  const stepTabs: TabKey[] = [
    "priceStock",
    "images",
    "variant",
    "basic",
    "details",
    "visibility",
  ];
  const currentStepIdx = stepTabs.indexOf(activeTab);

  const preview = useMemo(() => previewProduct(state), [state]);

  return (
    <>
      <AdminModal
        title={title}
        onClose={requestClose}
        maxWidth={1120}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {serverError ? (
                <p
                  role="alert"
                  className="text-sm font-semibold text-[var(--a-danger)]"
                >
                  {serverError}
                </p>
              ) : errorCount > 0 ? (
                <p
                  role="alert"
                  className="text-sm font-medium text-[var(--a-danger)]"
                >
                  Revisá{" "}
                  {errorCount === 1
                    ? "el campo marcado"
                    : `los ${errorCount} campos marcados`}
                  .
                </p>
              ) : dirty ? (
                <p className="text-xs text-[var(--a-muted)]">
                  Hay cambios sin guardar (podés presionar{" "}
                  <kbd className="rounded border border-[var(--a-border-strong)] bg-[var(--a-surface-3)] px-1 py-0.5 text-[11px] font-mono">
                    Ctrl+S
                  </kbd>
                  )
                </p>
              ) : (
                <p className="text-xs text-[var(--a-muted)]">
                  Sin cambios pendientes
                </p>
              )}
            </div>
            <div className="flex gap-2.5">
              <AdminButton
                variant="secondary"
                onClick={requestClose}
                disabled={saving}
              >
                Cancelar
              </AdminButton>
              <AdminButton
                type="submit"
                form="admin-product-form"
                loading={saving}
              >
                {saving
                  ? "Guardando…"
                  : mode.kind === "edit"
                    ? "Guardar cambios"
                    : "Crear producto"}
              </AdminButton>
            </div>
          </div>
        }
      >
        {/* Banner de contexto rápido del producto */}
        {(mode.kind === "edit" || mode.kind === "duplicate") && (
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface-2)] p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <ProductThumb
                src={state.images[0] || mode.product.image}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-[var(--a-text)]">
                    {mode.kind === "edit"
                      ? fullName(mode.product)
                      : `Nueva variante de ${fullName(mode.product)}`}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      state.active
                        ? "border border-[var(--a-success-border)] bg-[var(--a-success-bg)] text-[var(--a-success)]"
                        : "bg-[var(--a-surface-3)] text-[var(--a-muted)]"
                    }`}
                  >
                    {state.active ? "● En tienda" : "○ Oculto"}
                  </span>
                  {state.condition === "semi-nuevo" && (
                    <span className="rounded-full bg-[var(--a-warning-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--a-warning)]">
                      Semi nuevo
                      {state.batteryHealth
                        ? ` · ${state.batteryHealth}% bat.`
                        : ""}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-[var(--a-muted)]">
                  <span className="font-semibold tabular-nums text-[var(--a-text)]">
                    {state.consultar
                      ? "Consultar precio"
                      : state.price
                        ? `$${Number(state.price).toLocaleString("es-AR")} USD`
                        : "Sin precio"}
                    {!state.consultar && state.price && arsRate
                      ? ` (≈ ${formatARS(Number(state.price), arsRate)})`
                      : ""}
                  </span>
                  <span>•</span>
                  <span>
                    Stock:{" "}
                    <strong
                      className={
                        state.stock === "0"
                          ? "text-[var(--a-danger)]"
                          : "text-[var(--a-text)]"
                      }
                    >
                      {state.stock === ""
                        ? "No medido"
                        : state.stock === "0"
                          ? "Sin stock"
                          : `${state.stock} unid.`}
                    </strong>
                  </span>
                  {state.cost &&
                    state.price &&
                    !state.consultar &&
                    Number(state.price) > Number(state.cost) && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-[var(--a-success)]">
                          Margen: +$
                          {(
                            Number(state.price) - Number(state.cost)
                          ).toLocaleString("es-AR")}{" "}
                          (+
                          {Math.round(
                            ((Number(state.price) - Number(state.cost)) /
                              Number(state.cost)) *
                              100,
                          )}
                          %)
                        </span>
                      </>
                    )}
                  {mode.kind === "edit" && mode.product.slug && (
                    <>
                      <span>•</span>
                      <span className="max-w-[180px] truncate font-mono text-[11px] text-[var(--a-muted)]">
                        /{mode.product.slug}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {mode.kind === "edit" && mode.product.slug && (
              <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
                <a
                  href={`/producto/${mode.product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                  title="Ver este producto publicado en la tienda"
                >
                  <ExternalLink size={13} />
                  Ver en tienda
                </a>
                <button
                  type="button"
                  onClick={() => copyProductLink(mode.product.slug)}
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  title="Copiar link al portapapeles"
                >
                  {copiedLink ? (
                    <Check size={13} className="text-[var(--a-success)]" />
                  ) : (
                    <Copy size={13} />
                  )}
                  {copiedLink ? "Copiado" : "Copiar"}
                </button>
              </div>
            )}
          </div>
        )}

        {mode.kind === "duplicate" && (
          <p className="rounded-xl border border-[var(--a-accent-border)] bg-[var(--a-accent-bg)] px-3.5 py-2.5 text-xs text-[var(--a-accent)]">
            Estás creando una nueva variante basada en {fullName(mode.product)}.
            Ajustá el color, capacidad o fotos y guardá para sumar el nuevo
            ítem al catálogo.
          </p>
        )}

        {/* Barra de navegación de secciones / tabs */}
        <div className="no-scrollbar sticky -top-5 z-20 -mx-5 flex shrink-0 items-center gap-2 overflow-x-auto border-y border-[var(--a-border)] bg-[var(--a-surface)]/95 px-5 py-2.5 backdrop-blur-md">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const hasErr = tabHasError(tab.key);
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[var(--a-text)] text-[var(--a-bg)] shadow-sm"
                    : "border border-[var(--a-border-strong)] bg-[var(--a-surface)] text-[var(--a-muted)] hover:border-[var(--a-text)] hover:text-[var(--a-text)]"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.key === "images" && state.images.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums font-semibold ${
                      isActive
                        ? "bg-[var(--a-bg)]/20 text-[var(--a-bg)]"
                        : "bg-[var(--a-surface-3)] text-[var(--a-text)]"
                    }`}
                  >
                    {state.images.length}
                  </span>
                )}
                {hasErr && (
                  <span
                    className="h-2 w-2 rounded-full bg-[var(--a-danger)] animate-pulse"
                    title="Esta sección tiene campos para corregir"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Formulario principal */}
        <form
          ref={formRef}
          id="admin-product-form"
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-6 lg:grid-cols-12"
        >
          {/* Columna de edición */}
          <div
            className={
              activeTab === "preview"
                ? "col-span-12"
                : "space-y-5 lg:col-span-8"
            }
          >
            {activeTab === "preview" ? (
              <div className="mx-auto max-w-sm py-4">
                <LivePreview product={preview} arsRate={arsRate} />
              </div>
            ) : (
              <>
                {(activeTab === "all" || activeTab === "priceStock") && (
                  <PriceStockSection {...sectionProps} arsRate={arsRate} />
                )}
                {(activeTab === "all" || activeTab === "images") && (
                  <ImagesSection {...sectionProps} />
                )}
                {(activeTab === "all" || activeTab === "variant") && (
                  <VariantSection {...sectionProps} />
                )}
                {(activeTab === "all" || activeTab === "basic") && (
                  <BasicSection {...sectionProps} models={models} />
                )}
                {(activeTab === "all" || activeTab === "details") && (
                  <DetailsSection {...sectionProps} />
                )}
                {(activeTab === "all" || activeTab === "visibility") && (
                  <VisibilitySection {...sectionProps} />
                )}

                {/* Navegación por pasos cuando se usa un tab específico */}
                {activeTab !== "all" && currentStepIdx !== -1 && (
                  <div className="flex items-center justify-between border-t border-[var(--a-border)] pt-4">
                    <button
                      type="button"
                      disabled={currentStepIdx === 0}
                      onClick={() =>
                        setActiveTab(stepTabs[currentStepIdx - 1])
                      }
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    {currentStepIdx < stepTabs.length - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTab(stepTabs[currentStepIdx + 1])
                        }
                        className="admin-btn admin-btn--secondary admin-btn--sm"
                      >
                        Siguiente <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={saving}
                        className="admin-btn admin-btn--primary admin-btn--sm"
                      >
                        {saving ? "Guardando…" : "Guardar cambios"}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Columna derecha: Live Preview fija en desktop si no está en tab preview */}
          {activeTab !== "preview" && (
            <div className="hidden lg:col-span-4 lg:block">
              <LivePreview product={preview} arsRate={arsRate} />
            </div>
          )}
        </form>
      </AdminModal>

      {confirmDiscard && (
        <ConfirmDialog
          title="¿Descartar cambios?"
          message="Tenés cambios sin guardar en este producto. Si cerrás, se pierden."
          confirmLabel="Descartar"
          pendingLabel="Cerrando…"
          cancelLabel="Seguir editando"
          onConfirm={onClose}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </>
  );
}
