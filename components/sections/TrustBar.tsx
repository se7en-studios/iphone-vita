import Link from "next/link";
import type { ReactNode } from "react";
import { CashIcon, ShieldIcon, SwapIcon, TruckIcon } from "../ui/Icons";

/* Solo lo que la tienda ya confirma en el sitio (anuncios, ficha de producto, carrito). */
const POINTS: {
  icon: ReactNode;
  title: string;
  body: string;
  href?: string;
}[] = [
  {
    icon: <ShieldIcon className="size-5" />,
    title: "Garantía oficial Apple",
    body: "1 año en equipos sellados",
  },
  {
    icon: <TruckIcon className="size-5" />,
    title: "Envíos a todo el país",
    body: "Asegurados, o retiro coordinado",
  },
  {
    icon: <CashIcon className="size-5" />,
    title: "Pagás en pesos o dólares",
    body: "USD, USDT o pesos al cambio del día",
  },
  {
    icon: <SwapIcon className="size-5" />,
    title: "Plan Canje",
    body: "Tu iPhone usado como parte de pago",
    href: "#plan-canje",
  },
];

/** Barra de confianza pegada al hero. */
export function TrustBar() {
  return (
    <section
      id="nosotros"
      aria-label="Por qué comprar en iPhone Vita"
      className="scroll-mt-28 border-y border-white/10 bg-black text-white"
    >
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 md:grid-cols-4 md:px-8 md:py-10">
        {POINTS.map((p) => {
          const inner = (
            <>
              <span className="mt-0.5 shrink-0 text-champagne">{p.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-snug">
                  {p.title}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-white/55">
                  {p.body}
                </span>
              </span>
            </>
          );
          return (
            <li key={p.title}>
              {p.href ? (
                <Link
                  href={p.href}
                  className="flex gap-3 transition hover:opacity-80"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex gap-3">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
