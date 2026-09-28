import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/products";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://iphone-vita.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/productos`, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${SITE}/encontra-tu-iphone`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${SITE}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/arrepentimiento`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE}/productos?categoria=${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/producto/${p.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
