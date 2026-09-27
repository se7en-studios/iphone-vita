import { notFound } from "next/navigation";
import { getProducts, groupByModel } from "@/lib/products";
import { Hero } from "@/components/sections/Hero";
import { ProductSubnav } from "@/components/sections/ProductSubnav";
import { Highlights } from "@/components/sections/Highlights";
import { CameraSection } from "@/components/sections/CameraSection";
import { IntelligenceSection } from "@/components/sections/IntelligenceSection";
import { ColorPicker } from "@/components/sections/ColorPicker";
import { Lookbook } from "@/components/sections/Lookbook";
import { ShopTabs } from "@/components/sections/ShopTabs";
import { CompareSection } from "@/components/sections/CompareSection";
import { PlanCanje } from "@/components/PlanCanje";
import { Trust } from "@/components/sections/Trust";
import { WhatsAppCTA } from "@/components/sections/WhatsAppCTA";

const FEATURED_MODEL = "iphone-18-pro";
const COLORS_MODEL = "iphone-17-pro";
const COMPARE_MODELS = ["iphone-17-pro", "iphone-17-pro-max", "iphone-18-pro"];
const IPHONE_ORDER = [
  "iphone-17-pro",
  "iphone-17-pro-max",
  "iphone-18-pro",
  "iphone-17",
  "iphone-16",
];
const MAC_ORDER = ["macbook-air-15", "macbook-air-13", "macbook-neo"];
const ACCESSORY_MODELS = [
  "airpods-4",
  "airpods-4-anc",
  "apple-pencil-pro",
  "apple-pencil-usb-c",
  "airtag",
  "cable-magsafe-15w-inalambrico-original",
  "cable-usb-c-a-usb-c-1m-original",
  "transformador-20w-original-apple",
];

export default async function Home() {
  const products = await getProducts();
  const nuevos = products.filter((p) => p.condition === "nuevo");
  const byModel = (m: string) => nuevos.filter((p) => p.model === m);

  const featured = byModel(FEATURED_MODEL)[0];
  if (!featured) notFound();
  // El destacado puede venir en un solo color: en ese caso mostramos otro modelo.
  const featuredColors = byModel(FEATURED_MODEL);
  const colorVariants =
    featuredColors.length > 1 ? featuredColors : byModel(COLORS_MODEL);

  const iphoneGroups = groupByModel(
    nuevos.filter((p) => p.category === "iphone"),
  ).sort(
    (a, b) => IPHONE_ORDER.indexOf(a.model) - IPHONE_ORDER.indexOf(b.model),
  );
  const macGroups = groupByModel(
    nuevos.filter((p) => p.category === "mac"),
  ).sort((a, b) => MAC_ORDER.indexOf(a.model) - MAC_ORDER.indexOf(b.model));
  const ipadGroups = groupByModel(nuevos.filter((p) => p.category === "ipad"));
  const semi = products.filter((p) => p.condition === "semi-nuevo");
  const watch = byModel("apple-watch-series-11");
  const accessories = ACCESSORY_MODELS.map((m) =>
    nuevos.find((p) => p.model === m),
  ).filter((p) => p != null);
  const compare = COMPARE_MODELS.map((m) => byModel(m)[0]).filter(
    (p) => p != null,
  );

  return (
    <>
      <Hero product={featured} />
      <ProductSubnav name={featured.name} />
      <Highlights />
      <CameraSection />
      <IntelligenceSection />
      <ColorPicker variants={colorVariants} />
      <ShopTabs
        iphoneGroups={iphoneGroups}
        macGroups={macGroups}
        ipadGroups={ipadGroups}
        watch={watch}
        accessories={accessories}
        semi={semi}
      />
      <Lookbook />
      <CompareSection models={compare} />
      <PlanCanje />
      <Trust />
      <WhatsAppCTA />
    </>
  );
}
