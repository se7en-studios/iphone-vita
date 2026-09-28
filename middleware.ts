import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session";

/*
 * Saca de /admin a quien no tenga una sesión de PIN válida.
 * Que el admin siga activo en admin_users lo verifican el layout del panel y cada
 * handler de /api/admin (getAdminUser), así desactivarlo corta el acceso al instante.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");

  // Sin Supabase el panel muestra la guía de configuración; la API no responde.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return isApi
      ? NextResponse.json(
          { error: "Supabase no está configurado" },
          { status: 503 },
        )
      : NextResponse.next();
  }

  const email = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!email && pathname !== "/admin/login") {
    if (isApi)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
