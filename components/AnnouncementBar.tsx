"use client";

import { useEffect, useState } from "react";
import { useStoreSettings } from "./StoreSettings";

const DEFAULT_MESSAGES = [
  "Funda y templado de regalo con tu iPhone nuevo.",
  "Aceptamos pesos al tipo de cambio del día.",
  "Garantía oficial Apple de 1 año en equipos sellados.",
  "Envíos asegurados a todo el país.",
];
const ROTATE_MS = 5000;

export function AnnouncementBar() {
  const { announcement, arsRate } = useStoreSettings();
  const custom = announcement.trim();
  const messages = custom
    ? [custom]
    : [
        `Cotización del día: 1 USD = $${(arsRate || 1380).toLocaleString("es-AR")} ARS · Aceptamos pesos y dólares`,
        "Funda y templado de regalo con tu iPhone nuevo sellado.",
        "Plan Canje: Tomamos tu iPhone usado en parte de pago.",
        "Garantía escrita y envíos asegurados a todo el país.",
      ];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setI((n) => (n + 1) % messages.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [messages.length]);

  return (
    <div className="relative z-50 bg-surface-2 text-center text-xs text-fg/80">
      <p className="mx-auto max-w-7xl px-4 py-2.5" aria-live="polite">
        <span key={i} className="inline-block animate-[fade-in_0.6s_ease-out]">
          {messages[i % messages.length]}
        </span>
      </p>
    </div>
  );
}
