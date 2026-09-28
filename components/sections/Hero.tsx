import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ModelGroup } from "@/lib/products";
import { formatUSD } from "@/lib/format";
import { Ars } from "../StoreSettings";
import { ProductVisual } from "../ProductVisual";

const d = (i: number) => ({ "--d": i }) as CSSProperties;

/** Fotos de campaña por modelo. El resto usa la foto de catálogo del producto. */
const HERO_ART: Record<string, { src: string; alt: string }> = {
  "iphone-18-pro": {
    src: "/images/highlights/siri-ai-hero.jpg",
    alt: "iPhone 18 Pro en tres colores con Apple Intelligence en pantalla",
  },
};

function pitch(g: ModelGroup): string {
  const sealed =
    g.brand === "Apple"
      ? "Nuevo, sellado y con garantía oficial Apple"
      : "Nuevo y sellado";
  const gift =
    g.category === "iphone" ? ", con funda y templado de regalo" : "";
  return `${sealed}${gift}. Aceptamos pesos y enviamos a todo el país.`;
}

/**
 * Hero estilo Apple sobre negro, pero que vende: qué es, cuánto sale (USD y pesos) y un
 * botón para comprarlo. El producto sale del destacado del admin; sin catálogo, queda genérico.
 */
export function Hero({ group }: { group?: ModelGroup }) {
  const lead = group?.variants.find((v) => v.image) ?? group?.variants[0];
  const art = group ? HERO_ART[group.model] : undefined;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-black pb-14 pt-14 text-center text-white md:pb-24 md:pt-24"
    >
      <div className="intro mx-auto max-w-[980px] px-4 md:px-8">
        <p
          style={d(0)}
          className="text-base font-semibold text-[#ebd7be] md:text-lg"
        >
          iPhone, Mac, iPad y más · nuevos y semi nuevos
        </p>
        <h1
          style={d(1)}
          className="mt-3 text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.95] tracking-[-0.04em]"
        >
          {group ? group.name : "Tu próxima tecnología."}
        </h1>
        <p
          style={d(2)}
          className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-white/60 md:text-xl"
        >
          {group
            ? pitch(group)
            : "Equipos sellados con garantía oficial y semi nuevos revisados. Aceptamos pesos y enviamos a todo el país."}
        </p>
        {group?.fromPrice != null && (
          <p style={d(3)} className="tabular mt-5 text-lg text-white">
            Desde {formatUSD(group.fromPrice)}
            <span className="ml-2 text-sm text-white/50">
              ≈ <Ars usd={group.fromPrice} />
            </span>
          </p>
        )}
        <div
          style={d(4)}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          <Link
            href={lead ? `/producto/${lead.slug}` : "/productos"}
            className="rounded-full bg-[#ebd7be] px-8 py-3.5 text-base font-semibold text-black transition hover:bg-white"
          >
            {lead ? "Comprar" : "Ver productos"}
          </Link>
          <Link
            href="/productos"
            className="py-2 text-base text-[#ebd7be] transition hover:underline"
          >
            Ver todo el catálogo ›
          </Link>
        </div>
      </div>

      {lead && (
        <div className="mx-auto mt-12 w-[calc(100%-2rem)] max-w-[980px] overflow-hidden rounded-[28px] bg-[#1d1d1f] px-6 pt-8 md:mt-16 md:w-[calc(100%-4rem)] md:px-10 md:pt-14">
          {/* La foto de campaña trae fondo #1d1d1f: la tarjeta usa el mismo gris para que no se vea el borde. */}
          <div className="intro-media relative mx-auto aspect-[705/656] w-full max-w-[705px]">
            {art ? (
              <Image
                src={art.src}
                alt={art.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 705px"
                className="object-contain object-bottom"
              />
            ) : (
              <ProductVisual
                product={lead}
                priority
                className="size-full !bg-none"
                sizes="(max-width: 768px) 100vw, 705px"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
