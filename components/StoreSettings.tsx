"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoreSettings } from "@/types";
import { DEFAULT_ARS_RATE, formatARS } from "@/lib/format";

// ponytail: el default solo aplica fuera de la tienda (ej. una preview en el admin); el layout de la tienda siempre provee los valores reales.
const Ctx = createContext<StoreSettings>({
  arsRate: DEFAULT_ARS_RATE,
  announcement: "",
});

/** Cotización y anuncio que carga el dueño desde el admin, disponibles en toda la tienda. */
export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings;
  children: ReactNode;
}) {
  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function useStoreSettings(): StoreSettings {
  return useContext(Ctx);
}

/** Monto en pesos con la cotización real. Sirve también desde server components. */
export function Ars({ usd }: { usd: number }) {
  const { arsRate } = useStoreSettings();
  return <>{formatARS(usd, arsRate)}</>;
}
