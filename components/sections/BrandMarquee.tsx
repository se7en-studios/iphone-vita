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
      className="marquee border-y border-fg/[0.08] bg-bg py-6 text-fg md:py-8"
      /* Desvanecido más largo que el global: las marcas entran y salen sin corte visible. */
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
      }}
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
              className="flex items-center gap-8 rounded-full px-4 text-xl font-semibold tracking-[-0.025em] text-fg/35 transition-colors duration-300 hover:text-fg md:gap-12 md:px-6 md:text-[1.75rem]"
            >
              {b}
              <span aria-hidden className="size-1 rounded-full bg-vita/40" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
