import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  hashPin,
  signSession,
} from "@/lib/admin-session";

/* Fuera de /api/admin a propósito: el middleware de ahí exige sesión y esto la crea. */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_IP = 5;
// Tope global: frena a alguien que rota IPs para probar los 10.000 PINs.
const MAX_FAILS_GLOBAL = 40;

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

const json = (body: object, status: number) =>
  NextResponse.json(body, { status });

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured)
    return json({ error: "Supabase no está configurado" }, 503);

  const body = await req.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";
  if (!/^\d{4,8}$/.test(pin))
    return json({ error: "El PIN son 4 a 8 números." }, 400);

  const db = supabaseAdmin();
  const ip = clientIp(req);
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  try {
    const [byIp, global] = await Promise.all([
      db
        .from("admin_login_failures")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip)
        .gte("at", since),
      db
        .from("admin_login_failures")
        .select("id", { count: "exact", head: true })
        .gte("at", since),
    ]);
    if (byIp.error || global.error) throw byIp.error ?? global.error;
    if (
      (byIp.count ?? 0) >= MAX_FAILS_PER_IP ||
      (global.count ?? 0) >= MAX_FAILS_GLOBAL
    ) {
      return json(
        { error: "Demasiados intentos. Esperá 15 minutos y probá de nuevo." },
        429,
      );
    }

    const { data: admin, error } = await db
      .from("admin_users")
      .select("email, active")
      .eq("pin_hash", await hashPin(pin))
      .maybeSingle();
    if (error) throw error;

    if (!admin?.active) {
      const { error: insertError } = await db
        .from("admin_login_failures")
        .insert({ ip });
      if (insertError) throw insertError;
      return json({ error: "PIN incorrecto." }, 401);
    }

    await db.from("admin_login_failures").delete().eq("ip", ip);
    const res = json({ ok: true }, 200);
    res.cookies.set(SESSION_COOKIE, await signSession(admin.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    console.error("[auth] pin login:", error);
    return json({ error: "No se pudo ingresar. Probá de nuevo." }, 500);
  }
}

/** Cerrar sesión. */
export async function DELETE() {
  const res = json({ ok: true }, 200);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
