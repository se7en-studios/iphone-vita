"use client";

import { AdminField } from "../../AdminField";
import { FormSection, invalidProps, type SectionProps } from "./FormSection";

const TEXT_FIELDS = [
  { key: "storage", label: "Capacidad", placeholder: "256GB" },
  { key: "size", label: "Tamaño", placeholder: '13" · 46mm' },
  { key: "bandSize", label: "Talle de malla", placeholder: "M/L" },
] as const;

export function VariantSection({ state, set, errors }: SectionProps) {
  const validHex = /^#[0-9A-Fa-f]{6}$/.test(state.colorHex);
  return (
    <FormSection title="Variante">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Color" htmlFor="pf-color" error={errors.color}>
          <input
            id="pf-color"
            className="admin-input"
            value={state.color}
            onChange={(e) => set({ color: e.target.value })}
            placeholder="Azul profundo"
          />
        </AdminField>
        <AdminField
          label="Color para el puntito"
          htmlFor="pf-colorhex"
          error={errors.colorHex}
        >
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Elegir color"
              value={validHex ? state.colorHex : "#d2d2d7"}
              onChange={(e) => set({ colorHex: e.target.value })}
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--a-border-strong)] bg-white p-1"
            />
            <input
              id="pf-colorhex"
              className="admin-input font-mono"
              value={state.colorHex}
              onChange={(e) => set({ colorHex: e.target.value })}
              placeholder="#1D3557"
              maxLength={7}
              {...invalidProps(errors, "colorHex", "pf-colorhex")}
            />
          </div>
        </AdminField>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {TEXT_FIELDS.map((f) => (
          <AdminField
            key={f.key}
            label={f.label}
            htmlFor={`pf-${f.key}`}
            error={errors[f.key]}
          >
            <input
              id={`pf-${f.key}`}
              className="admin-input"
              value={state[f.key]}
              onChange={(e) => set({ [f.key]: e.target.value })}
              placeholder={f.placeholder}
            />
          </AdminField>
        ))}
      </div>
      {state.condition === "semi-nuevo" && (
        <AdminField
          label="Salud de batería (%)"
          htmlFor="pf-battery"
          error={errors.batteryHealth}
          className="sm:max-w-[200px]"
        >
          <input
            id="pf-battery"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            className="admin-input"
            value={state.batteryHealth}
            onChange={(e) => set({ batteryHealth: e.target.value })}
            placeholder="89"
            {...invalidProps(errors, "batteryHealth", "pf-battery")}
          />
        </AdminField>
      )}
    </FormSection>
  );
}
