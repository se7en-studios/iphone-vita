"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { BagIcon, CloseIcon, ChatIcon } from "../ui/Icons";
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
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label="Carrito"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#0a0a0a] text-white border-l border-white/10 shadow-2xl transition-transform duration-500 ease-[var(--ease-soft)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <p className="text-lg font-bold">Tu carrito <span className="tabular font-sans text-xs text-[#ebd7be]">({count})</span></p>
          <button type="button" aria-label="Cerrar carrito" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition"><CloseIcon /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length ? (
            <CartLines />
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div className="space-y-4">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/5 border border-white/10 text-white/60"><BagIcon className="size-7" /></div>
                <p className="text-lg font-medium text-white">Todavía no agregaste nada.</p>
                <p className="text-sm text-white/50 max-w-xs mx-auto">Los productos con precio a consultar o semi nuevos se piden directo por WhatsApp.</p>
                <Link href="/productos" onClick={() => setOpen(false)} className="inline-block rounded-full bg-[#ebd7be] px-6 py-2.5 text-sm font-semibold text-black hover:bg-white transition">Explorar catálogo</Link>
              </div>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="space-y-4 border-t border-white/10 bg-black/80 p-6 backdrop-blur">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white/60">Subtotal</span>
                <span className="tabular text-2xl font-bold text-[#ebd7be]">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>En pesos (aprox.)</span>
                <span className="tabular font-medium text-white/70">~ $ {(subtotal * 1380).toLocaleString("es-AR")} ARS</span>
              </div>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Confirmamos stock, número de serie, medios de pago (efectivo, transferencia o USDT) y entrega antes de cobrar.
            </p>
            <a href={waLink(cartMessage(lines))} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ebd7be] py-3.5 text-sm font-bold text-black transition hover:bg-white">
              <ChatIcon className="size-4" /> Finalizar compra por WhatsApp
            </a>
            <button type="button" onClick={() => setOpen(false)} className="w-full rounded-full border border-white/15 py-2.5 text-xs font-medium text-white/70 hover:border-white/40 hover:text-white transition">
              Seguir explorando
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
