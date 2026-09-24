import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryName, getProductBySlug, getProducts, getVariants } from "@/lib/products";
import { fullName, priceLabel } from "@/lib/format";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBadges, StockNote } from "@/components/ui/Badges";
import { BuyButtons } from "@/components/cart/AddToCart";
import { ProductCard } from "@/components/ProductCard";

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
      className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition ${active ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
    >
      {swatch && <span className="size-3.5 rounded-full border border-black/10" style={{ background: swatch }} />}
      {label}
    </Link>
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        <nav aria-label="Ruta" className="flex flex-wrap gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Inicio</Link> <span>/</span>
          <Link href={`/productos?categoria=${p.category}`} className="hover:text-ink">{categoryName(p.category)}</Link> <span>/</span>
          <span className="text-ink">{p.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-6 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery product={p} />

        <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            <ProductBadges product={p} />
            <div>
              <p className="text-sm text-muted">{p.brand} · {categoryName(p.category)}</p>
              <h1 className="mt-1 text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1] tracking-[-0.045em]">{p.name}</h1>
              <p className="mt-2 text-muted">{[p.size, p.storage, p.color].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="tabular text-3xl font-semibold tracking-tight">{priceLabel(p)}</p>
            <StockNote product={p} />
          </div>

          {uniqueByColor.length > 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Color · <span className="text-ink">{p.color}</span></p>
              <div className="flex flex-wrap gap-2">
                {uniqueByColor.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.color ?? ""} active={v.color === p.color} swatch={v.colorHex} />)}
              </div>
            </div>
          )}
          {p.storage && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Capacidad</p>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.storage ?? ""} active={v.slug === p.slug} />)}
              </div>
            </div>
          )}
          {sizeOptions.length > 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.size ?? ""} active={v.size === p.size} />)}
              </div>
            </div>
          )}
          {bandOptions.length > 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Talle de malla</p>
              <div className="flex flex-wrap gap-2">
                {bandOptions.map((v) => <Option key={v.slug} href={`/producto/${v.slug}`} label={v.bandSize ?? ""} active={v.slug === p.slug} />)}
              </div>
            </div>
          )}

          <BuyButtons product={p} />

          {p.description && <p className="max-w-prose leading-relaxed text-muted">{p.description}</p>}

          <dl className="divide-y divide-line border-y border-line">
            <div className="flex justify-between gap-6 py-3 text-sm"><dt className="text-muted">Marca</dt><dd>{p.brand}</dd></div>
            <div className="flex justify-between gap-6 py-3 text-sm"><dt className="text-muted">Categoría</dt><dd>{categoryName(p.category)}</dd></div>
            {Object.entries(p.specifications).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper py-20">
          <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">También te puede interesar</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {related.map((r) => <ProductCard key={r.slug} product={r} compact />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
