import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatUSD } from "@/lib/format";

/** Hero estilo Apple: texto centrado sobre negro y el producto debajo. */
export function Hero({ product }: { product: Product }) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-black pb-20 pt-16 text-center text-white md:pb-28 md:pt-24"
    >
      <div className="mx-auto max-w-[980px] px-4 md:px-8">
        <p className="text-xl font-semibold text-white/80 md:text-2xl">
          {product.name}
        </p>
        <h1 className="mt-3 text-[clamp(3.5rem,9vw,8rem)] font-bold leading-[0.95] tracking-[-0.04em]">
          El Pro, <span className="text-[#ebd7be]">sellado.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-white/60 md:text-xl">
          Nuevo, con garantía oficial Apple y funda y templado de regalo.
          Aceptamos pesos y enviamos a todo el país.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link
            href={`/producto/${product.slug}`}
            className="rounded-full bg-[#ebd7be] px-7 py-3 text-sm font-semibold text-black transition hover:bg-white"
          >
            Comprar
          </Link>
          <Link
            href="#destacados"
            className="text-base text-[#ebd7be] transition hover:underline"
          >
            Ver destacados ›
          </Link>
        </div>
        {product.price != null && (
          <p className="tabular mt-5 text-sm text-white/50">
            Desde {formatUSD(product.price)}
          </p>
        )}
      </div>

      <div className="mx-auto mt-14 w-[calc(100%-2rem)] max-w-[980px] overflow-hidden rounded-[28px] bg-[#1d1d1f] px-6 pt-10 md:mt-20 md:w-[calc(100%-4rem)] md:px-10 md:pt-16">
        {/* La foto trae fondo #1d1d1f: la tarjeta usa el mismo gris para que no se vea el borde. */}
        <div className="relative mx-auto aspect-[705/656] w-full max-w-[705px]">
          <Image
            src="/images/highlights/siri-ai-hero.jpg"
            alt={`${product.name} en tres colores con Apple Intelligence en pantalla`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 705px"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
