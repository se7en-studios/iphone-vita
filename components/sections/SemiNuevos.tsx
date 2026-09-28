import Link from "next/link";
import type { Product } from "@/types";
import { priceLabel } from "@/lib/format";
import { Ars } from "../StoreSettings";
import { ProductVisual } from "../ProductVisual";
import { SectionHead } from "../ui/SectionHead";

const MAX_ITEMS = 8;

/** Semi nuevos: el gancho de precio. Cada uno es una unidad única, con batería y precio a la vista. */
export function SemiNuevos({ items }: { items: Product[] }) {
  if (!items.length) return null;
  const shown = items.slice(0, MAX_ITEMS);
  return (
    <section
      id="semi-nuevos"
      className="scroll-mt-28 border-t border-white/10 bg-black py-14 text-white md:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:space-y-10 md:px-8">
        <SectionHead
          eyebrow="Semi nuevos"
          title={
            <>
              Llegá a un Pro.{" "}
              <span className="text-white/50">
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
      className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface ring-1 ring-fg/10 transition duration-500 hover:-translate-y-1 hover:ring-accent/40"
    >
      <ProductVisual
        product={p}
        className="aspect-square"
        sizes="(max-width: 640px) 62vw, 25vw"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-semibold leading-snug">{p.name}</h3>
          <p className="mt-0.5 text-xs text-white/55">
            {[p.storage, p.color].filter(Boolean).join(" · ")}
          </p>
        </div>
        {p.batteryHealth != null && <Battery value={p.batteryHealth} />}
        <p className="tabular mt-auto border-t border-white/10 pt-3 text-[15px] font-semibold text-champagne">
          {priceLabel(p)}
          {p.price != null && (
            <span className="ml-1.5 text-xs font-normal text-white/50">
              ≈ <Ars usd={p.price} />
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

function Battery({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/70">
      <span
        className="relative h-2.5 w-6 rounded-[3px] ring-1 ring-white/40"
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0.5 left-0.5 rounded-[1px] bg-[#34c759]"
          style={{ width: `calc(${value}% - 4px)` }}
        />
      </span>
      <span>
        Batería{" "}
        <span className="tabular font-semibold text-white">{value}%</span>
      </span>
    </div>
  );
}
