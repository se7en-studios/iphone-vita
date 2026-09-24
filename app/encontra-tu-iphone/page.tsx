import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { IphoneFinder } from "@/components/IphoneFinder";

export const metadata: Metadata = {
  title: "Encontrá tu iPhone",
  description: "Respondé cinco preguntas y te mostramos los iPhone que mejor te quedan, nuevos o semi nuevos.",
};

export default async function FinderPage() {
  const products = await getProducts();
  return <IphoneFinder products={products.filter((p) => p.category === "iphone")} />;
}
