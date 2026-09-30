import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ModelGroup } from "@/lib/products";
import { formatUSD } from "@/lib/format";
import { Ars } from "../StoreSettings";
import { ProductVisual } from "../ProductVisual";
import { HeroVideo } from "../HeroVideo";

const d = (i: number) => ({ "--d": i }) as CSSProperties;

/** Fotos de campaña por modelo. El resto usa la foto de catálogo del producto. */
/** Con `video`, la tarjeta pasa a negro 16:9 y la foto queda solo como respaldo. */
type HeroArt = {
  src: string;
  alt: string;
  video?: { src: string; poster: string; end: string };
};

const HERO_ART: Record<string, HeroArt> = {
  "iphone-18-pro": {
    src: "/images/highlights/siri-ai-hero.jpg",
    alt: "iPhone 18 Pro en tres colores con Apple Intelligence en pantalla",
    video: {
      src: "/videos/hero-assembly.mp4",
      poster: "/videos/hero-assembly-poster.jpg",
      end: "/videos/hero-assembly-end.jpg",
    },
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
export function Hero({
  group,
  mobileVideo,
}: {
  group?: ModelGroup;
  /** Video del intro: en celular (donde el intro no se muestra) reemplaza la foto del hero. */
  mobileVideo?: { src: string; poster: string };
}) {
  const lead = group?.variants.find((v) => v.image) ?? group?.variants[0];
  const art = group ? HERO_ART[group.model] : undefined;
  const showMobileVideo = !!lead && !!mobileVideo && !art?.video;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-bg pb-14 pt-14 text-center text-fg md:pb-24 md:pt-16"
    >
      {/* ── Luz volumétrica ambiental de Titanio Natural ── */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] md:w-[1100px] md:h-[650px] rounded-full bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(235,215,190,0.14),transparent_70%)] blur-3xl opacity-80"
      />

      <div className="intro hero-copy relative z-10 mx-auto max-w-[980px] px-4 md:px-8">
        {/* Floating Luxury Badge */}
        <div style={d(0)} className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(235,215,190,0.25)] bg-[rgba(235,215,190,0.06)] px-4 py-1.5 text-xs font-semibold text-vita backdrop-blur-xl shadow-[0_0_20px_rgba(235,215,190,0.12)]">
          <span className="size-1.5 rounded-full bg-champagne animate-pulse" />
          <span>Garantía Oficial Apple · Equipos Nuevos Sellados & Semi-nuevos</span>
        </div>

        <h1
          style={d(1)}
          className="mt-2 text-[clamp(3.2rem,9.5vw,7.8rem)] font-bold leading-[0.95] tracking-[-0.04em] bg-gradient-to-b from-fg via-fg/95 to-fg/70 bg-clip-text text-transparent"
        >
          {group ? group.name : "Tu próxima tecnología."}
        </h1>

        <p
          style={d(2)}
          className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-fg/65 md:text-xl font-normal"
        >
          {group
            ? pitch(group)
            : "Equipos sellados con garantía oficial y semi nuevos seleccionados. Aceptamos pesos y enviamos a todo el país."}
        </p>

        {group?.fromPrice != null && (
          <p style={d(3)} className="tabular mt-5 text-xl font-medium text-fg">
            Desde <span className="text-vita font-bold">{formatUSD(group.fromPrice)}</span>
            <span className="ml-2 text-sm text-fg/50">
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
            className="py-2 text-base font-medium text-vita transition hover:text-fg hover:underline flex items-center gap-1.5"
          >
            <span>Ver todo el catálogo</span>
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>

      {lead && art?.video && (
        <div className="hero-stage theme-dark relative mx-auto mt-12 aspect-[4/3] w-[calc(100%-2rem)] max-w-[980px] overflow-hidden rounded-[32px] border border-white/10 bg-black md:mt-16 md:aspect-video md:w-[calc(100%-4rem)] shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
          <HeroVideo
            src={art.video.src}
            poster={art.video.poster}
            endSrc={art.video.end}
            alt={art.alt}
          />
        </div>
      )}

      {showMobileVideo && (
        <div className="hero-stage theme-dark relative mx-auto mt-12 aspect-[4/3] w-[calc(100%-2rem)] overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.85)] md:hidden">
          <HeroVideo
            src={mobileVideo.src}
            poster={mobileVideo.poster}
            endSrc={mobileVideo.poster}
            loop
            alt={art?.alt ?? `${group?.name ?? "iPhone"} en video`}
          />
        </div>
      )}

      {lead && !art?.video && (
        <div className={`${showMobileVideo ? "max-md:hidden " : ""}hero-stage relative mx-auto mt-12 w-[calc(100%-2rem)] max-w-[980px] overflow-hidden rounded-[32px] border border-fg/10 bg-surface-2 px-6 pt-8 md:mt-10 md:w-[calc(100%-4rem)] md:px-10 md:pt-8 shadow-[0_30px_90px_rgba(0,0,0,0.85)]`}>
          {/* Top subtle champagne rim highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(235,215,190,0.5)] to-transparent" />
          {/* La foto de campaña trae fondo #1d1d1f: la tarjeta usa el mismo gris para que no se vea el borde. */}
          <div className="intro-media relative mx-auto aspect-[705/656] w-full max-w-[705px] md:max-w-[380px]">
            {art ? (
              <Image
                src={art.src}
                alt={art.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 380px"
                className="hero-float object-contain object-bottom"
              />
            ) : (
              <ProductVisual
                product={lead}
                priority
                className="hero-float size-full !bg-none"
                sizes="(max-width: 768px) 100vw, 380px"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
