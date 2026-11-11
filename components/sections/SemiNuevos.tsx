import Link from "next/link";
import type { Product } from "@/types";
import { priceLabel } from "@/lib/format";
import { Ars } from "../StoreSettings";
import { ProductVisual } from "../ProductVisual";
import { ArrowIcon } from "../ui/Icons";
import { SectionHead } from "../ui/SectionHead";

const MAX_ITEMS = 8;

/** Semi nuevos: el gancho de precio. Cada uno es una unidad única, con batería y precio a la vista. */
export function SemiNuevos({ items }: { items: Product[] }) {
  if (!items.length) return null;
  const shown = items.slice(0, MAX_ITEMS);
  return (
    <section
      id="semi-nuevos"
      className="scroll-mt-28 border-t border-fg/10 bg-bg py-14 text-fg md:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:space-y-10 md:px-8">
        <SectionHead
          eyebrow="Semi nuevos"
          title={
            <>
              Llegá a un Pro.{" "}
              <span className="text-fg/50">
                Revisados, con batería real.
              </span>
            </>
          }
          action={{
            href: "/productos?condicion=semi-nuevo",
            label: `Ver los ${items.length}`,
          }}
        />
        <ul
          data-stagger
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4"
        >
          {shown.map((p) => (
            <li
              key={p.slug}
              className="w-[62vw] max-w-[260px] shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <SemiCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SemiCard({ product: p }: { product: Product }) {
  return (
    <Link
      href={`/producto/${p.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.08] transition duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--card-shadow)] hover:ring-champagne"
    >
      <ProductVisual
        product={p}
        className="aspect-square"
        sizes="(max-width: 640px) 62vw, (max-width: 1024px) 33vw, 25vw"
      />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-3.5 md:px-5 md:pb-5">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-tight tracking-[-0.01em]">
            {p.name}
          </h3>
          <p className="mt-1 truncate text-[13px] text-fg/55">
            {[p.storage, p.color].filter(Boolean).join(" · ")}
          </p>
        </div>
        {p.batteryHealth != null && <Battery value={p.batteryHealth} />}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-fg/[0.08] pt-3.5">
          {p.priceType === "consultar" || p.price == null ? (
            <span className="text-sm font-semibold text-vita">
              {priceLabel(p)}
            </span>
          ) : (
            <p className="tabular leading-tight">
              <span className="block text-base font-semibold text-fg">
                {priceLabel(p)}
              </span>
              <span className="text-xs text-fg/50">
                ≈ <Ars usd={p.price} />
              </span>
            </p>
          )}
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full bg-fg/[0.06] text-fg transition duration-300 group-hover:translate-x-0.5 group-hover:bg-fg group-hover:text-bg"
            aria-hidden="true"
          >
            <ArrowIcon className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Salud de batería: etiqueta y % arriba, barra fina abajo. Verde desde 80% (umbral de Apple), ámbar por debajo. */
function Battery({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-fg/60">Batería</span>
        <span className="tabular font-semibold text-fg">{pct}%</span>
      </div>
      <div
        className="mt-1.5 h-1 overflow-hidden rounded-full bg-fg/[0.08]"
        role="meter"
        aria-label="Salud de batería"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className={`h-full rounded-full ${pct >= 80 ? "bg-[#34c759]" : "bg-amber-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
