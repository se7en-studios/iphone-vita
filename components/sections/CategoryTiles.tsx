import Link from "next/link";
import type { CategorySlug, Product } from "@/types";
import { formatUSD } from "@/lib/format";
import { ProductVisual } from "../ProductVisual";
import { SectionHead } from "../ui/SectionHead";

interface TileDef {
  label: string;
  match: (p: Product) => boolean;
  href: (items: Product[]) => string;
}

const byCategory = (label: string, slug: CategorySlug): TileDef => ({
  label,
  match: (p) => p.category === slug && p.brand === "Apple",
  href: () => `/productos?categoria=${slug}`,
});

const TILES: TileDef[] = [
  byCategory("iPhone", "iphone"),
  byCategory("Mac", "mac"),
  byCategory("iPad", "ipad"),
  byCategory("Apple Watch", "apple-watch"),
  byCategory("AirPods", "airpods"),
  byCategory("Accesorios", "accesorios"),
  {
    label: "Otras marcas",
    match: (p) => p.brand !== "Apple",
    href: (items) => {
      const sp = new URLSearchParams();
      [...new Set(items.map((p) => p.brand))].forEach((b) =>
        sp.append("marca", b),
      );
      return `/productos?${sp}`;
    },
  },
];

/** "Comprá por categoría" con el precio más bajo real de cada una. Categorías sin productos no se muestran. */
export function CategoryTiles({ products }: { products: Product[] }) {
  const tiles = TILES.flatMap((t) => {
    const items = products.filter(t.match);
    if (!items.length) return [];
    const prices = items
      .map((p) => p.price)
      .filter((x): x is number => x != null);
    const cover = items.find((p) => p.image) ?? items[0];
    return [
      {
        label: t.label,
        href: t.href(items),
        cover,
        from: prices.length ? Math.min(...prices) : null,
      },
    ];
  });
  if (!tiles.length) return null;

  return (
    <section
      id="categorias"
      className="scroll-mt-28 bg-black py-16 text-white md:py-28 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full opacity-15 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #ebd7be 0%, rgba(235,215,190,0.1) 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl space-y-10 px-4 md:space-y-12 md:px-8">
        <SectionHead
          eyebrow="Ecosistema Apple"
          title="Comprá por categoría."
          action={{ href: "/productos", label: "Ver todo el catálogo" }}
        />

        <div
          data-stagger
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6"
        >
          {tiles.map((t, index) => {
            const isFeatured = index === 0; // iPhone
            const isSecondary = index === 1; // Mac

            return (
              <div
                key={t.label}
                className={
                  isFeatured
                    ? "col-span-2 sm:col-span-2 lg:col-span-2 xl:col-span-2 row-span-1"
                    : isSecondary
                      ? "col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-2 row-span-1"
                      : "col-span-1"
                }
              >
                <Link
                  href={t.href}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#0c0c0e] ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:ring-[#ebd7be]/40 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6),0_0_24px_rgba(235,215,190,0.1)] p-4 md:p-5"
                >
                  {/* Subtle card sheen */}
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(135deg, rgba(235,215,190,0.08) 0%, transparent 60%)",
                    }}
                    aria-hidden="true"
                  />

                  {/* Header info inside card */}
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div>
                      {isFeatured && (
                        <span className="inline-block mb-1.5 rounded-full bg-[#ebd7be]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ebd7be] ring-1 ring-[#ebd7be]/30">
                          Más buscado
                        </span>
                      )}
                      <h3
                        className={`font-bold tracking-tight text-white transition group-hover:text-[#ebd7be] ${
                          isFeatured ? "text-xl md:text-2xl" : "text-base md:text-lg"
                        }`}
                      >
                        {t.label}
                      </h3>
                      <p className="tabular mt-0.5 text-xs text-white/55 font-medium">
                        {t.from != null
                          ? `Desde ${formatUSD(t.from)}`
                          : "Consultar precio"}
                      </p>
                    </div>

                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/40 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-[#ebd7be] group-hover:text-black group-hover:scale-105">
                      <svg
                        className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Product Visual */}
                  <div className="relative z-10 mt-3 flex items-center justify-center overflow-hidden">
                    <ProductVisual
                      product={t.cover}
                      className={`w-full transition-transform duration-500 group-hover:scale-105 ${
                        isFeatured
                          ? "aspect-[16/10] max-h-48"
                          : isSecondary
                            ? "aspect-[16/10] max-h-48"
                            : "aspect-square max-h-36"
                      }`}
                      sizes={
                        isFeatured
                          ? "(max-width: 768px) 100vw, 400px"
                          : "(max-width: 640px) 50vw, 220px"
                      }
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
