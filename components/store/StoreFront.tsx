import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Category, Product } from "@/types";
import { groupByModel, type ModelGroup } from "@/lib/products";
import { formatUSD, isOutOfStock, priceLabel } from "@/lib/format";
import { GENERAL_MESSAGE, waLink } from "@/lib/whatsapp";
import { ProductVisual } from "../ProductVisual";
import {
  CashIcon,
  CategoryGlyph,
  GiftIcon,
  ShieldIcon,
  SwapIcon,
  TruckIcon,
} from "../ui/Icons";

/** Alinea el primer card del estante con el contenedor max-w-7xl y deja el resto sangrando a la derecha. */
const LATEST_FALLBACK = 6;

const SHELF_PAD =
  "px-4 scroll-px-4 md:px-8 md:scroll-px-8 xl:px-[calc((100vw-80rem)/2+2rem)] xl:scroll-px-[calc((100vw-80rem)/2+2rem)]";

/** Vitrina estilo Apple Store: titular, fila de categorías y estantes horizontales. */
export function StoreFront({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const available = products.filter((p) => !isOutOfStock(p));
  const nuevos = groupByModel(available.filter((p) => p.condition === "nuevo"));
  // Destacados del admin; si no marcó ninguno, los primeros del catálogo.
  const featured = nuevos.filter((g) => g.variants.some((v) => v.featured));
  const latest = featured.length ? featured : nuevos.slice(0, LATEST_FALLBACK);
  const semi = available.filter((p) => p.condition === "semi-nuevo");
  const essentials = groupByModel(
    available.filter(
      (p) =>
        ["airpods", "accesorios", "audio"].includes(p.category) &&
        p.price != null,
    ),
  );

  return (
    <>
      <header className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-12 md:flex-row md:items-end md:justify-between md:px-8 md:pb-14 md:pt-20">
        <h1 className="max-w-3xl text-[34px] font-semibold md:text-[clamp(3rem,5.5vw,5rem)] leading-[1.05] tracking-[-0.03em]">
          Tienda.{" "}
          <span className="text-fg/50">
            La forma más simple de comprar tu próximo equipo.
          </span>
        </h1>
        <a
          href={waLink(GENERAL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm leading-snug md:text-right"
        >
          <span className="block font-semibold">¿Necesitás ayuda?</span>
          <span className="text-link hover:underline">
            Hablá con un especialista ›
          </span>
        </a>
      </header>

      <CategoryNav products={products} categories={categories} />

      <Shelf title="Lo último." tail="Sellados, con garantía oficial.">
        {latest.map((g) => (
          <HeroCard key={g.model} group={g} />
        ))}
      </Shelf>

      <Shelf
        title="Semi nuevos."
        tail="Revisados uno por uno, con batería real."
      >
        {semi.map((p) => (
          <ProductTile
            key={p.slug}
            product={p}
            eyebrow={p.batteryHealth != null ? `${p.batteryHealth}% batería` : undefined}
          />
        ))}
      </Shelf>

      <Shelf
        title="La diferencia iPhone Vita."
        tail="Más razones para comprar acá."
      >
        <InfoCard
          icon={<GiftIcon />}
          title="Funda y templado de regalo"
          body="Con cada iPhone nuevo sellado, instalados y sin costo."
        />
        <InfoCard
          icon={<CashIcon />}
          title="Pagá como quieras"
          body="Dólares, USDT o pesos al cambio del día."
        />
        <InfoCard
          icon={<SwapIcon />}
          title="Plan Canje"
          body="Entregá tu iPhone usado como parte de pago."
          href="/#plan-canje"
        />
        <InfoCard
          icon={<TruckIcon />}
          title="Envíos a todo el país"
          body="Asegurados, o retiro coordinado."
        />
        <InfoCard
          icon={<ShieldIcon />}
          title="Garantía"
          body="1 año oficial Apple en equipos nuevos."
        />
      </Shelf>

      <Shelf title="Accesorios esenciales." tail="Lo que va con tu equipo.">
        {essentials.map((g) => (
          <ProductTile
            key={g.model}
            product={g.variants[0]}
            from={g.variants.length > 1 ? g.fromPrice : null}
          />
        ))}
      </Shelf>
    </>
  );
}

function CategoryNav({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const items = [
    ...categories.map((c) => ({
      label: c.name,
      href: `/productos?categoria=${c.slug}`,
      product:
        products.find((p) => p.category === c.slug && p.image) ??
        products.find((p) => p.category === c.slug),
    })),
    {
      label: "Semi nuevos",
      href: "/productos?condicion=semi-nuevo",
      product: products.find((p) => p.condition === "semi-nuevo"),
    },
  ].filter((i) => i.product);

  return (
    <nav
      aria-label="Categorías"
      className={`no-scrollbar flex snap-x gap-2 overflow-x-auto pb-4 md:gap-4 ${SHELF_PAD}`}
    >
      {items.map(({ label, href, product }) => (
        <Link
          key={href}
          href={href}
          className="group flex w-[76px] shrink-0 snap-start flex-col items-center gap-2 text-center md:w-[112px]"
        >
          <span className="relative grid h-[60px] w-full place-items-center md:h-[78px]">
            {product!.image ? (
              <Image
                src={product!.image}
                alt=""
                fill
                sizes="112px"
                className="object-contain transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110"
              />
            ) : (
              <span className="w-9 text-fg/40 md:w-11">
                <CategoryGlyph
                  category={product!.category}
                  subcategory={product!.subcategory}
                />
              </span>
            )}
          </span>
          <span className="text-xs font-semibold md:text-sm">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Shelf({
  title,
  tail,
  children,
}: {
  title: string;
  tail: string;
  children: ReactNode;
}) {
  if (Array.isArray(children) && children.length === 0) return null;
  return (
    <section className="pt-10 md:pt-14">
      <h2 className="mx-auto max-w-7xl px-4 text-2xl font-semibold tracking-[-0.02em] md:px-8 md:text-[28px]">
        {title} <span className="text-fg/50">{tail}</span>
      </h2>
      <div
        data-stagger
        className={`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-10 pt-6 md:gap-5 ${SHELF_PAD}`}
      >
        {children}
      </div>
    </section>
  );
}

const CARD =
  "shrink-0 snap-start overflow-hidden rounded-[18px] bg-surface shadow-[2px_4px_12px_rgba(0,0,0,0.08)] transition duration-500 ease-[var(--ease-out-expo)] hover:scale-[1.01] hover:shadow-[2px_4px_16px_rgba(0,0,0,0.16)]";

const NEUTRAL = /white|silver|black|midnight|titanium/i;

function HeroCard({ group }: { group: ModelGroup }) {
  // Como Apple: mostrar el modelo en un color con personalidad si existe.
  const p = group.variants.find((v) => v.image && v.color && !NEUTRAL.test(v.color)) ?? group.variants[0];
  return (
    <Link
      href={`/producto/${p.slug}`}
      className={`${CARD} group flex h-[480px] w-[82vw] max-w-[400px] flex-col md:h-[500px]`}
    >
      <div className="p-7 pb-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#bf4800]">
          {p.stockLevel === "bajo" ? "Últimas unidades" : "Nuevo"}
        </p>
        <h3 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em]">
          {group.name}
        </h3>
        <p className="mt-2 text-[15px] text-fg/70">
          {group.fromPrice != null
            ? `Desde ${formatUSD(group.fromPrice)}`
            : "Consultá precio"}
        </p>
      </div>
      <ProductVisual
        product={p}
        className="mt-auto h-[300px] !bg-none md:h-[320px] [&_img]:scale-[1.15]"
        sizes="400px"
      />
    </Link>
  );
}

function ProductTile({
  product: p,
  eyebrow,
  from,
}: {
  product: Product;
  eyebrow?: string;
  from?: number | null;
}) {
  return (
    <Link
      href={`/producto/${p.slug}`}
      className={`${CARD} group flex w-[62vw] max-w-[300px] flex-col`}
    >
      <ProductVisual
        product={p}
        className="aspect-square !bg-none"
        sizes="300px"
      />
      <div className="flex flex-1 flex-col p-5 pt-2">
        {eyebrow && (
          <p className="text-xs font-semibold text-[#bf4800]">{eyebrow}</p>
        )}
        <h3 className="mt-1 text-[17px] font-semibold leading-snug">
          {p.name}
        </h3>
        <p className="mt-0.5 text-sm text-fg/60">
          {[p.storage, p.color].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-auto pt-4 text-sm">
          {from != null ? `Desde ${formatUSD(from)}` : priceLabel(p)}
        </p>
      </div>
    </Link>
  );
}

function InfoCard({
  icon,
  title,
  body,
  href,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="text-accent">{icon}</span>
      <h3 className="mt-5 text-xl font-semibold leading-snug tracking-[-0.01em]">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-fg/60">{body}</p>
    </>
  );
  const cls = `${CARD} flex w-[62vw] max-w-[300px] flex-col p-7`;
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
