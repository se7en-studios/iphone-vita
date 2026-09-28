"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Edición rápida en la tabla: click → input. Enter o salir del campo guarda,
 * Esc cancela. Vacío = null (precio "Consultar", stock sin cargar).
 * El guardado es optimista en el hook; acá solo se valida el número.
 */
export function InlineNumber({
  value,
  display,
  label,
  onSave,
  min = 0,
  max,
  step = 1,
  integer = false,
}: {
  value: number | null;
  display: string;
  label: string;
  onSave: (next: number | null) => void;
  min?: number;
  max: number;
  step?: number;
  integer?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Evita guardar dos veces (Enter + blur al desmontar) o guardar después de Esc.
  const closedRef = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function start() {
    setDraft(value == null ? "" : String(value));
    setInvalid(false);
    closedRef.current = false;
    setEditing(true);
  }

  function close() {
    closedRef.current = true;
    setEditing(false);
  }

  function commit() {
    if (closedRef.current) return;
    const trimmed = draft.trim();
    const next = trimmed === "" ? null : Number(trimmed);
    if (
      next != null &&
      (!Number.isFinite(next) ||
        next < min ||
        next > max ||
        (integer && !Number.isInteger(next)))
    ) {
      setInvalid(true);
      inputRef.current?.focus();
      return;
    }
    close();
    if (next !== value) {
      onSave(next);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1400);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        title={`Editar ${label.toLowerCase()}`}
        aria-label={`${label}: ${display}. Editar`}
        className={`-mx-2 min-h-[36px] rounded-lg border px-2 text-left tabular-nums transition-all duration-300 ${
          justSaved
            ? "border-champagne bg-champagne/15 text-champagne shadow-[0_0_12px_rgba(235,215,190,0.3)]"
            : "border-transparent hover:border-[var(--a-border-strong)] hover:bg-[var(--a-surface-2)]"
        }`}
      >
        {display}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      inputMode={integer ? "numeric" : "decimal"}
      aria-label={label}
      aria-invalid={invalid}
      title={
        invalid
          ? `Entre ${min} y ${max}${integer ? ", sin decimales" : ""}`
          : "Enter guarda · Esc cancela"
      }
      min={min}
      max={max}
      step={step}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        setInvalid(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
      }}
      onBlur={() => (invalid ? close() : commit())}
      className="admin-input w-24 !min-h-[36px] !px-2 !py-1 tabular-nums"
    />
  );
}
