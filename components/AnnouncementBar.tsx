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
  /** Pausa con el mouse encima: da tiempo a leer (WCAG 2.2.2). */
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (messages.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setI((n) => (n + 1) % messages.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [messages.length, paused]);

  return (
    // Sin franja propia: sobre el fondo de la página, así la navbar en pastilla queda como única pieza.
    <div
      className="relative z-50 bg-bg text-center text-[12px] tracking-[-0.005em] text-fg/60"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Siempre una línea: mensajes de distinto largo cambiaban la altura y empujaban
          toda la página cada 5 s (CLS 0.38 en Lighthouse mobile). */}
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5" aria-live="off">
        <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-vita/70" />
        <span
          key={i}
          className="min-w-0 truncate animate-[fade-in_0.6s_ease-out] motion-reduce:animate-none"
        >
          {messages[i % messages.length]}
        </span>
      </p>
    </div>
  );
}
