import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/*
 * Refresca la sesión de Supabase y saca a los no logueados de /admin.
 * La verificación de que el usuario ES admin (tabla admin_users) la hacen el
 * layout del panel y cada handler de /api/admin con la service role.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin Supabase el panel muestra la guía de configuración; la API no responde.
  if (!url || !anon) {
    return isApi
      ? NextResponse.json(
          { error: "Supabase no está configurado" },
          { status: 503 },
        )
      : NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = pathname === "/admin/login";
  if (!user && !isLogin) {
    if (isApi)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
