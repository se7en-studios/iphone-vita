import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Sin variables de Supabase la tienda sigue andando con data/products.ts
 * (y el admin muestra cómo configurarlo). Así un deploy sin env no rompe la web.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let publicClient: SupabaseClient | null = null;

/** Cliente público: solo lecturas, respeta RLS. */
export function supabasePublic(): SupabaseClient {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado");
  publicClient ??= createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  return publicClient;
}

/**
 * Cliente con service role: saltea RLS. SOLO servidor, y solo después de
 * validar al admin con getAuthenticatedAdmin().
 */
export function supabaseAdmin(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL");
  }
  return createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
}
