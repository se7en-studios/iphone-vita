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
export function ProductVisual({
  product,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  className = "",
  tone = "light",
}: Props) {
  const isShowcase = product.image?.includes("/showcase/");

  if (product.image) {
    return (
      <div
        className={`relative overflow-hidden ${isShowcase ? "bg-black" : ""} ${className}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className={`${isShowcase ? "object-contain p-1" : "object-cover"} transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]`}
        />
      </div>
    );
  }
  const tint = product.colorHex ?? (tone === "dark" ? "#3a3a3e" : "#d8d8d4");
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-black ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 50% 20%, #1a1a1a 0%, #000000 70%)`,
      }}
    >
      <div className="w-[46%] max-w-[180px] transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-105 text-[#ebd7be]/60">
        <CategoryGlyph
          category={product.category}
          subcategory={product.subcategory}
        />
      </div>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-[#ebd7be]/40">
        Foto próximamente
      </span>
    </div>
  );
}
