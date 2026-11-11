"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { CartNotice } from "./CartNotice";
import { useStoreSettings } from "../StoreSettings";
import { formatARS, formatUSD } from "@/lib/format";
import { cartMessage, waLink } from "@/lib/whatsapp";
import {
  ArrowIcon,
  BagIcon,
  CashIcon,
  ChatIcon,
  GiftIcon,
  ShieldIcon,
  TruckIcon,
} from "../ui/Icons";

/** Accesos rápidos del carrito vacío: los mismos destinos que la navbar. */
const SHORTCUTS = [
  { label: "iPhone", href: "/productos?categoria=iphone&condicion=nuevo" },
  { label: "Semi nuevos", href: "/productos?condicion=semi-nuevo" },
  { label: "Mac", href: "/productos?categoria=mac" },
  { label: "iPad", href: "/productos?categoria=ipad" },
  { label: "AirPods", href: "/productos?categoria=airpods" },
  { label: "Accesorios", href: "/productos?categoria=accesorios" },
];

/** Estado vacío compartido por el drawer y /carrito. `onNavigate` cierra el drawer. */
export function CartEmpty({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`text-center ${compact ? "py-10" : "py-4"}`}>
      <span
        aria-hidden="true"
        className="mx-auto grid size-[72px] place-items-center rounded-full bg-[linear-gradient(160deg,var(--color-champagne-light),var(--color-champagne))] text-fg shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]"
      >
        <BagIcon className="size-7" />
      </span>
      <p
        className={`mt-6 font-semibold tracking-[-0.025em] text-fg ${
          compact ? "text-2xl" : "text-[28px] md:text-[34px]"
        }`}
      >
        Tu carrito está vacío.
      </p>
      <p className="mx-auto mt-2.5 max-w-[34ch] text-[15px] leading-relaxed text-fg/60">
        Elegí tu próximo equipo. Los semi nuevos y los precios a consultar se
        piden directo por WhatsApp.
      </p>
      <div className="mt-7 flex flex-col items-center gap-3">
        <Link
          href="/productos"
          onClick={onNavigate}
          className="sheen inline-flex h-12 items-center gap-2 rounded-full bg-fg px-7 text-[15px] font-semibold text-surface shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] transition-colors hover:bg-fg/90"
        >
          Ver productos <ArrowIcon className="size-4" />
        </Link>
        <Link
          href="/encontra-tu-iphone"
          onClick={onNavigate}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-link transition hover:underline hover:underline-offset-4"
        >
          ¿No sabés cuál elegir? Hacé el test
        </Link>
      </div>
      <nav aria-label="Categorías" className="mt-8 border-t border-fg/[0.08] pt-6">
        <p className="text-xs font-medium text-fg/45">Explorá por categoría</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {SHORTCUTS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                onClick={onNavigate}
                className="inline-flex h-9 items-center rounded-full bg-surface px-4 text-[13px] font-medium text-fg/80 ring-1 ring-fg/10 transition hover:text-fg hover:ring-fg/25"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** Totales en USD y pesos de referencia. */
export function CartTotals({ subtotal, arsRate }: { subtotal: number; arsRate: number }) {
  return (
    <dl className="space-y-2.5 text-[15px]">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-fg/60">Subtotal</dt>
        <dd className="tabular font-medium text-fg">{formatUSD(subtotal)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-fg/60">Envío</dt>
        <dd className="text-fg/60">A coordinar</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t border-fg/[0.08] pt-4">
        <dt className="font-semibold text-fg">Total</dt>
        <dd className="tabular text-2xl font-semibold tracking-[-0.02em] text-fg">
          {formatUSD(subtotal)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 text-[13px]">
        <dt className="text-fg/50">En pesos, aprox.</dt>
        <dd className="tabular text-fg/60">{formatARS(subtotal, arsRate)}</dd>
      </div>
    </dl>
  );
}

/** Botón principal: abre WhatsApp con el pedido armado. */
export function CheckoutButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="sheen flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-fg text-[15px] font-semibold text-surface shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] transition-colors duration-300 hover:bg-fg/90"
    >
      <ChatIcon className="size-5" /> Finalizar compra por WhatsApp
    </a>
  );
}

const PERKS = [
  { Icon: GiftIcon, text: "Funda y templado de regalo con iPhone nuevos" },
  { Icon: CashIcon, text: "Dólares, pesos al cambio del día o USDT" },
  { Icon: TruckIcon, text: "Envío asegurado o retiro presencial" },
  { Icon: ShieldIcon, text: "Garantía oficial Apple en equipos sellados" },
];

export function CartPageView() {
  const { lines, subtotal, count } = useCart();
  const { arsRate } = useStoreSettings();
  const empty = lines.length === 0;
  return (
    <div className="min-h-[85vh] bg-bg text-fg">
      <section className="mx-auto max-w-[1200px] px-4 pb-24 pt-12 md:px-8 md:pt-20">
        <header className={empty ? "text-center" : ""}>
          <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
            Bolsa
          </p>
          <h1 className="mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.035em] text-fg">
            {empty ? "Tu carrito." : "Revisá tu pedido."}
          </h1>
          {!empty && (
            <p className="mt-3 text-[17px] text-fg/60">
              <span className="tabular">{count}</span>{" "}
              {count === 1 ? "producto" : "productos"} · {formatUSD(subtotal)}
            </p>
          )}
        </header>

        <div className={`mt-8 max-w-xl empty:hidden ${empty ? "mx-auto" : ""}`}>
          <CartNotice />
        </div>

        {empty ? (
          <div className="mx-auto mt-10 max-w-xl rounded-[28px] bg-surface px-6 py-12 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.06] md:px-12 md:py-14">
            <CartEmpty />
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-6 md:mt-12 lg:grid-cols-[1fr_380px] lg:gap-10">
            <div className="rounded-[28px] bg-surface px-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.06] md:px-8">
              <CartLines size="lg" />
            </div>

            <aside
              aria-label="Resumen del pedido"
              className="space-y-6 rounded-[28px] bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.06] md:p-8 lg:sticky lg:top-24"
            >
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Resumen</h2>
              <CartTotals subtotal={subtotal} arsRate={arsRate} />
              <div className="space-y-3">
                <CheckoutButton href={waLink(cartMessage(lines, arsRate))} />
                <p className="text-center text-xs leading-relaxed text-fg/50">
                  Te abrimos WhatsApp con el pedido armado. Confirmamos stock,
                  entrega y pago antes de cobrar.
                </p>
              </div>
              <ul className="space-y-3 border-t border-fg/[0.08] pt-6">
                {PERKS.map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-[13px] text-fg/70">
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-vita-soft text-vita"
                    >
                      <Icon className="size-4" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
              <Link
                href="/productos"
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-link transition hover:underline hover:underline-offset-4"
              >
                Seguir comprando <ArrowIcon className="size-3.5" />
              </Link>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
