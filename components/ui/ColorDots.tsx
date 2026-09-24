"use client";

import type { Product } from "@/types";

interface Props {
  variants: Product[];
  activeSlug?: string;
  onSelect?: (p: Product) => void;
  size?: "sm" | "md";
  dark?: boolean;
}

export function ColorDots({ variants, activeSlug, onSelect, size = "sm", dark = false }: Props) {
  const d = size === "sm" ? "size-4" : "size-7";
  return (
    <div className="flex flex-wrap items-center gap-2" role={onSelect ? "radiogroup" : undefined} aria-label="Colores">
      {variants.map((v) => {
        const active = v.slug === activeSlug;
        const cls = `${d} rounded-full border transition ${dark ? "border-white/20" : "border-black/10"} ${
          active ? (dark ? "ring-2 ring-white ring-offset-2 ring-offset-ink" : "ring-2 ring-ink ring-offset-2") : ""
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
            className={`${cls} cursor-pointer hover:scale-110`}
            style={{ background: v.colorHex }}
          />
        ) : (
          <span key={v.slug} title={v.color} className={cls} style={{ background: v.colorHex }} />
        );
      })}
    </div>
  );
}
