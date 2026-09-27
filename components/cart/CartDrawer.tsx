"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { CartNotice } from "./CartNotice";
import { useStoreSettings } from "../StoreSettings";
import { BagIcon, CloseIcon, ChatIcon } from "../ui/Icons";
import { formatARS, formatUSD } from "@/lib/format";
import { cartMessage, waLink } from "@/lib/whatsapp";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, count } = useCart();
  const { arsRate } = useStoreSettings();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label="Carrito"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface text-fg border-l border-fg/10 shadow-2xl transition-transform duration-[600ms] ease-[var(--ease-sheet)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-fg/10 px-6 py-5">
          <p className="text-lg font-bold">Tu carrito <span className="tabular font-sans text-xs text-highlight">({count})</span></p>
          <button type="button" aria-label="Cerrar carrito" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full text-fg/70 hover:bg-fg/10 hover:text-fg transition"><CloseIcon /></button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto px-6">
          <div className="empty:hidden pt-4">
            <CartNotice />
          </div>
          {lines.length ? (
            <CartLines />
          ) : (
            <div className="grid flex-1 place-items-center py-10 text-center">
              <div className="space-y-4">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-fg/5 border border-fg/10 text-fg/60"><BagIcon className="size-7" /></div>
                <p className="text-lg font-medium text-fg">Todavía no agregaste nada.</p>
                <p className="text-sm text-fg/50 max-w-xs mx-auto">Los productos con precio a consultar o semi nuevos se piden directo por WhatsApp.</p>
                <Link href="/productos" onClick={() => setOpen(false)} className="inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg hover:brightness-110 transition">Explorar catálogo</Link>
              </div>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="space-y-4 border-t border-fg/10 bg-surface/80 p-6 backdrop-blur">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-fg/60">Subtotal</span>
                <span className="tabular text-2xl font-bold text-highlight">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-fg/40">
                <span>En pesos (aprox.)</span>
                <span className="tabular font-medium text-fg/70">~ {formatARS(subtotal, arsRate)}</span>
              </div>
            </div>
            <p className="text-[11px] text-fg/50 leading-relaxed">
              Confirmamos stock, número de serie, medios de pago (efectivo, transferencia o USDT) y entrega antes de cobrar.
            </p>
            <a href={waLink(cartMessage(lines, arsRate))} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-accent-fg transition hover:brightness-110">
              <ChatIcon className="size-4" /> Finalizar compra por WhatsApp
            </a>
            <button type="button" onClick={() => setOpen(false)} className="w-full rounded-full border border-fg/15 py-2.5 text-xs font-medium text-fg/70 hover:border-fg/40 hover:text-fg transition">
              Seguir explorando
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
