"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";
import { ProductVisual } from "./ProductVisual";

/** Galería: imagen principal + miniaturas (image + gallery). */
export function ProductGallery({ product }: { product: Product }) {
  const images = [product.image, ...product.gallery].filter(
    (x): x is string => !!x,
  );
  const [i, setI] = useState(0);

  if (!images.length) {
    return (
      <ProductVisual
        product={product}
        className="aspect-square rounded-[28px]"
        priority
        sizes="(max-width: 1024px) 100vw, 55vw"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="stage relative aspect-square overflow-hidden rounded-[28px]">
        <Image
          key={images[i]}
          src={images[i]}
          alt={`${product.name}${product.color ? ` ${product.color}` : ""}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="stage-product animate-[fade-in_0.5s_ease-out] object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-3">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              aria-current={idx === i}
              className={`stage relative size-16 overflow-hidden rounded-xl ring-2 transition ${
                idx === i
                  ? "ring-accent"
                  : "ring-transparent hover:ring-fg/30"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
