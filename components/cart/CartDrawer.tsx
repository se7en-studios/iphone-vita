"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { CartLines } from "./CartLines";
import { CartNotice } from "./CartNotice";
import { CartEmpty, CartTotals, CheckoutButton } from "./CartPageView";
import { useStoreSettings } from "../StoreSettings";
import { ArrowIcon, CloseIcon } from "../ui/Icons";
import { cartMessage, waLink } from "@/lib/whatsapp";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, count } = useCart();
  const { arsRate } = useStoreSettings();
  const panelRef = useRef<HTMLElement>(null);
  const close = () => setOpen(false);

  // Escape cierra, Tab queda atrapado dentro del panel y el scroll de la página se bloquea.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    // Esperamos a que se quite `inert` antes de mover el foco.
    const id = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Devolvemos el foco a quien abrió el carrito (el ícono de la bolsa o "Agregar").
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [open, setOpen]);

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/25 backdrop-blur-[6px] transition-opacity duration-500 ease-[var(--ease-soft)] motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col outline-none bg-surface text-fg shadow-[-24px_0_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-fg/[0.06] transition-transform duration-[600ms] ease-[var(--ease-sheet)] motion-reduce:transition-none sm:inset-y-2 sm:right-2 sm:rounded-[28px] ${
          open ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
        }`}
      >
        <header className="flex items-center justify-between px-6 pb-4 pt-6">
          <div>
            <h2
              id="cart-drawer-title"
              className="text-[22px] font-semibold tracking-[-0.025em] text-fg"
            >
              Tu carrito
            </h2>
            {lines.length > 0 && (
              <p className="mt-0.5 text-[13px] text-fg/50">
                <span className="tabular">{count}</span>{" "}
                {count === 1 ? "producto" : "productos"}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={close}
            className="grid size-9 place-items-center rounded-full bg-fg/[0.05] text-fg/70 transition hover:bg-fg/10 hover:text-fg"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain border-t border-fg/[0.08] px-6">
          <div className="pt-4 empty:hidden">
            <CartNotice />
          </div>
          {lines.length ? (
            <CartLines />
          ) : (
            <div className="my-auto">
              <CartEmpty compact onNavigate={close} />
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="space-y-4 border-t border-fg/[0.08] bg-bg/60 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:rounded-b-[28px]">
            <CartTotals subtotal={subtotal} arsRate={arsRate} />
            <CheckoutButton href={waLink(cartMessage(lines, arsRate))} />
            <p className="text-center text-xs leading-relaxed text-fg/50">
              Confirmamos stock, entrega y pago (efectivo, transferencia o USDT)
              antes de cobrar.
            </p>
            <div className="flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={close}
                className="rounded-full px-1 py-1 font-medium text-fg/60 transition hover:text-fg"
              >
                Seguir explorando
              </button>
              <Link
                href="/carrito"
                onClick={close}
                className="inline-flex items-center gap-1 rounded-full px-1 py-1 font-medium text-link transition hover:underline hover:underline-offset-4"
              >
                Ver carrito <ArrowIcon className="size-3.5" />
              </Link>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
