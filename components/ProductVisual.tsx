import Image from "next/image";
import type { Product } from "@/types";
import { CategoryGlyph } from "./ui/Icons";

interface Props {
  product: Product;
  sizes?: string;
  priority?: boolean;
  className?: string;
  tone?: "light" | "dark";
}

/**
 * Foto del producto o, si todavía no hay foto propia, una ilustración neutra
 * teñida con el color de la variante. Nunca queda un hueco vacío.
 */
export function ProductVisual({ product, sizes = "(max-width: 768px) 100vw, 33vw", priority, className = "", tone = "light" }: Props) {
  if (product.image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={product.image} alt={product.name} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]" />
      </div>
    );
  }
  const tint = product.colorHex ?? (tone === "dark" ? "#3a3a3e" : "#d8d8d4");
  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{
        background: tone === "dark"
          ? `radial-gradient(120% 90% at 50% 20%, ${tint}33, #151517 70%)`
          : `radial-gradient(120% 90% at 50% 15%, ${tint}55, #f4f4f2 72%)`,
      }}
    >
      <div className={`w-[46%] max-w-[180px] transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-105 ${tone === "dark" ? "text-white/55" : "text-ink/45"}`}>
        <CategoryGlyph category={product.category} subcategory={product.subcategory} />
      </div>
      <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] ${tone === "dark" ? "text-white/35" : "text-ink/35"}`}>
        Foto próximamente
      </span>
    </div>
  );
}
