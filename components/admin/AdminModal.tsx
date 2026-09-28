"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Pila de modales abiertos: solo el de arriba responde a Esc/Tab, y el scroll
// del body se libera cuando se cierra el último (ConfirmDialog sobre ProductForm).
const openModals: string[] = [];

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AdminModal({
  title,
  onClose,
  children,
  footer,
  maxWidth = 480,
  autoFocusFirst = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
  autoFocusFirst?: boolean;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    openModals.push(id);
    document.body.style.overflow = "hidden";

    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
    if (!dialogRef.current?.contains(document.activeElement)) {
      if (autoFocusFirst) {
        (focusable()[1] ?? focusable()[0])?.focus();
      } else {
        dialogRef.current?.focus();
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (openModals[openModals.length - 1] !== id) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      openModals.splice(openModals.indexOf(id), 1);
      if (openModals.length === 0) document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [id]);

  return createPortal(
    <div
      className="admin-portal admin-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        tabIndex={-1}
        className="admin-modal-dialog flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[20px] bg-[var(--a-surface)] shadow-2xl outline-none"
        style={{ maxWidth }}
      >
        <div className="admin-modal-handle">
          <span />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--a-border)] px-5 py-3.5">
          <h2 id={`${id}-title`} className="truncate text-[17px] font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="admin-icon-btn"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-[var(--a-border)] bg-[var(--a-surface-2)] px-5 py-3.5 pb-[max(env(safe-area-inset-bottom),0.875rem)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
