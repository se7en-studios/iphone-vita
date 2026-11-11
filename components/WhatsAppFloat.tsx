"use client";

import { useEffect, useRef, useState } from "react";
import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ChatIcon, ChevronIcon, CloseIcon } from "./ui/Icons";
import { MessageCircle, Package, RefreshCw, Smartphone } from "lucide-react";

const TOPICS = [
  {
    icon: Smartphone,
    label: "Comprar un iPhone o consultar stock",
    msg: "Hola iPhone Vita! Me interesa consultar por stock disponible y precios de iPhone.",
  },
  {
    icon: RefreshCw,
    label: "Cotizar mi equipo usado (Plan Canje)",
    msg: "Hola iPhone Vita! Quiero consultar para entregar mi equipo actual como parte de pago.",
  },
  {
    icon: Package,
    label: "Consultar por envíos y medios de pago",
    msg: "Hola iPhone Vita! Quiero consultar los medios de pago aceptados y los tiempos de envío.",
  },
  {
    icon: MessageCircle,
    label: "Hablar directo con un asesor",
    msg: GENERAL_MESSAGE,
  },
];

/** Botón flotante inteligente de WhatsApp con menú rápido de consulta. */
export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const [ctaInView, setCtaInView] = useState(false);
  /** En el celular se esconde mientras bajás leyendo y vuelve al subir o al llegar al final. */
  const [tucked, setTucked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstTopic = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
        if (Math.abs(y - last) < 12 && !atEnd) return;
        setTucked(y > last && y > 240 && !atEnd);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTucked(false);
      firstTopic.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Cerrar si hace click afuera o con Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
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
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex flex-col items-end transition-[translate,opacity] duration-300 ease-[var(--ease-out-expo)] md:bottom-7 md:right-7 max-lg:[html[data-buybar]_&]:pointer-events-none max-lg:[html[data-buybar]_&]:translate-y-[160%] ${
        ctaInView ? "pointer-events-none translate-y-[160%]" : ""
      } ${tucked && !open ? "max-sm:pointer-events-none max-sm:translate-y-[160%] max-sm:opacity-0" : ""}`}
    >
      {/* Popover con opciones */}
      {open && (
        <div
          id="wa-menu"
          role="dialog"
          aria-label="Contactar por WhatsApp"
          className="pop-in mb-3 w-[calc(100vw-2rem)] max-w-[340px] origin-bottom-right rounded-[22px] border border-fg/10 bg-surface/95 p-2 text-fg shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150"
        >
          <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-2.5">
            <div className="flex items-center gap-3">
              <span className="relative grid size-9 place-items-center rounded-full bg-[#25d366] text-white">
                <ChatIcon className="size-[18px]" />
              </span>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-fg">iPhone Vita</p>
                <p className="text-[12px] text-fg/55">Respuesta habitual: 5 min</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
              className="grid size-8 place-items-center rounded-full text-fg/45 transition-colors hover:bg-fg/[0.06] hover:text-fg"
              aria-label="Cerrar opciones"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>

          <p className="border-t border-fg/[0.08] px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg/45">
            ¿En qué te ayudamos?
          </p>

          <div>
            {TOPICS.map((t, i) => (
              <a
                key={t.label}
                ref={i === 0 ? firstTopic : undefined}
                href={waLink(t.msg)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                style={{ outlineOffset: -2 }}
                className="group flex items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-fg/[0.04] focus-visible:bg-fg/[0.04]"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-vita-soft text-vita">
                  <t.icon size={15} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="flex-1 text-[13.5px] font-medium leading-snug tracking-[-0.005em] text-fg/85 group-hover:text-fg">
                  {t.label}
                </span>
                <ChevronIcon className="size-3.5 shrink-0 text-fg/25 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-fg/50" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={open ? "wa-menu" : undefined}
        aria-label="Contactar por WhatsApp"
        className="group flex items-center gap-2.5 rounded-full border border-fg/10 bg-surface/90 p-1.5 text-sm font-medium text-fg shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-12px_rgba(0,0,0,0.3)] backdrop-blur-xl backdrop-saturate-150 transition-[translate,border-color,box-shadow] duration-300 ease-[var(--ease-soft)] hover:-translate-y-0.5 hover:border-fg/20 hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_36px_-12px_rgba(0,0,0,0.35)] sm:py-1.5 sm:pl-1.5 sm:pr-4"
      >
        <span className="grid size-10 place-items-center rounded-full bg-[#25d366] text-white transition-transform duration-300 group-hover:scale-105 sm:size-8">
          {open ? <CloseIcon className="size-[18px] sm:size-4" /> : <ChatIcon className="size-5 sm:size-[17px]" />}
        </span>
        <span className="hidden tracking-[-0.01em] sm:inline">WhatsApp</span>
      </button>
    </div>
  );
}
