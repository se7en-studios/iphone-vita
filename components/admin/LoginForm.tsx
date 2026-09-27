"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AdminField } from "./AdminField";
import { AdminButton } from "./AdminButton";

function loginErrorMessage(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "Email o contraseña incorrectos.";
  if (/email not confirmed/i.test(message))
    return "Tenés que confirmar tu email antes de entrar.";
  if (/rate limit|too many/i.test(message))
    return "Demasiados intentos. Esperá un minuto y probá de nuevo.";
  return "No se pudo iniciar sesión. Probá de nuevo.";
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } =
      await createSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
    if (authError) {
      setError(loginErrorMessage(authError.message));
      setLoading(false);
      return;
    }
    // Navegación completa para que el servidor lea la cookie de sesión nueva.
    window.location.href = "/admin";
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
            Ingresá con tu cuenta para continuar.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="admin-card flex flex-col gap-4"
        >
          <AdminField label="Email" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="admin-input"
            />
          </AdminField>
          <AdminField label="Contraseña" htmlFor="login-password">
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
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
