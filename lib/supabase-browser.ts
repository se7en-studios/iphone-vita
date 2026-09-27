import { createBrowserClient } from "@supabase/ssr";

/** Cliente de navegador para login y "Cerrar sesión". */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
