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
      {/* ── Luz volumétrica ambiental de Titanio Natural ── */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] md:w-[1100px] md:h-[650px] rounded-full bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(235,215,190,0.14),transparent_70%)] blur-3xl opacity-80"
      />

      <div className="intro hero-copy relative z-10 mx-auto max-w-[980px] px-4 md:px-8">
        {/* Floating Luxury Badge */}
        <div style={d(0)} className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(235,215,190,0.25)] bg-[rgba(235,215,190,0.06)] px-4 py-1.5 text-xs font-semibold text-champagne backdrop-blur-xl shadow-[0_0_20px_rgba(235,215,190,0.12)]">
          <span className="size-1.5 rounded-full bg-champagne animate-pulse" />
          <span>Garantía Oficial Apple · Equipos Nuevos Sellados & Semi-nuevos</span>
        </div>

        <h1
          style={d(1)}
          className="mt-2 text-[clamp(3.2rem,9.5vw,7.8rem)] font-bold leading-[0.95] tracking-[-0.04em] bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent"
        >
          {group ? group.name : "Tu próxima tecnología."}
        </h1>

        <p
          style={d(2)}
          className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-white/65 md:text-xl font-normal"
        >
          {group
            ? pitch(group)
            : "Equipos sellados con garantía oficial y semi nuevos seleccionados. Aceptamos pesos y enviamos a todo el país."}
        </p>

        {group?.fromPrice != null && (
          <p style={d(3)} className="tabular mt-5 text-xl font-medium text-white">
            Desde <span className="text-champagne font-bold">{formatUSD(group.fromPrice)}</span>
            <span className="ml-2 text-sm text-white/50">
              ≈ <Ars usd={group.fromPrice} />
            </span>
          </p>
        )}

        <div
          style={d(4)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3.5"
        >
          <Link
            href={lead ? `/producto/${lead.slug}` : "/productos"}
            className="sheen rounded-full bg-champagne px-8 py-3.5 text-base font-bold text-black transition duration-300 hover:bg-champagne-light hover:scale-105 shadow-[0_0_25px_rgba(235,215,190,0.3)] hover:shadow-[0_0_35px_rgba(235,215,190,0.5)]"
          >
            {lead ? "Comprar ahora" : "Ver productos"}
          </Link>
          <Link
            href="/productos"
            className="py-2 text-base font-medium text-champagne transition hover:text-white hover:underline flex items-center gap-1.5"
          >
            <span>Ver todo el catálogo</span>
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>

      {lead && (
        <div className="hero-stage relative mx-auto mt-12 w-[calc(100%-2rem)] max-w-[980px] overflow-hidden rounded-[32px] border border-white/10 bg-[#1d1d1f] px-6 pt-8 md:mt-16 md:w-[calc(100%-4rem)] md:px-10 md:pt-14 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
          {/* Top subtle champagne rim highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(235,215,190,0.5)] to-transparent" />
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
