"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/types";
import type { ModelGroup } from "@/lib/products";
import { uniqueColors } from "@/lib/products";
import { formatUSD, formatARS } from "@/lib/format";
import { ModelCard } from "../ModelCard";
import { ProductCard } from "../ProductCard";
import { ProductVisual } from "../ProductVisual";
import { ColorDots } from "../ui/ColorDots";
import { StockNote } from "../ui/Badges";
import { BuyButtons } from "../cart/AddToCart";

const TABS = [
  { key: "iphone", label: "iPhone" },
  { key: "mac", label: "Mac" },
  { key: "ipad", label: "iPad" },
  { key: "watch", label: "Apple Watch" },
  { key: "accesorios", label: "Accesorios" },
  { key: "semi", label: "Semi Nuevos" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface Props {
  iphoneGroups: ModelGroup[];
  macGroups: ModelGroup[];
  ipadGroups: ModelGroup[];
  watch: Product[];
  accessories: Product[];
  semi: Product[];
}

/** Tienda en pestañas: una sola sección, sin scroll infinito por categoría. */
export function ShopTabs({ iphoneGroups, macGroups, ipadGroups, watch, accessories, semi }: Props) {
  const [tab, setTab] = useState<TabKey>("iphone");

  return (
    <section id="tienda" className="scroll-mt-16 border-t border-white/10 bg-[#050b18] py-16 text-white md:py-20">
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ebd7be]/80">Catálogo Oficial</p>
            <h2 className="text-[clamp(2rem,4.6vw,3.2rem)] font-semibold tracking-[-0.04em]">
              <span className="font-serif-luxury text-[#ebd7be]">Elegí tu categoría</span> Apple.
            </h2>
          </div>
          <Link href="/productos" className="text-sm font-medium text-[#ebd7be] hover:underline">
            Ver catálogo completo →
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Categorías">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-[#ebd7be] text-[#050b18] shadow-lg shadow-[#ebd7be]/20 font-semibold"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div key={tab}>
          {tab === "iphone" && <IphoneGrid groups={iphoneGroups} />}
          {tab === "mac" && <SimpleGrid groups={macGroups} />}
          {tab === "ipad" && <SimpleGrid groups={ipadGroups} />}
          {tab === "watch" && <WatchConfigurator variants={watch} />}
          {tab === "accesorios" && <AccessoryGrid items={accessories} />}
          {tab === "semi" && <SemiGrid items={semi} />}
        </div>
      </div>
    </section>
  );
}

function IphoneGrid({ groups }: { groups: ModelGroup[] }) {
  const [filter, setFilter] = useState<string>("todos");
  const shown = filter === "todos" ? groups : groups.filter((g) => g.model === filter);

  return (
    <div className="space-y-6">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Filtrar por modelo">
        {[{ model: "todos", name: "Todos" }, ...groups].map((g) => (
          <button
            key={g.model}
            type="button"
            role="tab"
            aria-selected={filter === g.model}
            onClick={() => setFilter(g.model)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              filter === g.model
                ? "bg-[#ebd7be] text-[#050b18] font-medium"
                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {shown.map((g) => (
          <ModelCard key={g.model} group={g} size="md" dark />
        ))}
      </div>
    </div>
  );
}

function SimpleGrid({ groups }: { groups: ModelGroup[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {groups.map((g) => (
        <ModelCard key={g.model} group={g} size="md" dark />
      ))}
    </div>
  );
}

function AccessoryGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((p) => (
        <ProductCard key={p.slug} product={p} compact dark />
      ))}
    </div>
  );
}

function SemiGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
      {items.map((p) => (
        <ProductCard key={p.slug} product={p} compact dark />
      ))}
    </div>
  );
}

/** Configurador de Apple Watch: tamaño, color y talle de malla. */
function WatchConfigurator({ variants }: { variants: Product[] }) {
  const sizes = [...new Set(variants.map((v) => v.size!))];
  const [size, setSize] = useState(sizes[sizes.length - 1]);
  const bySize = useMemo(() => variants.filter((v) => v.size === size), [variants, size]);
  const colors = uniqueColors(bySize);
  const [color, setColor] = useState(colors[0].color);
  const byColor = bySize.filter((v) => v.color === color);
  const current = byColor.length ? byColor : bySize.filter((v) => v.color === colors[0].color);
  const [band, setBand] = useState(current[0].bandSize);
  const active = current.find((v) => v.bandSize === band) ?? current[0];

  const pickSize = (s: string) => {
    setSize(s);
    const first = variants.find((v) => v.size === s && v.color === color) ?? variants.find((v) => v.size === s)!;
    setColor(first.color);
    setBand(first.bandSize);
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="order-2 space-y-7 lg:order-1">
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm text-white/50">Tamaño de caja</legend>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button key={s} type="button" onClick={() => pickSize(s)} aria-pressed={s === size} className={`rounded-full px-5 py-2.5 text-sm transition ${s === size ? "bg-white text-ink" : "bg-white/[0.07] hover:bg-white/15"}`}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm text-white/50">
              Color · <span className="text-white">{active.color}</span>
            </legend>
            <ColorDots variants={colors} activeSlug={colors.find((c) => c.color === active.color)?.slug} onSelect={(v) => { setColor(v.color); setBand(v.bandSize); }} size="md" dark />
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm text-white/50">Talle de malla</legend>
            <div className="flex gap-2">
              {current.map((v) => (
                <button key={v.slug} type="button" onClick={() => setBand(v.bandSize)} aria-pressed={v.slug === active.slug} className={`rounded-full px-4 py-2 text-sm transition ${v.slug === active.slug ? "bg-white text-ink" : "bg-white/[0.07] hover:bg-white/15"}`}>
                  {v.bandSize}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-line-dark pt-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2.5">
              <p className="tabular font-serif-luxury text-3xl font-bold tracking-tight text-[#ebd7be]">{formatUSD(active.price ?? 0)}</p>
              {active.price && (
                <span className="tabular text-xs text-white/50">≈ {formatARS(active.price)} ARS</span>
              )}
            </div>
            <StockNote product={active} dark />
          </div>
          <Link href={`/producto/${active.slug}`} className="text-xs font-semibold text-[#ebd7be] underline-offset-4 hover:underline">Ver detalle →</Link>
        </div>
        <BuyButtons product={active} layout="compact" dark />
      </div>

      <div className="order-1 lg:order-2">
        <ProductVisual product={active} tone="dark" className="aspect-square rounded-[44px]" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
    </div>
  );
}
