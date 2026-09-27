"use client";

import {
  Eye,
  EyeOff,
  Percent,
  PackageX,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";
import type { ProductPatch } from "@/lib/validation";

export function BulkBar({
  count,
  busy,
  onPatch,
  onAdjustPrice,
  onDelete,
  onClear,
}: {
  count: number;
  busy: boolean;
  onPatch: (patch: ProductPatch, message: string) => void;
  onAdjustPrice: () => void;
  /** undefined para staff. */
  onDelete?: () => void;
  onClear: () => void;
}) {
  const n = count === 1 ? "1 producto" : `${count} productos`;
  const actions: { label: string; icon: typeof Eye; run: () => void }[] = [
    {
      label: "Mostrar",
      icon: Eye,
      run: () =>
        onPatch(
          { active: true },
          `${n} visible${count === 1 ? "" : "s"} en la tienda`,
        ),
    },
    {
      label: "Ocultar",
      icon: EyeOff,
      run: () =>
        onPatch({ active: false }, `${n} oculto${count === 1 ? "" : "s"}`),
    },
    {
      label: "Destacar",
      icon: Star,
      run: () =>
        onPatch({ featured: true }, `${n} destacado${count === 1 ? "" : "s"}`),
    },
    {
      label: "Quitar destacado",
      icon: StarOff,
      run: () => onPatch({ featured: false }, `Se quitó el destacado a ${n}`),
    },
    {
      label: "Sin stock",
      icon: PackageX,
      run: () =>
        onPatch(
          { stock: 0 },
          `${n} marcado${count === 1 ? "" : "s"} sin stock`,
        ),
    },
    { label: "Ajustar precio %", icon: Percent, run: onAdjustPrice },
  ];

  return (
    <div
      role="region"
      aria-label="Acciones sobre la selección"
      className="sticky top-[4.25rem] z-20 mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-[#1d1d1f] p-2 pl-4 text-white shadow-lg lg:top-24"
    >
      <span className="mr-1 text-sm font-semibold">
        {count} seleccionado{count === 1 ? "" : "s"}
      </span>
      <div className="flex flex-1 flex-wrap gap-1">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled={busy}
            onClick={a.run}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium hover:bg-white/15 disabled:opacity-50"
          >
            <a.icon size={15} aria-hidden /> {a.label}
          </button>
        ))}
        {onDelete && (
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#ff6961] hover:bg-white/15 disabled:opacity-50"
          >
            <Trash2 size={15} aria-hidden /> Borrar
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Deseleccionar todo"
        className="admin-icon-btn !text-white hover:!bg-white/15"
      >
        <X size={18} />
      </button>
    </div>
  );
}
