"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { formatUSD } from "@/lib/format";
import { cartMessage, waLink } from "@/lib/whatsapp";
import { ChatIcon } from "../ui/Icons";

export function CartPageView() {
  const { lines, subtotal, count } = useCart();
  return (
    <div className="bg-[#050b18] text-white min-h-[85vh]">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-12 md:px-8 md:pt-16">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ebd7be]">Bolsa de compras</p>
          <h1 className="font-serif-luxury text-[clamp(2.2rem,5vw,3.8rem)] font-bold uppercase tracking-wide text-white">Tu Carrito.</h1>
        </div>
        {lines.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-[#091224] p-10 text-center max-w-xl mx-auto space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/5 border border-white/10 text-3xl">🛍️</div>
            <p className="font-serif-luxury text-xl font-bold text-white">Todavía no agregaste productos.</p>
            <p className="text-sm text-white/50">Los equipos sellados o semi nuevos también pueden cotizarse y reservarse directo por WhatsApp.</p>
            <Link href="/productos" className="mt-4 inline-block rounded-full bg-[#ebd7be] px-8 py-3 text-sm font-bold text-[#050b18] hover:bg-[#f7ede0] transition shadow-lg shadow-[#ebd7be]/10">Ver productos</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
            <div className="rounded-3xl border border-white/10 bg-[#091224]/60 p-6 backdrop-blur">
              <CartLines />
            </div>
            <aside className="h-fit space-y-6 rounded-3xl border border-white/10 bg-[#091224] p-7 lg:sticky lg:top-24">
              <div className="flex justify-between text-sm text-white/50"><span>Productos seleccionados</span><span className="tabular text-white font-medium">{count}</span></div>
              <div className="space-y-1 border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-white/70">Subtotal</span>
                  <span className="tabular font-serif-luxury text-2xl font-bold text-[#ebd7be]">{formatUSD(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>En pesos (aprox.)</span>
                  <span className="tabular font-medium text-white/70">~ $ {(subtotal * 1380).toLocaleString("es-AR")} ARS</span>
                </div>
              </div>
              <div className="rounded-2xl border border-[#ebd7be]/20 bg-[#ebd7be]/10 p-3.5 text-xs text-[#ebd7be] space-y-1">
                <p className="font-bold">✨ Beneficios incluidos en tu pedido:</p>
                <p className="text-white/70">• Funda + Vidrio Templado de regalo con iPhones nuevos</p>
                <p className="text-white/70">• Pago en Dólares, Pesos (cambio del día) o USDT</p>
                <p className="text-white/70">• Envíos asegurados o retiro presencial</p>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Al hacer clic te abrimos WhatsApp con el detalle completo de tu pedido para coordinar stock, entrega y pago.
              </p>
              <a href={waLink(cartMessage(lines))} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ebd7be] py-4 text-sm font-bold text-[#050b18] transition hover:bg-[#f7ede0] shadow-xl shadow-[#ebd7be]/15">
                <ChatIcon className="size-4" /> Finalizar compra por WhatsApp
              </a>
              <Link href="/productos" className="block w-full rounded-full border border-white/15 py-3 text-center text-xs font-semibold text-white/70 hover:border-white/40 hover:text-white transition">Seguir comprando</Link>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
