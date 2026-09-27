"use client";

import { Plus, Trash2 } from "lucide-react";
import { AdminField } from "../../AdminField";
import { FormSection, invalidProps, type SectionProps } from "./FormSection";
import { LIMITS, type SpecRow } from "./formState";

/** Descripción + especificaciones clave/valor (las derivadas de la variante las agrega el servidor). */
export function DetailsSection({ state, set, errors }: SectionProps) {
  const specs = state.specs;
  const setSpec = (i: number, patch: Partial<SpecRow>) =>
    set({ specs: specs.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

  return (
    <>
      <FormSection title="Descripción">
        <AdminField
          label="Texto de la ficha"
          htmlFor="pf-description"
          error={errors.description}
          hint={`${state.description.length}/${LIMITS.description}`}
        >
          <textarea
            id="pf-description"
            rows={4}
            className="admin-input"
            value={state.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Qué incluye, estado, garantía…"
            {...invalidProps(errors, "description", "pf-description")}
          />
        </AdminField>
      </FormSection>

      <FormSection title="Especificaciones">
        <p className="-mt-2 text-xs text-[var(--a-muted)]">
          Capacidad, color, tamaño, talle, batería y condición se agregan solos
          con los datos de la variante.
        </p>
        {specs.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              aria-label={`Especificación ${i + 1}: nombre`}
              className="admin-input !w-2/5"
              value={row.key}
              maxLength={LIMITS.specKey}
              onChange={(e) => setSpec(i, { key: e.target.value })}
              placeholder="Chip"
            />
            <input
              aria-label={`Especificación ${i + 1}: valor`}
              className="admin-input"
              value={row.value}
              maxLength={LIMITS.text}
              onChange={(e) => setSpec(i, { value: e.target.value })}
              placeholder="A19 Pro"
            />
            <button
              type="button"
              className="admin-icon-btn admin-icon-btn--danger !h-10 !w-10"
              aria-label={`Quitar especificación ${i + 1}`}
              onClick={() => set({ specs: specs.filter((_, j) => j !== i) })}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {errors.specs && (
          <p className="text-xs font-medium text-[var(--a-danger)]">
            {errors.specs}
          </p>
        )}
        <button
          type="button"
          onClick={() => set({ specs: [...specs, { key: "", value: "" }] })}
          disabled={specs.length >= LIMITS.specs}
          className="admin-btn admin-btn--secondary admin-btn--sm"
        >
          <Plus size={14} /> Agregar especificación
        </button>
      </FormSection>
    </>
  );
}
