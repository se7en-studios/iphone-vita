import Image from "next/image";
import type { Product } from "@/types";
import { CategoryGlyph } from "./ui/Icons";

interface Props {
  product: Product;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Producto sobre el escenario de estudio común a todo el catálogo.
 * Sin foto, muestra una silueta en el color del producto (iPhone) o la ilustración
 * de la categoría teñida con ese color, en el mismo escenario.
 */
export function ProductVisual({
  product,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  className = "",
}: Props) {
  const label = `${product.name}${product.color ? ` ${product.color}` : ""}`;
  return (
    <div className={`stage relative overflow-hidden ${className}`}>
      {product.image ? (
        <Image
          key={product.image}
          src={product.image}
          alt={label}
          fill
          sizes={sizes}
          priority={priority}
          className="stage-product animate-[fade-in_0.45s_ease-out] object-contain transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]"
        />
      ) : (
        <Fallback product={product} label={label} />
      )}
    </div>
  );
}

/** Placeholder sin foto: nunca una caja vacía. */
function Fallback({ product, label }: { product: Product; label: string }) {
  const hex = product.colorHex;
  const tint = hex
    ? `color-mix(in srgb, ${hex} 50%, var(--fg) 50%)`
    : "color-mix(in srgb, var(--fg) 40%, transparent)";
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 grid place-items-center"
    >
      {/* Halo muy suave del color del equipo detrás de la silueta. */}
      {hex && (
        <div
          aria-hidden="true"
          className="absolute inset-[18%] rounded-full opacity-25 blur-3xl"
          style={{ background: hex }}
        />
      )}
      <div className="stage-product relative h-[64%] max-h-[340px] transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]">
        {product.category === "iphone" ? (
          <PhoneSilhouette hex={hex} />
        ) : (
          <div
            className="aspect-square h-full max-w-[200px] opacity-70"
            style={{ color: tint }}
          >
            <CategoryGlyph
              category={product.category}
              subcategory={product.subcategory}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Dorso de un iPhone en el color de la variante: cuerpo, módulo de cámara y logo neutro. */
function PhoneSilhouette({ hex = "#d9d9de" }: { hex?: string }) {
  const id = `pv-${hex.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 100 200"
      className="h-full w-auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${hex} 78%, white)` }} />
          <stop offset="0.55" style={{ stopColor: hex }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${hex} 82%, black)` }} />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="92"
        height="192"
        rx="18"
        fill={`url(#${id}-body)`}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
      />
      <rect
        x="10"
        y="10"
        width="38"
        height="40"
        rx="11"
        style={{ fill: `color-mix(in srgb, ${hex} 85%, black)` }}
        fillOpacity="0.35"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8"
      />
      <circle cx="21" cy="21" r="6.5" fill="#1d1d1f" />
      <circle cx="21" cy="39" r="6.5" fill="#1d1d1f" />
      <circle cx="37" cy="30" r="3" fill="#1d1d1f" fillOpacity="0.6" />
      <circle
        cx="50"
        cy="100"
        r="8"
        fill="rgba(255,255,255,0.18)"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="0.6"
      />
    </svg>
  );
}
