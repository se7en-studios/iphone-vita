"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { CloseIcon, ChatIcon } from "../ui/Icons";
import { formatUSD } from "@/lib/format";
import { cartMessage, waLink } from "@/lib/whatsapp";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, count } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label="Carrito"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[var(--ease-soft)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="text-lg font-semibold tracking-tight">Tu carrito <span className="tabular text-muted">({count})</span></p>
          <button type="button" aria-label="Cerrar carrito" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-mist"><CloseIcon /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length ? (
            <CartLines />
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div className="space-y-3">
                <p className="text-lg font-medium">Todavía no agregaste nada.</p>
                <p className="text-sm text-muted">Los productos con precio a consultar se piden directo por WhatsApp.</p>
                <Link href="/productos" onClick={() => setOpen(false)} className="inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white">Ver productos</Link>
              </div>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="space-y-4 border-t border-line px-6 py-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="tabular text-xl font-semibold">{formatUSD(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">Confirmamos stock, forma de pago y entrega por WhatsApp antes de cobrar.</p>
            <a href={waLink(cartMessage(lines))} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-white transition hover:bg-ink-3">
              <ChatIcon className="size-4" /> Finalizar compra por WhatsApp
            </a>
            <button type="button" onClick={() => setOpen(false)} className="w-full rounded-full border border-line py-3 text-sm font-medium hover:border-ink">
              Seguir comprando
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
