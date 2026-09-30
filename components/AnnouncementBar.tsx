"use client";

import { useEffect, useState } from "react";
import { useStoreSettings } from "./StoreSettings";

const ROTATE_MS = 5000;

export function AnnouncementBar() {
  const { announcement, arsRate } = useStoreSettings();
  const custom = announcement.trim();
  const messages = custom
    ? [custom]
    : [
        `Dólar hoy: 1 USD = $${(arsRate || 1380).toLocaleString("es-AR")} · Aceptamos pesos`,
        "Funda y templado de regalo con tu iPhone nuevo sellado.",
        "Plan Canje: tu iPhone usado como parte de pago.",
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
      {/* Siempre una línea: mensajes de distinto largo cambiaban la altura y empujaban
          toda la página cada 5 s (CLS 0.38 en Lighthouse mobile). */}
      <p className="mx-auto max-w-7xl truncate px-4 py-2.5">
        <span key={i} className="animate-[fade-in_0.6s_ease-out]">
          {messages[i % messages.length]}
        </span>
      </p>
    </div>
  );
}
