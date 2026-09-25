"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";
import { ProductVisual } from "./ProductVisual";

/** Galería: imagen principal + miniaturas (image + gallery). */
export function ProductGallery({ product }: { product: Product }) {
  const images = [product.image, ...product.gallery].filter((x): x is string => !!x);
  const [i, setI] = useState(0);

  if (!images.length) {
    return <ProductVisual product={product} className="aspect-square rounded-[36px]" priority sizes="(max-width: 1024px) 100vw, 55vw" />;
  }
  const isShowcase = images[i]?.includes("/showcase/");

  return (
    <div className="space-y-3">
      <div className={`relative aspect-[4/5] overflow-hidden rounded-[36px] ${isShowcase ? "bg-[#0a0a0a]" : "bg-mist"}`}>
        <Image
          key={images[i]}
          src={images[i]}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className={isShowcase ? "object-contain p-2" : "object-cover"}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              className={`relative size-20 overflow-hidden rounded-2xl ring-2 transition ${
                src.includes("/showcase/") ? "bg-[#0a0a0a]" : "bg-mist"
              } ${idx === i ? "ring-ink" : "ring-transparent hover:ring-line"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className={src.includes("/showcase/") ? "object-contain p-1" : "object-cover"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
