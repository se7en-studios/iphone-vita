import Link from "next/link";
import type { Product } from "@/types";
import { canBuy, isOutOfStock } from "@/lib/format";
import { CheckIcon } from "../ui/Icons";

/* Solo datos que la tienda ya publica (anuncios, carrito, garantías de la ficha). */
function includedItems(p: Product): string[] {
  const items: string[] = [];
  if (p.condition === "nuevo") {
    items.push(
      p.brand === "Apple"
        ? "Equipo nuevo, sellado de fábrica"
        : "Producto nuevo",
    );
    if (p.brand === "Apple") items.push("Garantía oficial Apple de 1 año");
    if (p.category === "iphone")
      items.push("Funda de silicona y vidrio templado de regalo, instalados");
  } else {
    if (p.batteryHealth != null) items.push(`Batería al ${p.batteryHealth}%`);
    items.push("Revisado punto por punto, listo para usar");
    items.push("Garantía iPhone Vita de 90 días");
  }
  items.push("Envío asegurado a todo el país o retiro coordinado");
  return items;
}

function firstStep(p: Product): string {
  if (isOutOfStock(p))
    return "Tocá “Avisame cuando llegue” y te escribimos apenas entre.";
  if (canBuy(p)) return "Agregalo al carrito (podés sumar más productos).";
  return "Tocá “Consultar por WhatsApp” y te pasamos el precio.";
}

/** Qué incluye y cómo se compra: lo que un comprador necesita saber antes de escribir. */
export function ProductInfo({ product: p }: { product: Product }) {
  const steps = [
    firstStep(p),
    "Te abrimos WhatsApp con el detalle del pedido y el precio en pesos del día.",
    "Confirmamos stock, número de serie, medio de pago (efectivo, transferencia o USDT) y entrega antes de cobrar.",
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <section className="rounded-[24px] bg-surface p-5 ring-1 ring-fg/[0.08] md:p-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em]">Qué incluye</h2>
        <ul className="mt-4 space-y-3">
          {includedItems(p).map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-snug text-fg/70">
              <CheckIcon className="mt-px size-4 shrink-0 text-vita" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          href="/#plan-canje"
          className="group/canje mt-5 inline-block rounded py-1 text-sm font-medium text-vita underline-offset-4 hover:underline"
        >
          Entregá tu iPhone usado como parte de pago
          <span
            aria-hidden="true"
            className="ml-1 inline-block transition-transform duration-300 group-hover/canje:translate-x-0.5"
          >
            ›
          </span>
        </Link>
      </section>
      <section className="rounded-[24px] bg-surface p-5 ring-1 ring-fg/[0.08] md:p-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em]">Cómo comprás</h2>
        <ol className="mt-4 space-y-3.5">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm leading-snug text-fg/70">
              <span className="tabular grid size-5 shrink-0 place-items-center rounded-full bg-vita-soft text-[11px] font-semibold text-vita">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
