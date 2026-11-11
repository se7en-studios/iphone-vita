"use client";

import Link from "next/link";
import { useState } from "react";
import type { ModelGroup } from "@/lib/catalog";
import { uniqueColors } from "@/lib/catalog";
import { formatUSD } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { StockNote } from "./ui/Badges";
import { ColorDots } from "./ui/ColorDots";
import { ArrowIcon } from "./ui/Icons";

/** Card grande de un modelo con sus variantes de color. */
export function ModelCard({
  group,
  size = "lg",
  dark = true,
  stretch = false,
}: {
  group: ModelGroup;
  size?: "lg" | "md";
  dark?: boolean;
  stretch?: boolean;
}) {
  const colors = uniqueColors(group.variants);
  const [active, setActive] = useState(colors[0]);

  // Brillo que sigue al cursor: variables CSS en el propio link, sin re-render por cada movimiento.
  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  const specs = [
    ...new Set(
      group.variants.map((v) =>
        [v.size, v.storage].filter(Boolean).join(" · "),
      ),
    ),
  ].filter(Boolean);

  return (
    <Link
      href={`/producto/${active.slug}`}
      onMouseMove={dark ? handleMouseMove : undefined}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] transition duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 ${
        dark
          ? "bg-surface text-fg shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.08] hover:shadow-[var(--card-shadow)] hover:ring-champagne"
          : "bg-mist"
      }`}
    >
      {/* Brillo champagne muy suave bajo el cursor */}
      {dark && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, var(--color-champagne) 22%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}
      <ProductVisual
        product={active}
        className={
          stretch
            ? "aspect-[4/5] lg:aspect-auto lg:min-h-[380px] lg:flex-1"
            : size === "lg"
              ? "aspect-[4/5] md:aspect-[5/6]"
              : "aspect-[4/5]"
        }
        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 25vw"
      />
      <div
        className={`flex flex-col gap-4 px-5 pb-5 pt-4 md:px-6 md:pb-6 ${stretch ? "" : "flex-1"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[19px] font-semibold leading-tight tracking-[-0.015em] text-fg md:text-xl">
              {group.name}
            </h3>
            {specs.length > 0 && (
              <p
                className={`tabular mt-1 text-[13px] ${dark ? "text-fg/55" : "text-muted"}`}
              >
                {specs.join(" / ")}
              </p>
            )}
          </div>
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-full transition duration-300 group-hover:translate-x-0.5 group-hover:bg-fg group-hover:text-bg ${dark ? "bg-fg/[0.06] text-fg" : "bg-fg text-bg"}`}
            aria-hidden="true"
          >
            <ArrowIcon />
          </span>
        </div>

        {/* Color: puntos (si hay más de uno) y el nombre del color activo en la misma línea */}
        <div className="flex min-h-5 items-center gap-3">
          {colors.length > 1 ? (
            <ColorDots
              variants={colors}
              activeSlug={active.slug}
              onSelect={setActive}
              dark={dark}
            />
          ) : (
            active.colorHex && (
              <ColorDots variants={colors} activeSlug={active.slug} dark={dark} />
            )
          )}
          {active.color && (
            <span
              className={`truncate text-[13px] ${dark ? "text-fg/60" : "text-muted"}`}
            >
              {active.color}
            </span>
          )}
        </div>

        <div
          className={`mt-auto flex items-end justify-between gap-3 border-t pt-4 ${dark ? "border-fg/[0.08]" : "border-black/5"}`}
        >
          {group.fromPrice != null ? (
            <p className="tabular leading-tight">
              <span
                className={`block text-[11px] font-medium uppercase tracking-[0.08em] ${dark ? "text-fg/45" : "text-muted"}`}
              >
                Desde
              </span>
              <span className="text-lg font-semibold tracking-[-0.01em] text-fg">
                {formatUSD(group.fromPrice)}
              </span>
            </p>
          ) : (
            <span />
          )}
          <StockNote product={active} dark={dark} />
        </div>
      </div>
    </Link>
  );
}
