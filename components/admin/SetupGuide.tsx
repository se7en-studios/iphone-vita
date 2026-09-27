import Link from "next/link";
import { Database } from "lucide-react";

const STEPS: { title: string; body: string }[] = [
  {
    title: "Crear el proyecto en Supabase",
    body: "Entrá a supabase.com, creá un proyecto nuevo para iPhone Vita y esperá a que termine de aprovisionarse.",
  },
  {
    title: "Cargar el esquema y los productos",
    body: "Con la CLI: npx supabase db push --include-seed. O en SQL Editor: supabase/migrations/20260927000000_schema.sql y después supabase/seed.sql.",
  },
  {
    title: "Cargar las 3 variables en Vercel",
    body: "Settings → Environment Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY (Project Settings → API). Después hacé redeploy.",
  },
  {
    title: "Crear tu usuario y darle acceso",
    body: "Authentication → Users → Add user con tu email y contraseña. Después corré el insert en admin_users que está al final de la migración del esquema, con ese mismo email.",
  },
];

/** Se muestra en /admin mientras no haya variables de Supabase. La tienda sigue andando con el catálogo del código. */
export function SetupGuide() {
  return (
    <div className="vita-admin flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--a-accent-bg)] text-[var(--a-accent)]">
          <Database size={22} aria-hidden />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">
          Configurar Supabase
        </h1>
        <p className="mt-2 text-[15px] text-[var(--a-muted)]">
          El panel necesita una base de datos para guardar el catálogo. Mientras
          tanto la tienda muestra los productos cargados en el código.
        </p>
        <ol className="mt-8 space-y-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="admin-card flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--a-text)] text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--a-muted)]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <Link href="/" className="admin-btn admin-btn--secondary mt-8">
          Ver tienda
        </Link>
      </div>
    </div>
  );
}
