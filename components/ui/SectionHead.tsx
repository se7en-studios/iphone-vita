import Link from "next/link";
import type { ReactNode } from "react";

/** Encabezado de las secciones de compra de la home (sigue el tema): eyebrow champagne, título y link opcional. */
export function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div
      data-reveal
      className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8"
    >
      <div className="space-y-2">
        <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
          {eyebrow}
        </p>
        <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.04] tracking-[-0.035em] text-balance">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group/more -my-1 inline-flex shrink-0 items-center gap-1 self-start rounded-full py-2 text-[15px] font-medium text-vita underline-offset-4 hover:underline md:self-auto md:text-base"
        >
          {action.label}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/more:translate-x-0.5"
          >
            ›
          </span>
        </Link>
      )}
    </div>
  );
}
