"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";
import { ProductVisual } from "./ProductVisual";

const isShowcase = (src: string) => src.includes("/showcase/");

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
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[#0a0a0a]">
        <Image
          key={images[i]}
          src={images[i]}
          alt={`${product.name}${product.color ? ` ${product.color}` : ""}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className={`animate-[fade-in_0.5s_ease-out] ${isShowcase(images[i]) ? "object-contain p-2" : "object-cover"}`}
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
              className={`relative size-16 overflow-hidden rounded-xl bg-[#0a0a0a] ring-2 transition ${
                idx === i
                  ? "ring-[#ebd7be]"
                  : "ring-transparent hover:ring-white/30"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className={
                  isShowcase(src) ? "object-contain p-1" : "object-cover"
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
