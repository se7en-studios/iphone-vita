"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Product } from "@/types";
import type { ProductInput } from "@/lib/product-row";
import { fullName } from "@/lib/format";
import { AdminModal } from "../../AdminModal";
import { AdminButton } from "../../AdminButton";
import { ConfirmDialog } from "../../ConfirmDialog";
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
  edit: "Editar",
} as const;

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
  const formRef = useRef<HTMLFormElement>(null);
  const dirty = JSON.stringify(state) !== JSON.stringify(initial);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(state);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) {
      // Lleva al primer campo con error.
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave(toInput(state));
      onClose();
    } catch (err) {
      // El mensaje de la API se muestra tal cual.
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

  return (
    <>
      <AdminModal
        title={title}
        onClose={requestClose}
        maxWidth={1080}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              role="alert"
              className="min-w-0 flex-1 text-sm font-medium text-[var(--a-danger)]"
            >
              {serverError ??
                (errorCount > 0
                  ? `Revisá ${errorCount === 1 ? "el campo marcado" : `los ${errorCount} campos marcados`}.`
                  : "")}
            </p>
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
        <form
          ref={formRef}
          id="admin-product-form"
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-8 lg:grid-cols-12"
        >
          <div className="space-y-6 lg:col-span-8">
            {mode.kind === "duplicate" && (
              <p className="rounded-xl bg-[var(--a-accent-bg)] px-4 py-3 text-sm text-[var(--a-accent)]">
                Copia de {fullName(mode.product)}. Cambiá el color, la capacidad
                o lo que sea distinto y guardá: se crea como producto nuevo.
              </p>
            )}
            <BasicSection {...sectionProps} models={models} />
            <VariantSection {...sectionProps} />
            <PriceStockSection {...sectionProps} arsRate={arsRate} />
            <ImagesSection {...sectionProps} />
            <DetailsSection {...sectionProps} />
            <VisibilitySection {...sectionProps} />
          </div>
          <div className="lg:col-span-4">
            <LivePreview product={previewProduct(state)} arsRate={arsRate} />
          </div>
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
