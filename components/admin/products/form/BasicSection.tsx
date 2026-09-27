"use client";

import type { CategorySlug, Condition, SubcategorySlug } from "@/types";
import { categories } from "@/data/products";
import { AdminField } from "../../AdminField";
import { FormSection, invalidProps, type SectionProps } from "./FormSection";

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "semi-nuevo", label: "Semi nuevo" },
];

export function BasicSection({
  state,
  set,
  errors,
  models,
}: SectionProps & { models: string[] }) {
  const subcategories = categories.find(
    (c) => c.slug === state.category,
  )?.subcategories;
  return (
    <FormSection title="Básico">
      <AdminField
        label="Nombre *"
        htmlFor="pf-name"
        error={errors.name}
        hint="Sin la variante: “iPhone 17 Pro”, no “iPhone 17 Pro 256GB Azul”."
      >
        <input
          id="pf-name"
          className="admin-input"
          value={state.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="iPhone 17 Pro"
          autoFocus
          {...invalidProps(errors, "name", "pf-name")}
        />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Marca" htmlFor="pf-brand" error={errors.brand}>
          <input
            id="pf-brand"
            className="admin-input"
            value={state.brand}
            onChange={(e) => set({ brand: e.target.value })}
            placeholder="Apple"
          />
        </AdminField>
        <AdminField
          label="Modelo"
          htmlFor="pf-model"
          error={errors.model}
          hint="Agrupa variantes. Elegí uno existente para sumar un color o capacidad."
        >
          <input
            id="pf-model"
            className="admin-input"
            list="pf-models"
            value={state.model}
            onChange={(e) => set({ model: e.target.value })}
            placeholder="Se arma con el nombre"
          />
          <datalist id="pf-models">
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </AdminField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Categoría" htmlFor="pf-category">
          <select
            id="pf-category"
            className="admin-input"
            value={state.category}
            onChange={(e) =>
              set({ category: e.target.value as CategorySlug, subcategory: "" })
            }
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </AdminField>
        {subcategories && (
          <AdminField label="Subcategoría" htmlFor="pf-subcategory">
            <select
              id="pf-subcategory"
              className="admin-input"
              value={state.subcategory}
              onChange={(e) =>
                set({ subcategory: e.target.value as SubcategorySlug | "" })
              }
            >
              <option value="">Sin subcategoría</option>
              {subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </AdminField>
        )}
      </div>
      <div
        role="radiogroup"
        aria-label="Condición"
        className="inline-flex rounded-full bg-[var(--a-surface-3)] p-1"
      >
        {CONDITIONS.map((c) => (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={state.condition === c.value}
            onClick={() => set({ condition: c.value })}
            className={`min-h-[36px] rounded-full px-4 text-sm font-medium transition ${
              state.condition === c.value
                ? "bg-white shadow-sm"
                : "text-[var(--a-muted)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </FormSection>
  );
}
