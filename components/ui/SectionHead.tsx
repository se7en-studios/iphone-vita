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
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div className="space-y-2">
        <p className="text-base font-semibold text-vita md:text-lg">
          {eyebrow}
        </p>
        <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center py-2 text-base text-vita hover:underline"
        >
          {action.label} ›
        </Link>
      )}
    </div>
  );
}
