import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryName, getProductBySlug, getProducts, getVariants } from "@/lib/products";
import { fullName, priceLabel, formatARS } from "@/lib/format";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBadges, StockNote } from "@/components/ui/Badges";
import { BuyButtons } from "@/components/cart/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { ShieldIcon, SwapIcon, TruckIcon } from "@/components/ui/Icons";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return {
    title: fullName(p),
    description: p.description,
    openGraph: { title: fullName(p), description: p.description, images: p.image ? [p.image] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const variants = await getVariants(p.model);
  // Variantes seleccionables: mismas otras propiedades, cambia una sola.
  const colorOptions = variants.filter((v) => v.storage === p.storage && v.size === p.size && (v.bandSize === p.bandSize || !p.bandSize));
  const uniqueByColor = colorOptions.filter((v, i, a) => a.findIndex((x) => x.color === v.color) === i);
  const storageOptions = variants.filter((v) => v.color === p.color && v.size === p.size && v.bandSize === p.bandSize);
  const sizeOptions = variants.filter((v, i, a) => v.color === p.color && a.findIndex((x) => x.size === v.size && x.color === v.color) === i);
  const bandOptions = variants.filter((v) => v.color === p.color && v.size === p.size && v.storage === p.storage);

  const all = await getProducts();
  const related = all.filter((x) => x.category === p.category && x.model !== p.model).slice(0, 4);

  const Option = ({ href, label, active, swatch }: { href: string; label: string; active: boolean; swatch?: string }) => (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-[#ebd7be] bg-white/5 text-white font-semibold ring-1 ring-[#ebd7be]"
          : "border-white/15 bg-white/5 text-white/80 hover:border-white/40 hover:text-white"
      }`}
    >
      {swatch && <span className="size-3.5 rounded-full border border-black/10" style={{ background: swatch }} />}
      {label}
    </Link>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        <nav aria-label="Ruta" className="flex flex-wrap gap-2 text-xs text-white/50">
          <Link href="/" className="hover:text-[#ebd7be]">Inicio</Link> <span>/</span>
          <Link href={`/productos?categoria=${p.category}`} className="hover:text-[#ebd7be]">{categoryName(p.category)}</Link> <span>/</span>
          <span className="text-white">{p.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-6 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery product={p} />

        <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            <ProductBadges product={p} dark />
            <div>
              <p className="text-xs text-[#ebd7be] font-semibold">{p.brand} · {categoryName(p.category)}</p>
              <h1 className="mt-1 text-4xl font-bold tracking-[-0.03em] text-white md:text-5xl">{p.name}</h1>
              <p className="mt-2 text-sm text-white/60">{[p.size, p.storage, p.color].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="tabular text-3xl font-bold tracking-tight text-[#ebd7be] md:text-4xl">{priceLabel(p)}</p>
                {p.price && (
                  <span className="tabular text-sm font-medium text-white/60">
                    ≈ {formatARS(p.price)} ARS
                  </span>
                )}
              </div>
              {p.price && (
                <p className="text-xs text-[#ebd7be]">
                  Se aceptan pesos al cambio del día (Dólar Blue) o transferencias
                </p>
              )}
            </div>
            <StockNote product={p} dark />
          </div>

          {p.category === "iphone" && p.condition === "nuevo" && (
            <div className="rounded-2xl bg-white/[0.04] p-4 text-xs ring-1 ring-white/10">
              <div>
                <p className="text-sm font-semibold text-[#ebd7be]">Funda y templado de regalo</p>
                <p className="mt-1 text-white/60">Con la compra de este equipo sellado te llevás funda de silicona y vidrio templado instalados sin costo.</p>
              </div>
            </div>
          )}

          {uniqueByColor.length > 1 && (
            <div className="space-y-3">
              <p className="text-xs text-white/50 font-semibold">Color · <span className="text-white font-sans">{p.color}</span></p>
              <div className="flex flex-wrap gap-2">
                {uniqueByColor.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.color ?? ""} active={v.color === p.color} swatch={v.colorHex} />)}
              </div>
            </div>
          )}
          {p.storage && (
            <div className="space-y-3">
              <p className="text-xs text-white/50 font-semibold">Capacidad</p>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.storage ?? ""} active={v.slug === p.slug} />)}
              </div>
            </div>
          )}
          {sizeOptions.length > 1 && (
            <div className="space-y-3">
              <p className="text-xs text-white/50 font-semibold">Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.size ?? ""} active={v.size === p.size} />)}
              </div>
            </div>
          )}
          {bandOptions.length > 1 && (
            <div className="space-y-3">
              <p className="text-xs text-white/50 font-semibold">Talle de malla</p>
              <div className="flex flex-wrap gap-2">
                {bandOptions.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.bandSize ?? ""} active={v.slug === p.slug} />)}
              </div>
            </div>
          )}

          <BuyButtons product={p} dark />

          {/* Reassurance Trust Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3 text-center">
              <ShieldIcon className="mx-auto mb-1.5 size-5 text-[#ebd7be]" />
              <p className="text-xs font-semibold text-white">Garantía Oficial</p>
              <p className="text-[11px] text-white/50">{p.condition === "nuevo" ? "1 Año Apple" : "90 Días Vita"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3 text-center">
              <TruckIcon className="mx-auto mb-1.5 size-5 text-[#ebd7be]" />
              <p className="text-xs font-semibold text-white">Envíos Seguros</p>
              <p className="text-[11px] text-white/50">A todo el país</p>
            </div>
            <Link href="/#plan-canje" className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3 text-center transition hover:border-[#ebd7be]/50">
              <SwapIcon className="mx-auto mb-1.5 size-5 text-[#ebd7be]" />
              <p className="text-xs font-semibold text-[#ebd7be]">Plan Canje</p>
              <p className="text-[11px] text-white/60">Entregá tu usado</p>
            </Link>
          </div>

          {p.description && <p className="max-w-prose leading-relaxed text-sm text-white/70">{p.description}</p>}

          <dl className="divide-y divide-white/10 border-y border-white/10">
            <div className="flex justify-between gap-6 py-3 text-sm"><dt className="text-white/50">Marca</dt><dd className="text-white">{p.brand}</dd></div>
            <div className="flex justify-between gap-6 py-3 text-sm"><dt className="text-white/50">Categoría</dt><dd className="text-white">{categoryName(p.category)}</dd></div>
            {Object.entries(p.specifications).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3 text-sm"><dt className="text-white/50">{k}</dt><dd className="text-right text-white">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-white/10 bg-black py-20 text-white">
          <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
            <h2 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">También te puede interesar.</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {related.map((r) => <ProductCard key={r.slug} product={r} compact dark />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
