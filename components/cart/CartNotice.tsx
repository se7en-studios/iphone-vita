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
      className="flex items-start gap-3 rounded-2xl bg-vita-soft p-4 text-[13px] leading-relaxed text-fg ring-1 ring-vita/20"
    >
      <span
        aria-hidden="true"
        className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-vita text-[11px] font-bold text-surface"
      >
        !
      </span>
      <p className="flex-1 text-fg/80">{notice}</p>
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
