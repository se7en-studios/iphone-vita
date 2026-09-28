import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { ValidationError } from "@/lib/validation";

export type AdminRole = "owner" | "staff";
export interface AdminUser {
  email: string;
  name: string | null;
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
 * Cookie de sesión del PIN + fila activa en admin_users (leída con service role:
 * la tabla no tiene policies). Devuelve null si no hay sesión o el admin fue desactivado.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured) return null;
  const email = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!email) return null;

  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .select("email, name, role, active")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    console.error("[auth] admin_users:", error.message);
    return null;
  }
  if (!data?.active) return null;
  return { email: data.email, name: data.name, role: data.role as AdminRole };
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
