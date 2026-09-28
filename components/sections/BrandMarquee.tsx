import Link from "next/link";
import type { Product } from "@/types";

const MIN_BRANDS = 3;
/* ~12 marcas por mitad cubren un monitor de 2560px. */
const MIN_PER_HALF = 12;

/** Cinta infinita con las marcas reales del catálogo. Se frena al pasar el mouse. */
export function BrandMarquee({ products }: { products: Product[] }) {
  const brands = [...new Set(products.map((p) => p.brand))];
  if (brands.length < MIN_BRANDS) return null;
  // Cada mitad repite las marcas hasta llenar pantallas anchas; dos mitades iguales
  // hacen que al llegar a -50% la cinta vuelva al inicio sin salto.
  const half = Array.from(
    { length: Math.ceil(MIN_PER_HALF / brands.length) },
    () => brands,
  ).flat();
  const loop = [...half, ...half];
  return (
    <section
      aria-label="Marcas disponibles"
      className="marquee border-y border-white/10 bg-black py-7 text-white md:py-9"
    >
      <ul
        className="marquee-track flex w-max items-center"
        style={{ animationDuration: `${half.length * 3}s` }}
      >
        {loop.map((b, i) => (
          <li key={`${b}-${i}`} aria-hidden={i >= brands.length || undefined}>
            <Link
              href={`/productos?marca=${encodeURIComponent(b)}`}
              tabIndex={i >= brands.length ? -1 : undefined}
              className="flex items-center gap-10 px-5 text-2xl font-bold tracking-[-0.03em] text-white/35 transition-colors hover:text-champagne md:gap-14 md:px-7 md:text-4xl"
            >
              {b}
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-champagne/50"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
