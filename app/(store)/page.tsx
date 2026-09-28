import type { Product } from "@/types";
import { getProducts, groupByModel, type ModelGroup } from "@/lib/products";
import { isOutOfStock } from "@/lib/format";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { CategoryTiles } from "@/components/sections/CategoryTiles";
import { BrandMarquee } from "@/components/sections/BrandMarquee";
import { BestSellers } from "@/components/sections/BestSellers";
import { SemiNuevos } from "@/components/sections/SemiNuevos";
import {
  COMPARABLE_MODELS,
  CompareSection,
} from "@/components/sections/CompareSection";
import { PlanCanje, type CanjeTarget } from "@/components/PlanCanje";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { WhatsAppCTA } from "@/components/sections/WhatsAppCTA";

const BEST_SELLERS_MIN = 4;

/** Variante más barata con precio de un grupo (o la primera si ninguna tiene precio). */
const cheapest = (g: ModelGroup): Product =>
  g.variants.find((v) => v.price === g.fromPrice) ?? g.variants[0];

/**
 * Destacados: los modelos con algún SKU marcado `featured` en el admin, en orden de catálogo.
 * Si hay pocos se completa con el resto del catálogo, así la sección nunca queda vacía.
 */
function pickBestSellers(groups: ModelGroup[]): ModelGroup[] {
  const featured = groups.filter((g) => g.variants.some((v) => v.featured));
  if (featured.length >= BEST_SELLERS_MIN) return featured;
  const rest = groups.filter((g) => !featured.includes(g));
  return [...featured, ...rest].slice(0, BEST_SELLERS_MIN);
}

/**
 * Home de la tienda. Todo sale del catálogo real: si el dueño oculta, borra o deja sin stock
 * un modelo, las secciones se reacomodan solas (y las que quedan vacías no se muestran).
 */
export default async function Home() {
  const products = await getProducts();
  const available = products.filter((p) => !isOutOfStock(p));
  const newGroups = groupByModel(
    available.filter((p) => p.condition === "nuevo"),
  );
  const bestSellers = pickBestSellers(newGroups);

  const compare = COMPARABLE_MODELS.flatMap((m) => {
    const g = newGroups.find((x) => x.model === m);
    return g ? [cheapest(g)] : [];
  });

  const canjeTargets: CanjeTarget[] = newGroups
    .filter((g) => g.category === "iphone" && g.fromPrice != null)
    .map((g) => {
      const p = cheapest(g);
      return {
        model: p.storage ? `${g.name} (${p.storage})` : g.name,
        price: g.fromPrice as number,
      };
    })
    .sort((a, b) => a.price - b.price);

  return (
    <>
      <Hero group={bestSellers[0]} />
      <TrustBar />
      <CategoryTiles products={available} />
      <BrandMarquee products={available} />
      <BestSellers groups={bestSellers} />
      <SemiNuevos
        items={available.filter((p) => p.condition === "semi-nuevo")}
      />
      <CompareSection models={compare} />
      <PlanCanje targets={canjeTargets} />
      <ReviewsSection />
      <FaqSection />
      <WhatsAppCTA />
    </>
  );
}
