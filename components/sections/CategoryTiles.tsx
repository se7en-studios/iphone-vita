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
  const spanOf = tileSpans(tiles.length);

  return (
    <section
      id="categorias"
      className="scroll-mt-28 bg-bg py-14 text-fg md:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:space-y-10 md:px-8">
        <SectionHead
          eyebrow="Ecosistema Apple"
          title="Comprá por categoría."
          action={{ href: "/productos", label: "Ver todo el catálogo" }}
        />

        <div
          data-stagger
          className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-6"
        >
          {tiles.map((t, index) => {
            const isFeatured = index === 0; // iPhone
            const isLead = index < 2; // iPhone y Mac: fila principal, más alto

            return (
              <div key={t.label} className={spanOf(index)}>
                <Link
                  href={t.href}
                  className="group relative isolate flex h-full flex-col overflow-hidden rounded-[22px] bg-surface p-4 ring-1 ring-fg/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-soft)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-18px_rgba(0,0,0,0.18)] hover:ring-vita/25 motion-safe:hover:-translate-y-0.5 md:rounded-[26px] md:p-6"
                >
                  {/* Luz champagne al pie: le da cuerpo a la tarjeta y se aviva al pasar el mouse. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,var(--vita-soft),transparent_75%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Encabezado */}
                  <div className="relative">
                    <div className="min-w-0">
                      {isFeatured && (
                        <span className="mb-2 inline-block rounded-full bg-vita-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-vita ring-1 ring-inset ring-vita/20">
                          Más buscado
                        </span>
                      )}
                      <h3
                        className={`font-semibold tracking-[-0.022em] text-fg transition-colors duration-300 group-hover:text-vita ${
                          isLead
                            ? "text-[1.375rem] leading-tight md:text-[1.75rem]"
                            : "text-[1.0625rem] leading-snug md:text-xl"
                        }`}
                      >
                        {t.label}
                      </h3>
                      <p className="tabular mt-1 text-[0.8125rem] text-fg/55">
                        {t.from != null
                          ? `Desde ${formatUSD(t.from)}`
                          : "Consultar precio"}
                      </p>
                    </div>
                  </div>

                  {/* Producto: ocupa todo el alto libre, así ninguna tarjeta queda con aire muerto.
                      multiply funde el fondo blanco de las fotos con la luz de la tarjeta; sin drop-shadow,
                      que en fotos opacas dibujaba una caja. */}
                  <div className="relative mt-3 flex flex-1 items-end justify-center">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-[28%] bottom-[4%] h-4 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.09),transparent)]"
                    />
                    <ProductVisual
                      product={t.cover}
                      className={`w-full !bg-none mix-blend-multiply [&_.stage-product]:[filter:none]! ${
                        isLead ? "h-44 md:h-56 lg:h-60" : "h-32 md:h-40 lg:h-52"
                      }`}
                      sizes={
                        isLead
                          ? "(max-width: 1024px) 100vw, 420px"
                          : "(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 420px"
                      }
                    />
                  </div>

                  {/* Flecha en la esquina: el título usa todo el ancho, aun en las tarjetas angostas. */}
                  <span
                    aria-hidden
                    className={`absolute bottom-4 right-4 ${isLead ? "flex" : "hidden md:flex"} size-8 shrink-0 items-center justify-center rounded-full bg-fg/[0.04] text-fg/45 ring-1 ring-inset ring-fg/[0.08] transition-colors duration-300 group-hover:bg-champagne group-hover:text-black group-hover:ring-transparent md:bottom-5 md:right-5`}
                  >
                    <svg
                      className="size-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Tailwind necesita las clases literales. */
const LG_SPAN: Record<number, string> = {
  1: "lg:col-span-6",
  2: "lg:col-span-3",
  3: "lg:col-span-2",
};

/**
 * Bento sin huecos: iPhone y Mac anchos; en desktop la fila 1 es 2+2+1+1 (6 columnas) y
 * lo que sobra reparte la fila 2. En mobile (2 columnas) el último impar ocupa todo el ancho.
 */
function tileSpans(n: number) {
  const restLg = LG_SPAN[n - 4] ?? "";
  const oddLast = (n - 2) % 2 === 1;
  return (i: number) => {
    if (i < 2) return "col-span-2";
    const lg = i >= 4 && restLg ? restLg : "lg:col-span-1";
    return oddLast && i === n - 1 ? `col-span-2 ${lg}` : i >= 4 ? restLg : "";
  };
}
