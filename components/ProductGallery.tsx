"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import type { Product } from "@/types";
import { ProductVisual } from "./ProductVisual";
import { ChevronIcon } from "./ui/Icons";

const FRAME =
  "rounded-[28px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.06] md:rounded-[32px]";

/** Galería: imagen principal + miniaturas (image + gallery). Flechas del teclado entre miniaturas. */
export function ProductGallery({ product }: { product: Product }) {
  const images = [product.image, ...product.gallery].filter(
    (x): x is string => !!x,
  );
  const [i, setI] = useState(0);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!images.length) {
    return (
      <ProductVisual
        product={product}
        className={`aspect-square ${FRAME}`}
        priority
        sizes="(max-width: 1024px) 100vw, 55vw"
      />
    );
  }

  const alt = `${product.name}${product.color ? ` ${product.color}` : ""}`;
  const many = images.length > 1;
  const go = (n: number, focus = false) => {
    const next = (n + images.length) % images.length;
    setI(next);
    if (focus) thumbs.current[next]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: images.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key], true);
  };

  return (
    <div className="space-y-4">
      <div className={`stage group relative aspect-square overflow-hidden ${FRAME}`}>
        <Image
          key={images[i]}
          src={images[i]}
          alt={many ? `${alt} (imagen ${i + 1} de ${images.length})` : alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="stage-product animate-[fade-in_0.5s_ease-out] object-contain p-[4%]"
        />
        {many && (
          <>
            {(["left", "right"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(dir === "left" ? i - 1 : i + 1)}
                aria-label={dir === "left" ? "Imagen anterior" : "Imagen siguiente"}
                className={`absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full! bg-surface/80 text-fg shadow-[0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-fg/[0.08] backdrop-blur-md transition duration-300 hover:bg-surface focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
                  dir === "left" ? "left-3 md:left-4" : "right-3 md:right-4"
                }`}
              >
                <ChevronIcon dir={dir} className="size-4" />
              </button>
            ))}
            <span className="tabular absolute bottom-3 right-3 rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-medium text-fg/60 ring-1 ring-fg/[0.06] backdrop-blur-md md:bottom-4 md:right-4">
              {i + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {many && (
        <div
          role="group"
          aria-label="Imágenes del producto"
          onKeyDown={onKey}
          className="no-scrollbar -mx-1 flex justify-center gap-2.5 overflow-x-auto px-1 py-1"
        >
          {images.map((src, idx) => (
            <button
              key={src}
              ref={(el) => {
                thumbs.current[idx] = el;
              }}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              aria-current={idx === i ? "true" : undefined}
              tabIndex={idx === i ? 0 : -1}
              className={`stage relative size-16 shrink-0 overflow-hidden rounded-2xl! transition duration-300 md:size-[72px] ${
                idx === i
                  ? "ring-2 ring-vita"
                  : "opacity-70 ring-1 ring-fg/[0.08] hover:opacity-100 hover:ring-fg/25"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="72px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
