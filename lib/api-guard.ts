import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { ValidationError } from "@/lib/validation";

export type AdminRole = "owner" | "staff";
export interface AdminUser {
  email: string;
  role: AdminRole;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Sesión de Supabase Auth + fila activa en admin_users (leída con service role:
 * la tabla no tiene policies, así un usuario logueado cualquiera no puede listarla).
 * Devuelve null si no hay sesión o no es admin.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .select("email, role, active")
    .eq("email", user.email.toLowerCase().trim())
    .maybeSingle();
  if (error) {
    console.error("[auth] admin_users:", error.message);
    return null;
  }
  if (!data?.active) return null;
  return { email: data.email, role: data.role as AdminRole };
}

export async function requireAdmin(role?: AdminRole): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new AuthError("No autorizado", 401);
  if (role === "owner" && admin.role !== "owner")
    throw new AuthError("Solo el dueño puede hacer esto", 403);
  return admin;
}

/**
 * Todo handler de /api/admin pasa por acá: auth, 400 para validación,
 * 500 genérico (el detalle queda en el log del servidor, no en la respuesta).
 */
export async function handle<T>(
  label: string,
  fn: (admin: AdminUser) => Promise<T>,
  options: { role?: AdminRole; status?: number } = {},
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin(options.role);
    return NextResponse.json(await fn(admin), {
      status: options.status ?? 200,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(`[api] ${label}:`, error);
    return NextResponse.json(
      { error: "Error inesperado del servidor" },
      { status: 500 },
    );
  }
}
