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
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
      <h1 className="text-[clamp(2.4rem,5.6vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.05em]">Tu carrito.</h1>
      {lines.length === 0 ? (
        <div className="mt-10 rounded-[32px] bg-mist p-10">
          <p className="text-lg font-medium">Todavía no agregaste productos.</p>
          <p className="mt-1 text-muted">Los equipos con precio a consultar, como los semi nuevos, se piden directo por WhatsApp.</p>
          <Link href="/productos" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">Ver productos</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <CartLines />
          <aside className="h-fit space-y-5 rounded-[32px] bg-mist p-7 lg:sticky lg:top-24">
            <div className="flex justify-between text-sm text-muted"><span>Productos</span><span className="tabular">{count}</span></div>
            <div className="flex items-baseline justify-between border-t border-line pt-5">
              <span className="font-medium">Subtotal</span>
              <span className="tabular text-2xl font-semibold">{formatUSD(subtotal)}</span>
            </div>
            <p className="text-sm text-muted">Al finalizar te abrimos WhatsApp con el pedido escrito. Confirmamos stock, forma de pago y entrega antes de cobrar.</p>
            <a href={waLink(cartMessage(lines))} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-white transition hover:bg-ink-3">
              <ChatIcon className="size-4" /> Finalizar compra
            </a>
            <Link href="/productos" className="block w-full rounded-full border border-line py-3 text-center text-sm font-medium hover:border-ink">Seguir comprando</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
