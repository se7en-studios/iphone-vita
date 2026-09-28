"use client";

import { useState, type FormEvent } from "react";
import { AdminField } from "./AdminField";
import { AdminButton } from "./AdminButton";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "No se pudo ingresar. Probá de nuevo.");
        setPin("");
        setLoading(false);
        return;
      }
      // Navegación completa para que el servidor lea la cookie de sesión nueva.
      window.location.href = "/admin";
    } catch {
      setError("Sin conexión. Revisá internet y probá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="vita-admin flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <p className="text-[15px] font-semibold tracking-tight">
            iPhone Vita
          </p>
          <h1 className="mt-6 text-[28px] font-semibold tracking-tight">
            Panel de administración
          </h1>
          <p className="mt-1.5 text-sm text-[var(--a-muted)]">
            Ingresá tu PIN para continuar.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="admin-card flex flex-col gap-4"
        >
          <AdminField label="PIN" htmlFor="login-pin">
            <input
              id="login-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,8}"
              minLength={4}
              maxLength={8}
              required
              autoFocus
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="admin-input text-center text-2xl tracking-[0.5em]"
            />
          </AdminField>
          {error && (
            <p
              role="alert"
              className="rounded-[10px] border border-[var(--a-danger-border)] bg-[var(--a-danger-bg)] px-3 py-2 text-center text-sm text-[var(--a-danger)]"
            >
              {error}
            </p>
          )}
          <AdminButton type="submit" loading={loading} fullWidth>
            {loading ? "Ingresando…" : "Ingresar"}
          </AdminButton>
        </form>
      </div>
    </div>
  );
}
