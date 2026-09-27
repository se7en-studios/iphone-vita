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
 * Sin foto, muestra la ilustración de la categoría en el mismo escenario.
 */
export function ProductVisual({
  product,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  className = "",
}: Props) {
  return (
    <div className={`stage relative overflow-hidden ${className}`}>
      {product.image ? (
        <Image
          key={product.image}
          src={product.image}
          alt={`${product.name}${product.color ? ` ${product.color}` : ""}`}
          fill
          sizes={sizes}
          priority={priority}
          className="stage-product animate-[fade-in_0.45s_ease-out] object-contain transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="stage-product w-[42%] max-w-[170px] text-white/35 transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-105">
            <CategoryGlyph
              category={product.category}
              subcategory={product.subcategory}
            />
          </div>
        </div>
      )}
    </div>
  );
}
