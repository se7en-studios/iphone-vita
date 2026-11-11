import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product } from "@/types";
import {
  categoryName,
  getProductBySlug,
  getProducts,
  getVariants,
} from "@/lib/products";
import { fullName, priceLabel, formatUSD, isOutOfStock } from "@/lib/format";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBadges, StockNote } from "@/components/ui/Badges";
import { BuyButtons } from "@/components/cart/AddToCart";
import { StickyBuyBar } from "@/components/cart/StickyBuyBar";
import { ProductCard } from "@/components/ProductCard";
import { ProductInfo } from "@/components/product/ProductInfo";
import { Ars } from "@/components/StoreSettings";
import { PaymentCalculator } from "@/components/product/PaymentCalculator";
import { SectionHead } from "@/components/ui/SectionHead";
import { CashIcon, CheckIcon, ShieldIcon, TruckIcon } from "@/components/ui/Icons";
import { OPEN_GRAPH_BASE, absoluteUrl } from "@/lib/site";

const RELATED_MAX = 4;

function availability(p: Product): string {
  if (isOutOfStock(p)) return "https://schema.org/OutOfStock";
  if (p.stockLevel === "bajo") return "https://schema.org/LimitedAvailability";
  return "https://schema.org/InStock";
}

/** JSON-LD Product. Sin precio no hay Offer (Google la exige con precio). */
function productJsonLd(p: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullName(p),
    sku: p.slug,
    description: p.description || fullName(p),
    brand: { "@type": "Brand", name: p.brand },
    image: [p.image, ...p.gallery]
      .filter((src): src is string => !!src)
      .map((src) => absoluteUrl(src)),
    itemCondition: p.condition === "nuevo" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers:
      p.price == null
        ? undefined
        : {
            "@type": "Offer",
            url: absoluteUrl(`/producto/${p.slug}`),
            priceCurrency: "USD",
            price: p.price,
            availability: availability(p),
            itemCondition: p.condition === "nuevo" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
          },
  };
}

