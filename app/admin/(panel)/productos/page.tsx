import type { Metadata } from "next";
import { ProductsPanel } from "@/components/admin/products/ProductsPanel";

export const metadata: Metadata = { title: "Productos" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = Object.fromEntries(
    Object.entries(params).filter((e): e is [string, string] => typeof e[1] === "string"),
  );
  return <ProductsPanel initialParams={initial} />;
}
