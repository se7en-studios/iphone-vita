import Link from "next/link";
import type { Product } from "@/types";
import { ProductVisual } from "../ProductVisual";

interface Tile {
  label: string;
  product: Product;
  className: string;
}

/** Bento oscuro: todo lo que vende la tienda además del iPhone. */
export function TechSetup({ tiles }: { tiles: { label: string; product?: Product }[] }) {
  const layout = [
    "col-span-2 row-span-2", // iPhone
    "col-span-2", // MacBook
    "", // iPad
    "", // Apple Watch
    "", // AirPods
    "md:col-span-2", // JBL
    "", // DJI
    "md:col-span-2", // Anker
    "col-span-2", // PS5
  ];
  const list: Tile[] = tiles
    .map((t, i) => (t.product ? { label: t.label, product: t.product, className: layout[i] ?? "" } : null))
    .filter((t): t is Tile => !!t);

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div data-reveal className="mb-14 max-w-3xl space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Tech setup</p>
          <h2 className="text-[clamp(2.6rem,6.4vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
            Todo tu setup.
            <br />
            <span className="text-white/45">Un solo lugar.</span>
          </h2>
          <p className="max-w-lg text-lg text-white/60">No sólo iPhone: Mac, iPad, Apple Watch, audio, gaming y creators, con la misma atención.</p>
        </div>
        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-4">
          {list.map((t) => (
            <Link key={t.label} href={`/producto/${t.product.slug}`} data-reveal className={`group relative overflow-hidden rounded-[28px] ring-1 ring-line-dark ${t.className}`}>
              <div className="absolute inset-0">
                <ProductVisual product={t.product} tone="dark" className="size-full" sizes="(max-width: 768px) 50vw, 50vw" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                <p className="text-[15px] font-semibold">{t.label}</p>
                <p className="text-xs text-white/55">{t.product.brand}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
