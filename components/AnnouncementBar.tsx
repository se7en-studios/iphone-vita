"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Funda y templado de regalo con tu iPhone nuevo.",
  "Aceptamos pesos al tipo de cambio del día.",
  "Garantía oficial Apple de 1 año en equipos sellados.",
  "Envíos asegurados a todo el país.",
];
const ROTATE_MS = 5000;

/** Banner superior con un solo mensaje que rota, como el de apple.com. */
export function AnnouncementBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setI((n) => (n + 1) % MESSAGES.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative z-50 bg-surface-2 text-center text-xs text-fg/80">
      <p className="mx-auto max-w-7xl px-4 py-2.5" aria-live="polite">
        <span key={i} className="inline-block animate-[fade-in_0.6s_ease-out]">
          {MESSAGES[i]}
        </span>
      </p>
    </div>
  );
}
