"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

const TOAST_MS = 3200;
const ERROR_TOAST_MS = 6000; // los errores traen texto del servidor: más tiempo para leerlos
const LEAVE_MS = 180;

type ShowToast = (message: string, variant?: ToastVariant) => void;

const AdminToastContext = createContext<ShowToast | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  // El portal no puede renderizar en SSR: se activa después de montar.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      LEAVE_MS,
    );
  }, []);

  const showToast = useCallback<ShowToast>(
    (message, variant = "success") => {
      const id = idRef.current++;
      setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);
      setTimeout(
        () => dismiss(id),
        variant === "error" ? ERROR_TOAST_MS : TOAST_MS,
      );
    },
    [dismiss],
  );

  return (
    <AdminToastContext.Provider value={showToast}>
      {children}
      {mounted &&
        createPortal(
          <div className="admin-portal fixed bottom-20 left-1/2 z-[200] flex w-[min(380px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0">
            {toasts.map((t) => (
              <div
                key={t.id}
                role={t.variant === "error" ? "alert" : "status"}
                className={`admin-toast admin-toast--${t.variant} ${t.leaving ? "admin-toast--leaving" : ""}`}
              >
                <span className="admin-toast-dot" aria-hidden />
                <span className="flex-1">{t.message}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): ShowToast {
  const showToast = useContext(AdminToastContext);
  if (!showToast)
    throw new Error("useAdminToast debe usarse dentro de AdminToastProvider");
  return showToast;
}

/** Mensaje de un error desconocido, para toasts. */
export const errorMessage = (err: unknown, fallback = "Algo salió mal") =>
  err instanceof Error ? err.message : fallback;
