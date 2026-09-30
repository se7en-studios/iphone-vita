"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Cuenta cada click a WhatsApp (la conversión real de la tienda) como evento de Vercel Analytics.
 * ponytail: un solo listener delegado en vez de tocar los ~18 links; ve todo `wa.me` que se agregue.
 * Los eventos custom solo se guardan en plan Pro de Vercel; en Hobby se descartan sin error.
 */
export function WhatsAppTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="wa.me/"]');
      if (!a) return;
      track("whatsapp_click", {
        page: location.pathname,
        label: (a.textContent ?? "").trim().slice(0, 60) || "icono",
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
