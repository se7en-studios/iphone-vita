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
import { fullName, priceLabel, formatARS, formatUSD } from "@/lib/format";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBadges, StockNote } from "@/components/ui/Badges";
import { BuyButtons } from "@/components/cart/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import {
  GiftIcon,
  ShieldIcon,
  SwapIcon,
  TruckIcon,
} from "@/components/ui/Icons";

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
  return {
    title: fullName(p),
    description: p.description,
    openGraph: {
      title: fullName(p),
      description: p.description,
      images: p.image ? [p.image] : undefined,
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

  const all = await getProducts();
  const related = all
    .filter((x) => x.category === p.category && x.model !== p.model)
    .slice(0, 4);
  const isNewIphone = p.category === "iphone" && p.condition === "nuevo";
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullName(p),
    description: p.description,
    brand: { "@type": "Brand", name: p.brand },
    image: p.image ?? undefined,
    itemCondition:
      p.condition === "nuevo"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: p.price ?? undefined,
      availability:
        p.stockLevel === "bajo"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
    },
  };
  const summary = [
    p.size,
    p.storage,
    p.color,
    p.bandSize ? `talle ${p.bandSize}` : "",
    p.batteryHealth ? `${p.batteryHealth}% batería` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <header className="mx-auto max-w-7xl px-4 pb-10 pt-8 md:px-8 md:pb-14 md:pt-12">
        <nav
          aria-label="Ruta"
          className="flex flex-wrap gap-2 text-xs text-white/50"
        >
          <Link href="/" className="hover:text-white">
            Inicio
          </Link>
          <span aria-hidden="true">›</span>
          <Link
            href={`/productos?categoria=${p.category}`}
            className="hover:text-white"
          >
            {categoryName(p.category)}
          </Link>
        </nav>
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <ProductBadges product={p} dark />
            <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              Comprar {p.name}
            </h1>
          </div>
          {p.price != null && (
            <p className="tabular text-lg text-white/60">
              {formatUSD(p.price)}{" "}
              <span className="text-sm text-white/40">
                ≈ {formatARS(p.price)} ARS
              </span>
            </p>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 md:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery product={p} />
        </div>

        <div className="space-y-14">
          {colorOptions.length > 1 && (
            <Step title="Acabado." hint="Elegí tu color.">
              <div className="flex flex-wrap gap-4">
                {colorOptions.map((v) => (
                  <Link
                    key={v.slug}
                    href={`/producto/${v.slug}`}
                    scroll={false}
                    aria-label={v.color}
                    aria-current={v.color === p.color ? "true" : undefined}
                    className={`size-10 rounded-full ring-1 ring-white/25 transition ${
                      v.color === p.color
                        ? "ring-2 ring-white ring-offset-4 ring-offset-black"
                        : "hover:scale-110"
                    }`}
                    style={{ background: v.colorHex }}
                  />
                ))}
              </div>
              <p className="mt-5 text-sm text-white/60">
                Color · <span className="text-white">{p.color}</span>
              </p>
            </Step>
          )}

          {storageOptions.length > 1 && (
            <Step title="Capacidad." hint="¿Cuánto espacio?">
              <div className="grid gap-3">
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
              <div className="grid gap-3 sm:grid-cols-2">
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
              <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="rounded-[28px] bg-[#0a0a0a] p-6 ring-1 ring-white/10 md:p-8">
            <p className="text-sm text-white/50">
              {p.condition === "semi-nuevo"
                ? `Tu ${p.name} semi nuevo`
                : `Tu nuevo ${p.name}`}
            </p>
            <p className="mt-1 text-lg font-semibold">{summary || p.name}</p>
            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
              <p className="tabular text-3xl font-bold tracking-tight">
                {priceLabel(p)}
              </p>
              <StockNote product={p} dark />
            </div>
            {p.price != null && (
              <p className="mt-2 text-xs text-white/50">
                Pagás en dólares, USDT o pesos al cambio del día.
              </p>
            )}
            {isNewIphone && (
              <p className="mt-5 flex items-start gap-3 text-sm text-white/70">
                <GiftIcon className="mt-0.5 size-5 shrink-0 text-[#ebd7be]" />
                <span>
                  <span className="text-white">
                    Funda y templado de regalo.
                  </span>{" "}
                  Te los llevás instalados, sin costo.
                </span>
              </p>
            )}
            <div className="mt-7">
              <BuyButtons product={p} dark />
            </div>
          </div>

          <ul className="grid gap-6 sm:grid-cols-3">
            <Perk
              icon={<TruckIcon />}
              title="Envíos a todo el país"
              body="Asegurados, o retiro coordinado."
            />
            <Perk
              icon={<ShieldIcon />}
              title="Garantía"
              body={
                p.condition === "nuevo"
                  ? "1 año oficial Apple."
                  : "90 días iPhone Vita."
              }
            />
            <Perk
              icon={<SwapIcon />}
              title="Plan Canje"
              body="Entregá tu usado como parte de pago."
              href="/#plan-canje"
            />
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              Especificaciones.
            </h2>
            {p.description && (
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-white/60">
                {p.description}
              </p>
            )}
          </div>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            <Spec label="Marca" value={p.brand} />
            <Spec label="Categoría" value={categoryName(p.category)} />
            {Object.entries(p.specifications).map(([k, v]) => (
              <Spec key={k} label={k} value={v} />
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-white/10 py-24 md:py-32">
          <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-8">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              También te puede interesar.
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {related.map((r) => (
                <ProductCard key={r.slug} product={r} compact dark />
              ))}
            </div>
          </div>
        </section>
      )}
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
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-[28px]">
        {title} <span className="text-white/50">{hint}</span>
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
  return (
    <Link
      href={`/producto/${product.slug}`}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-5 transition ${
        active
          ? "border-[#ebd7be] ring-1 ring-[#ebd7be]"
          : "border-white/20 hover:border-white/50"
      }`}
    >
      <span className="text-lg font-semibold">{label}</span>
      <span className="tabular text-sm text-white/60">
        {priceLabel(product)}
      </span>
    </Link>
  );
}

function Perk({
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
  const content = (
    <>
      <span className="text-[#ebd7be]">{icon}</span>
      <span className="mt-3 block text-sm font-semibold text-white">
        {title}
      </span>
      <span className="mt-1 block text-sm text-white/50">{body}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className="block transition hover:opacity-80">
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-4 text-[15px]">
      <dt className="text-white/50">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}
