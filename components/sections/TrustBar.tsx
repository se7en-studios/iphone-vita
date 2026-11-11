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
      className="scroll-mt-28 border-y border-fg/[0.08] bg-surface/60 text-fg"
    >
      <ul
        data-stagger
        className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-7 px-4 py-8 md:grid-cols-4 md:gap-x-0 md:px-8 md:py-9"
      >
        {POINTS.map((p, i) => {
          const inner = (
            <>
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vita-soft text-vita ring-1 ring-inset ring-vita/15 transition-colors duration-300"
              >
                {p.icon}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em]">
                  {p.title}
                  {p.href && (
                    <span
                      aria-hidden
                      className="text-vita transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                    >
                      ›
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[0.8125rem] leading-snug text-fg/55">
                  {p.body}
                </span>
              </span>
            </>
          );
          const layout = `flex flex-col gap-3 md:flex-row md:items-center md:gap-3.5 ${
            i > 0 ? "md:px-6 lg:px-8" : "md:pr-6 lg:pr-8"
          }`;
          return (
            <li
              key={p.title}
              className={i > 0 ? "md:border-l md:border-fg/[0.08]" : undefined}
            >
              {p.href ? (
                <Link
                  href={p.href}
                  className={`group rounded-2xl ${layout} transition-colors hover:text-vita`}
                >
                  {inner}
                </Link>
              ) : (
                <div className={layout}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
