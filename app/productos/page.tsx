import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/products";
import { ProductsExplorer } from "@/components/ProductsExplorer";
import { StoreFront } from "@/components/store/StoreFront";

export const metadata: Metadata = {
  title: "Productos",
  description: "iPhone nuevos y semi nuevos, Mac, iPad, Apple Watch, AirPods, accesorios, audio, gaming y más.",
};

type SP = Record<string, string | string[] | undefined>;
const arr = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export default async function ProductosPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const initial = {
    categories: arr(sp.categoria) as never[],
    subcategories: arr(sp.sub) as never[],
    brands: arr(sp.marca),
    prices: arr(sp.precio) as never[],
    stock: arr(sp.stock) as never[],
    conditions: arr(sp.condicion) as never[],
    sort: (typeof sp.orden === "string" ? sp.orden : undefined) as never,
  };

  const filtered = Object.keys(sp).length > 0;

  return (
    <div className="store min-h-screen bg-bg text-fg">
      {filtered ? (
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 md:px-8 md:pt-20">
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Todos los productos.
          </h1>
        </section>
      ) : (
        <>
          <StoreFront products={products} categories={categories} />
          <section className="mx-auto max-w-7xl px-4 pb-8 pt-16 md:px-8 md:pt-20">
            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Todos los productos.
            </h2>
          </section>
        </>
      )}
      <ProductsExplorer key={JSON.stringify(initial)} products={products} categories={categories} initial={initial} />
    </div>
  );
}
