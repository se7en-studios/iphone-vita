"use client";

import { useEffect, useState } from "react";
import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "./ui/Icons";

/** Se esconde al bajar y vuelve al subir; también cuando está la barra de compra fija. */
export function WhatsAppFloat() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 200);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={waLink(GENERAL_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className={`group fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex items-center gap-2 rounded-full bg-surface-2 py-3 pl-3.5 pr-4 text-sm font-medium text-fg shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-fg/10 transition duration-300 ease-[var(--ease-soft)] hover:-translate-y-0.5 md:bottom-7 md:right-7 max-lg:[html[data-buybar]_&]:pointer-events-none max-lg:[html[data-buybar]_&]:translate-y-[160%] ${
        hidden
          ? "pointer-events-none translate-y-[160%] opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100"
          : ""
      }`}
    >
      <span className="grid size-7 place-items-center rounded-full bg-vita text-bg">
        <ChatIcon className="size-4" />
      </span>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
