"use client";

import type { Product } from "@/types";

interface Props {
  variants: Product[];
  activeSlug?: string;
  onSelect?: (p: Product) => void;
  size?: "sm" | "md";
  dark?: boolean;
}

export function ColorDots({
  variants,
  activeSlug,
  onSelect,
  size = "sm",
  dark = false,
}: Props) {
  const d = size === "sm" ? "size-4" : "size-7";
  // 44px de alto; 28px de ancho (≥ 24px WCAG 2.2) para que 5 colores entren en una fila de card mobile.
  const hit = size === "sm" ? "h-11 w-7" : "size-11";
  return (
    <div
      className={`flex flex-wrap items-center ${onSelect ? (size === "sm" ? "-mx-1.5 -my-3.5" : "-m-2") : "gap-2"}`}
      role={onSelect ? "radiogroup" : undefined}
      aria-label="Colores"
    >
      {variants.map((v) => {
        const active = onSelect != null && v.slug === activeSlug;
        // Borde interno sutil para que los colores claros (blanco, plata) no se pierdan sobre la card.
        const cls = `${d} rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.35)] transition duration-200 ${
          active
            ? `ring-[1.5px] ring-offset-2 ${dark ? "ring-fg/80 ring-offset-surface" : "ring-ink ring-offset-white"}`
            : ""
        }`;
        return onSelect ? (
          <button
            key={v.slug}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={v.color}
            title={v.color}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(v);
            }}
            className={`group/dot grid ${hit} shrink-0 cursor-pointer place-items-center rounded-full`}
          >
            <span
              className={`${cls} group-hover/dot:scale-110`}
              style={{ background: v.colorHex }}
            />
          </button>
        ) : (
          <span
            key={v.slug}
            title={v.color}
            className={cls}
            style={{ background: v.colorHex }}
          />
        );
      })}
    </div>
  );
}
