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
/** La foto va recortada (fondo transparente): el hero la apoya directo sobre el fondo, sin tarjeta. */
type HeroArt = {
  src: string;
  alt: string;
  video?: { src: string; poster: string; end: string };
};

const HERO_ART: Record<string, HeroArt> = {};

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
  /** Con foto: en compu el hero entra justo en una pantalla bajo la navbar, con el equipo entero a la vista. */
  const fitsScreen = !!lead && !art?.video;

  return (
    <section
      id="hero"
      className={`relative isolate scroll-mt-14 overflow-hidden bg-bg pb-14 pt-12 text-center text-fg ${
        fitsScreen
          ? "md:flex md:h-[max(40rem,calc(100svh-3.5rem))] md:flex-col md:justify-center md:pb-6 md:pt-12"
          : "md:pb-24 md:pt-16"
      }`}
    >
      {/* ── Luz ambiental de Titanio Natural ──
          Gradiente con muchas paradas y sin blur: el blur sobre un alfa tan bajo dejaba anillos (banding). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_62%,rgba(235,215,190,0.24)_0%,rgba(235,215,190,0.18)_18%,rgba(235,215,190,0.11)_36%,rgba(235,215,190,0.05)_54%,rgba(235,215,190,0.015)_70%,transparent_85%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-surface/70 to-transparent"
      />

      <div className="intro relative z-10 mx-auto w-full max-w-[980px] px-4 md:px-8">
        {/* Sello de confianza */}
        <div
          style={d(0)}
          className="mb-4 inline-flex max-w-full items-center gap-2 text-balance text-[0.75rem] font-medium leading-snug text-vita sm:mb-5 sm:rounded-full sm:border sm:border-vita/20 sm:bg-surface/70 sm:px-3.5 sm:py-1.5 sm:leading-tight sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:backdrop-blur-md md:mb-6"
        >
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-vita/70 max-sm:hidden"
          />
          <span>
            Garantía Oficial Apple · Equipos Nuevos Sellados & Semi-nuevos
          </span>
        </div>

        <h1
          style={d(1)}
          className="text-[clamp(2.9rem,13vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg md:text-[clamp(4rem,6.4vw,5.75rem)]"
        >
          {group ? group.name : "Tu próxima tecnología."}
        </h1>

        <p
          style={d(2)}
          className="mx-auto mt-4 max-w-[34ch] text-[1.0625rem] leading-[1.5] text-fg/60 md:mt-5 md:max-w-[52ch] md:text-xl md:leading-[1.45]"
        >
          {group
            ? pitch(group)
            : "Equipos sellados con garantía oficial y semi nuevos seleccionados. Aceptamos pesos y enviamos a todo el país."}
        </p>

        {group?.fromPrice != null && (
          <p
            style={d(3)}
            className="tabular mt-5 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-lg text-fg/80 md:mt-6 md:text-xl"
          >
            <span>
              Desde{" "}
              <span className="font-semibold tracking-[-0.01em] text-fg">
                {formatUSD(group.fromPrice)}
              </span>
            </span>
            <span className="text-sm text-fg/45">
              ≈ <Ars usd={group.fromPrice} />
            </span>
          </p>
        )}

        <div
          style={d(4)}
          className="mt-7 flex flex-col items-center justify-center gap-x-7 gap-y-2 sm:flex-row md:mt-8"
        >
          <Link
            href={lead ? `/producto/${lead.slug}` : "/productos"}
            className="sheen inline-flex min-h-12 items-center rounded-full bg-champagne px-8 text-base font-semibold text-black ring-1 ring-inset ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_24px_-10px_rgba(134,103,58,0.45)] transition duration-300 ease-[var(--ease-soft)] hover:bg-champagne-light hover:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_14px_30px_-10px_rgba(134,103,58,0.5)] motion-safe:hover:-translate-y-px"
          >
            {lead ? "Comprar ahora" : "Ver productos"}
          </Link>
          <Link
            href="/productos"
            className="group/cat inline-flex min-h-11 items-center gap-1 text-base font-medium text-vita transition-colors hover:text-fg"
          >
            <span className="underline-offset-4 group-hover/cat:underline">
              Ver todo el catálogo
            </span>
            <span
              aria-hidden
              className="transition-transform duration-300 motion-safe:group-hover/cat:translate-x-0.5"
            >
              ›
            </span>
          </Link>
        </div>
      </div>

      {lead && art?.video && (
        <div className="hero-stage theme-dark relative mx-auto mt-10 aspect-[4/3] w-[calc(100%-2rem)] max-w-[980px] overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] md:mt-14 md:aspect-video md:w-[calc(100%-4rem)]">
          <HeroVideo
            src={art.video.src}
            poster={art.video.poster}
            endSrc={art.video.end}
            alt={art.alt}
          />
        </div>
      )}

      {showMobileVideo && (
        <div className="hero-stage theme-dark relative mx-auto mt-10 aspect-[4/3] w-[calc(100%-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] md:hidden">
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
        <div
          className={`${showMobileVideo ? "max-md:hidden " : ""}hero-stage relative z-10 mx-auto mt-6 w-full max-w-[705px] px-4 md:mt-2 md:max-h-[36rem] md:min-h-0 md:flex-1 md:px-8`}
        >
          {/* En compu llena el alto que deja el texto: el equipo entra entero y centrado bajo los botones. */}
          <div className="intro-media relative mx-auto aspect-[705/656] w-full md:aspect-auto md:h-full">
            {/* Piso: sombra elíptica muy suave que apoya el equipo sobre el fondo. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[22%] bottom-[2%] h-[7%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.10),transparent)]"
            />
            {art ? (
              <Image
                src={art.src}
                alt={art.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 560px"
                className="hero-float object-contain object-bottom"
              />
            ) : (
              <ProductVisual
                product={lead}
                priority
                // Las fotos de catálogo traen aire transparente alrededor: un 20% más para que el equipo pese.
                className="hero-float size-full scale-[1.2] !bg-none"
                sizes="(max-width: 768px) 100vw, 560px"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
