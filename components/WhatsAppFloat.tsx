"use client";

import { useEffect, useRef, useState } from "react";
import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ChatIcon, CloseIcon } from "./ui/Icons";
import { Sparkles, ArrowRight } from "lucide-react";

const TOPICS = [
  {
    icon: "📱",
    label: "Comprar un iPhone o consultar stock",
    msg: "Hola iPhone Vita! Me interesa consultar por stock disponible y precios de iPhone.",
  },
  {
    icon: "🔄",
    label: "Cotizar mi equipo usado (Plan Canje)",
    msg: "Hola iPhone Vita! Quiero consultar para entregar mi equipo actual como parte de pago.",
  },
  {
    icon: "📦",
    label: "Consultar por envíos y medios de pago",
    msg: "Hola iPhone Vita! Quiero consultar los medios de pago aceptados y los tiempos de envío.",
  },
  {
    icon: "💬",
    label: "Hablar directo con un asesor",
    msg: GENERAL_MESSAGE,
  },
];

/** Botón flotante inteligente de WhatsApp con menú rápido de consulta. */
export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const [ctaInView, setCtaInView] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar si hace click afuera o con Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKey);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  /*
   * Con otro botón de WhatsApp en pantalla (Plan Canje, FAQ, cierre, pie, ficha, carrito) el
   * flotante se corre: no lo tapa ni lo duplica, y siempre queda uno a mano. Mismo selector que
   * WhatsAppTracking. Los links que aparecen después (carrito, variantes, navegación sin recarga)
   * se suman solos.
   */
  useEffect(() => {
    const watched = new Set<Element>();
    const inView = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target);
        else inView.delete(e.target);
      }
      setCtaInView(inView.size > 0);
    });
    const scan = () => {
      for (const el of watched) {
        if (el.isConnected) continue;
        io.unobserve(el);
        watched.delete(el);
        inView.delete(el);
      }
      document.querySelectorAll('a[href*="wa.me/"]').forEach((a) => {
        if (watched.has(a) || menuRef.current?.contains(a)) return;
        watched.add(a);
        io.observe(a);
      });
      setCtaInView(inView.size > 0);
    };
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (ctaInView) setOpen(false);
  }, [ctaInView]);

  return (
    <div
      ref={menuRef}
      inert={ctaInView}
      className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex flex-col items-end md:bottom-7 md:right-7 max-lg:[html[data-buybar]_&]:pointer-events-none max-lg:[html[data-buybar]_&]:translate-y-[160%] transition-transform duration-200 ${
        ctaInView ? "pointer-events-none translate-y-[160%]" : ""
      }`}
    >
      {/* Popover con opciones */}
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-[340px] origin-bottom-right rounded-2xl border border-white/10 bg-[#121214]/95 p-4 text-white shadow-2xl backdrop-blur-xl pop-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#30d158]/20 text-[#30d158]">
                <ChatIcon className="size-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">iPhone Vita</p>
                <p className="text-[11px] text-white/50">Respuesta habitual: 5 min</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar opciones"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>

          <p className="py-2.5 text-xs text-white/60">
            ¿En qué podemos ayudarte hoy?
          </p>

          <div className="space-y-1.5">
            {TOPICS.map((t) => (
              <a
                key={t.label}
                href={waLink(t.msg)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-left text-xs transition hover:border-champagne/40 hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{t.icon}</span>
                  <span className="font-medium text-white/90 group-hover:text-white">
                    {t.label}
                  </span>
                </div>
                <ArrowRight size={13} className="shrink-0 text-white/30 group-hover:text-champagne" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Contactar por WhatsApp"
        className="group flex items-center gap-2.5 rounded-full bg-surface-2 p-2.5 text-sm sm:py-3 sm:pl-3.5 sm:pr-4 font-medium text-fg shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-fg/10 transition duration-300 ease-[var(--ease-soft)] hover:-translate-y-0.5 hover:ring-[#30d158]/50"
      >
        <span className="grid size-9 place-items-center rounded-full bg-[#25d366] text-white transition-transform group-hover:scale-105 sm:size-7">
          <ChatIcon className="size-5 sm:size-4" />
        </span>
        <span className="hidden sm:inline font-semibold">WhatsApp</span>
      </button>
    </div>
  );
}
