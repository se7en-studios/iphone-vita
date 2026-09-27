"use client";

import { useCart } from "./CartProvider";
import { CloseIcon } from "../ui/Icons";

/** Aviso cuando sacamos del carrito algo que se ocultó, se borró o se quedó sin stock. */
export function CartNotice() {
  const { notice, dismissNotice } = useCart();
  if (!notice) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl bg-amber-400/10 p-3.5 text-xs leading-relaxed text-fg ring-1 ring-amber-500/30"
    >
      <p className="flex-1">{notice}</p>
      <button
        type="button"
        onClick={dismissNotice}
        aria-label="Cerrar aviso"
        className="-m-1.5 grid size-8 shrink-0 place-items-center rounded-full text-fg/60 transition hover:bg-fg/10 hover:text-fg"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
