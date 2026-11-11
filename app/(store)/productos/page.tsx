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
      {!filtered && <StoreFront products={products} categories={categories} />}
      <ProductsExplorer
        key={JSON.stringify(initial)}
        products={products}
        categories={categories}
        initial={initial}
        headingLevel={filtered ? "h1" : "h2"}
      />
    </div>
  );
}
