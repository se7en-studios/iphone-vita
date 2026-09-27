"use client";

import { useState } from "react";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  pendingLabel = "Eliminando…",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setPending(false);
    }
  }

  return (
    <AdminModal
      title={title}
      onClose={() => !pending && onCancel()}
      maxWidth={420}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <AdminButton
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? pendingLabel : confirmLabel}
          </AdminButton>
        </div>
      }
    >
      <p className="text-[15px] leading-relaxed">{message}</p>
      {error && (
        <p role="alert" className="text-sm font-medium text-[var(--a-danger)]">
          {error}
        </p>
      )}
    </AdminModal>
  );
}
