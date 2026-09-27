"use client";

import Link from "next/link";
import { useState } from "react";
import type { ModelGroup } from "@/lib/catalog";
import { uniqueColors } from "@/lib/catalog";
import { formatUSD, stockLabel } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
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
      className={`group flex h-full flex-col overflow-hidden rounded-[28px] transition duration-500 hover:-translate-y-1 ${
        dark
          ? "bg-surface text-fg ring-1 ring-fg/10 hover:ring-accent/40 hover:shadow-[var(--card-shadow)]"
          : "bg-mist"
      }`}
    >
      <ProductVisual
        product={active}
        className={
          stretch
            ? "aspect-[4/5] lg:aspect-auto lg:min-h-[380px] lg:flex-1"
            : size === "lg"
              ? "aspect-[4/5] md:aspect-[5/6]"
              : "aspect-[4/5]"
        }
        sizes="(max-width: 768px) 100vw, 40vw"
      />
      <div
        className={`flex flex-col gap-4 p-6 md:p-7 ${stretch ? "" : "flex-1"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-fg md:text-[22px] group-hover:text-highlight transition">
              {group.name}
            </h3>
            <p
              className={`mt-1 text-sm ${dark ? "text-fg/60" : "text-muted"}`}
            >
              {specs.join(" / ")}
            </p>
          </div>
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-full transition group-hover:translate-x-1 group-hover:bg-accent group-hover:text-accent-fg ${dark ? "bg-fg/10 text-fg" : "bg-fg"}`}
          >
            <ArrowIcon />
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            {colors.length > 1 && (
              <ColorDots
                variants={colors}
                activeSlug={active.slug}
                onSelect={setActive}
                dark={dark}
              />
            )}
            <p className={`text-xs ${dark ? "text-fg/50" : "text-muted"}`}>
              {[active.color, stockLabel(active)].filter(Boolean).join(" · ")}
            </p>
          </div>
          {group.fromPrice != null && (
            <p className="tabular text-right text-base text-fg">
              <span className="text-fg/50">Desde </span>
              {formatUSD(group.fromPrice)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
