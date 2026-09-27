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
      className="scroll-mt-28 bg-black py-14 text-white md:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:space-y-10 md:px-8">
        <SectionHead
          eyebrow="Tienda"
          title="Comprá por categoría."
          action={{ href: "/productos", label: "Ver todo" }}
        />
        <ul
          data-stagger
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4 lg:grid-cols-7"
        >
          {tiles.map((t) => (
            <li key={t.label}>
              <Link
                href={t.href}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface ring-1 ring-fg/10 transition duration-500 hover:-translate-y-1 hover:ring-accent/40"
              >
                <ProductVisual
                  product={t.cover}
                  className="aspect-[4/3] lg:aspect-square"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
                <span className="flex flex-1 flex-col p-3.5 pt-2">
                  <span className="text-[15px] font-semibold leading-snug">
                    {t.label}
                  </span>
                  <span className="tabular mt-0.5 text-xs text-white/55">
                    {t.from != null
                      ? `Desde ${formatUSD(t.from)}`
                      : "Consultá precio"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