/** Otros modelos de la misma categoría, uno por modelo, primero los que tienen stock. */
function relatedProducts(all: Product[], p: Product): Product[] {
  const seen = new Set<string>();
  return all
    .filter((x) => x.category === p.category && x.model !== p.model)
    .sort((a, b) => Number(isOutOfStock(a)) - Number(isOutOfStock(b)))
    .filter((x) => !seen.has(x.model) && seen.add(x.model))
    .slice(0, RELATED_MAX);
}

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const images = p.image ? [p.image] : undefined;
  return {
    title: fullName(p),
    description: p.description || undefined,
    alternates: { canonical: `/producto/${p.slug}` },
    // Base común + la foto del producto: compartido por WhatsApp sale con su imagen y el nombre del sitio.
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title: fullName(p),
      description: p.description || undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullName(p),
      description: p.description || undefined,
      images,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const variants = await getVariants(p.model);
  // Variantes seleccionables: mismas otras propiedades, cambia una sola.
  const colorOptions = variants
    .filter(
      (v) =>
        v.storage === p.storage &&
        v.size === p.size &&
        (v.bandSize === p.bandSize || !p.bandSize),
    )
    .filter((v, i, a) => a.findIndex((x) => x.color === v.color) === i);
  const storageOptions = variants.filter(
    (v) =>
      v.color === p.color && v.size === p.size && v.bandSize === p.bandSize,
  );
  const sizeOptions = variants.filter(
    (v, i, a) =>
      v.color === p.color &&
      a.findIndex((x) => x.size === v.size && x.color === v.color) === i,
  );
  const bandOptions = variants.filter(
    (v) => v.color === p.color && v.size === p.size && v.storage === p.storage,
  );

  const related = relatedProducts(await getProducts(), p);
  const soldOut = isOutOfStock(p);
  const summary = [
    p.size,
    p.storage,
    p.color,
    p.bandSize ? `talle ${p.bandSize}` : "",
    p.batteryHealth ? `${p.batteryHealth}% batería` : "",
  ]
    .filter(Boolean)
    .join(" · ");


  const hasPrice = p.price != null && p.priceType !== "consultar";
  const trust = [
    {
      icon: ShieldIcon,
      text:
        p.condition === "nuevo"
          ? p.brand === "Apple"
            ? "Garantía oficial Apple de 1 año"
            : "Producto nuevo con garantía"
          : "Garantía escrita iPhone Vita de 90 días",
    },
    { icon: TruckIcon, text: "Envío asegurado a todo el país o retiro en persona" },
    { icon: CashIcon, text: "Dólares billete, USDT o pesos al cambio del día" },
  ];

  return (
    <div className="store min-h-screen bg-bg text-fg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p)).replace(/</g, "\\u003c") }}
      />
      <header className="mx-auto max-w-7xl px-4 pb-6 pt-5 md:px-8 md:pb-10 md:pt-10">
        <nav aria-label="Ruta" className="-my-3 text-[13px] text-fg/50">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="rounded py-3 transition-colors hover:text-fg">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true" className="text-fg/30">›</li>
            <li>
              <Link
                href={`/productos?categoria=${p.category}`}
                className="rounded py-3 transition-colors hover:text-fg"
              >
                {categoryName(p.category)}
              </Link>
            </li>
            <li aria-hidden="true" className="text-fg/30">›</li>
            <li aria-current="page" className="max-w-[48vw] truncate text-fg/70 md:max-w-none">
              {p.name}
            </li>
          </ol>
        </nav>
        <div className="intro mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0">
            <ProductBadges product={p} dark />
            <h1 className="mt-3.5 text-[34px] font-bold leading-[1.04] tracking-[-0.035em] md:mt-4 md:text-[clamp(2.75rem,5.5vw,4.25rem)]">
              Comprar {p.name}
            </h1>
          </div>
          {hasPrice && (
            <p className="tabular shrink-0 text-[15px] text-fg/60 md:pb-2 md:text-right md:text-[17px]">
              <span className="font-semibold text-fg">{formatUSD(p.price!)}</span>
              <span className="text-fg/45">
                {" "}
                · ≈ <Ars usd={p.price!} />
              </span>
            </p>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 md:gap-12 md:px-8 md:pb-24 lg:grid-cols-[1.2fr_1fr] lg:gap-16 xl:gap-20">
        <div className="intro-media lg:sticky lg:top-24 lg:self-start">
          <ProductGallery product={p} />
        </div>

        <div className="intro min-w-0 space-y-10 md:space-y-12">
          {colorOptions.length > 1 && (
            <Step title="Acabado." hint="Elegí tu color.">
              <ul className="flex flex-wrap gap-3.5" aria-label="Colores">
                {colorOptions.map((v) => {
                  const active = v.color === p.color;
                  return (
                    <li key={v.slug}>
                      <Link
                        href={`/producto/${v.slug}`}
                        scroll={false}
                        aria-label={`${v.color}${isOutOfStock(v) ? " (sin stock)" : ""}`}
                        title={v.color}
                        aria-current={active ? "true" : undefined}
                        className={`relative block size-10 rounded-full! shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12),inset_0_-6px_10px_rgba(0,0,0,0.12),inset_0_4px_8px_rgba(255,255,255,0.35)] ring-offset-[3px] ring-offset-bg transition duration-300 ease-[var(--ease-soft)] ${
                          active
                            ? "ring-2 ring-vita"
                            : "ring-1 ring-transparent hover:ring-fg/25"
                        }`}
                        style={{ background: v.colorHex }}
                      >
                        {isOutOfStock(v) && (
                          <span
                            aria-hidden="true"
                            className="absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-fg/40"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-sm text-fg/55">
                Color · <span className="font-semibold text-fg">{p.color}</span>
              </p>
            </Step>
          )}

          {storageOptions.length > 1 && (
            <Step title="Capacidad." hint="¿Cuánto espacio necesitás?">
              <div className="grid grid-cols-2 gap-3">
                {storageOptions.map((v) => (
                  <Tile
                    key={v.slug}
                    product={v}
                    active={v.slug === p.slug}
                    label={v.storage ?? ""}
                  />
                ))}
              </div>
            </Step>
          )}

          {sizeOptions.length > 1 && (
            <Step title="Tamaño." hint="Elegí el que va con vos.">
              <div className="grid grid-cols-2 gap-3">
                {sizeOptions.map((v) => (
                  <Tile
                    key={v.slug}
                    product={v}
                    active={v.size === p.size}
                    label={v.size ?? ""}
                  />
                ))}
              </div>
            </Step>
          )}

          {bandOptions.length > 1 && (
            <Step title="Malla." hint="Elegí tu talle.">
              <div className="grid grid-cols-2 gap-3">
                {bandOptions.map((v) => (
                  <Tile
                    key={v.slug}
                    product={v}
                    active={v.slug === p.slug}
                    label={v.bandSize ?? ""}
                  />
                ))}
              </div>
            </Step>
          )}

          <div
            id="buy-box"
            className="scroll-mt-28 rounded-[28px] bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-32px_rgba(0,0,0,0.22)] ring-1 ring-fg/[0.08] sm:p-7 md:p-8"
          >
            <p className="text-[13px] font-medium text-fg/55">
              {p.condition === "semi-nuevo"
                ? `Tu ${p.name} semi nuevo`
                : `Tu nuevo ${p.name}`}
            </p>
            <p className="mt-1 text-lg font-semibold leading-snug tracking-[-0.015em] text-fg md:text-xl">
              {summary || p.name}
            </p>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t border-fg/[0.08] pt-5">
              <div className="min-w-0">
                <p
                  className={`tabular font-semibold tracking-[-0.03em] ${
                    hasPrice ? "text-[34px] leading-none md:text-[40px]" : "text-2xl leading-tight text-vita md:text-[28px]"
                  } ${soldOut ? "text-fg/35 line-through decoration-1" : ""}`}
                >
                  {priceLabel(p)}
                </p>
                {hasPrice && (
                  <p className="tabular mt-2 text-sm text-fg/55">
                    ≈ <Ars usd={p.price!} /> al cambio de hoy
                  </p>
                )}
                {!hasPrice && !soldOut && (
                  <p className="mt-1.5 text-sm text-fg/55">
                    Te pasamos el precio del día por WhatsApp en minutos.
                  </p>
                )}
              </div>
              <span className="rounded-full bg-bg px-3 py-1.5 ring-1 ring-fg/[0.06]">
                <StockNote product={p} dark />
              </span>
            </div>

            {p.batteryHealth != null && <Battery value={p.batteryHealth} />}

            {p.price != null && <PaymentCalculator product={p} />}

            {soldOut && (
              <p className="mt-5 rounded-2xl bg-bg p-4 text-sm leading-relaxed text-fg/70 ring-1 ring-fg/[0.06]">
                Por ahora no tenemos stock. Dejanos tu consulta y te avisamos apenas vuelva a entrar.
              </p>
            )}
            <div className="mt-6">
              <BuyButtons product={p} />
            </div>

            <ul className="mt-6 grid gap-3 border-t border-fg/[0.08] pt-5 text-[13px] text-fg/65">
              {trust.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-vita-soft text-vita">
                    <Icon className="size-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <ProductInfo product={p} />
        </div>
      </section>

      <section className="border-t border-fg/10 py-14 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div data-reveal className="space-y-2">
            <p className="text-[15px] font-semibold tracking-[-0.005em] text-vita md:text-[17px]">
              Ficha técnica
            </p>
            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
              Especificaciones.
            </h2>
            {p.description && (
              <p className="max-w-prose pt-3 text-[17px] leading-relaxed text-fg/60">
                {p.description}
              </p>
            )}
          </div>
          <dl
            data-reveal
            className="divide-y divide-fg/[0.08] self-start rounded-[24px] bg-surface px-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-fg/[0.08] md:px-7"
          >
            <Spec label="Marca" value={p.brand} />
            <Spec label="Categoría" value={categoryName(p.category)} />
            {Object.entries(p.specifications).map(([k, v]) => (
              <Spec key={k} label={k} value={v} />
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-fg/10 py-14 md:py-24">
          <div className="mx-auto max-w-7xl space-y-8 px-4 md:space-y-10 md:px-8">
            <SectionHead
              eyebrow="Seguí mirando"
              title={
                <>
                  También te puede interesar.{" "}
                  <span className="text-fg/50">Más {categoryName(p.category)}.</span>
                </>
              }
              action={{
                href: `/productos?categoria=${p.category}`,
                label: "Ver todos",
              }}
            />
            <div data-stagger className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {related.map((r) => (
                <ProductCard key={r.slug} product={r} compact dark />
              ))}
            </div>
          </div>
        </section>
      )}
      <StickyBuyBar product={p} targetId="buy-box" summary={summary} />
    </div>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={`${title.replace(/\.$/, "")}: ${hint}`}>
      <h2 className="mb-5 text-[22px] font-semibold leading-tight tracking-[-0.025em] md:text-2xl">
        {title} <span className="text-fg/45">{hint}</span>
      </h2>
      {children}
    </div>
  );
}

function Tile({
  product,
  active,
  label,
}: {
  product: Product;
  active: boolean;
  label: string;
}) {
  const out = isOutOfStock(product);
  return (
    <Link
      href={`/producto/${product.slug}`}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`group flex min-h-[76px] flex-col justify-center gap-1 rounded-2xl! bg-surface px-4 py-3.5 transition duration-300 ease-[var(--ease-soft)] md:px-5 ${
        active
          ? "shadow-[0_8px_20px_-14px_rgba(0,0,0,0.3)] ring-2 ring-vita"
          : "ring-1 ring-fg/[0.12] hover:ring-fg/30"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[17px] font-semibold tracking-[-0.015em] text-fg">{label}</span>
        <span
          aria-hidden="true"
          className={`grid size-4 shrink-0 place-items-center rounded-full transition ${
            active ? "bg-vita text-surface" : "ring-1 ring-fg/20"
          }`}
        >
          {active && <CheckIcon className="size-2.5" />}
        </span>
      </span>
      <span
        className={`tabular text-[13px] ${
          out ? "text-fg/40" : product.priceType === "consultar" ? "font-medium text-vita" : "text-fg/60"
        }`}
      >
        {out ? "Sin stock" : priceLabel(product)}
      </span>
    </Link>
  );
}

/** Salud de batería del semi nuevo: misma lectura que las cards de la home. */
function Battery({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="mt-5 rounded-2xl bg-bg p-4 ring-1 ring-fg/[0.06]">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-fg/60">Salud de batería</span>
        <span className="tabular font-semibold text-fg">{pct}%</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-fg/[0.08]"
        role="meter"
        aria-label="Salud de batería"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className={`h-full rounded-full ${pct >= 80 ? "bg-[#34c759]" : "bg-amber-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-fg/50">
        {pct >= 80
          ? "Por encima del 80%: el umbral de Apple para una batería en buen estado."
          : "Por debajo del 80%: consultanos por el cambio de batería."}
      </p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-4 text-[15px]">
      <dt className="text-fg/55">{label}</dt>
      <dd className="text-right font-medium text-fg">{value}</dd>
    </div>
  );
}
