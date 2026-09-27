"use client";

import { AdminField } from "../../AdminField";
import { AdminToggle } from "../../AdminToggle";
import { FormSection, invalidProps, type SectionProps } from "./FormSection";

export function VisibilitySection({ state, set, errors }: SectionProps) {
  return (
    <FormSection title="Visibilidad">
      <div className="flex flex-wrap gap-x-6">
        <AdminToggle
          label="Visible en la tienda"
          checked={state.active}
          onChange={(active) => set({ active })}
        />
        <AdminToggle
          label="Destacado"
          checked={state.featured}
          onChange={(featured) => set({ featured })}
        />
        <AdminToggle
          label="Mayorista"
          checked={state.wholesale}
          onChange={(wholesale) => set({ wholesale })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="Orden en el catálogo"
          htmlFor="pf-sort"
          error={errors.sortOrder}
          hint="Menor aparece primero."
        >
          <input
            id="pf-sort"
            type="number"
            min={0}
            inputMode="numeric"
            className="admin-input"
            value={state.sortOrder}
            onChange={(e) => set({ sortOrder: e.target.value })}
            {...invalidProps(errors, "sortOrder", "pf-sort")}
          />
        </AdminField>
        <AdminField
          label="Slug (URL)"
          htmlFor="pf-slug"
          error={errors.slug}
          hint="Vacío = se arma con nombre + variante. Cambiarlo rompe links compartidos."
        >
          <input
            id="pf-slug"
            className="admin-input font-mono text-[13px]"
            value={state.slug}
            onChange={(e) => set({ slug: e.target.value })}
            placeholder="se-genera-solo"
          />
        </AdminField>
      </div>
    </FormSection>
  );
}
