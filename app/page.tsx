import { getProducts, groupByModel } from "@/lib/products";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { Lookbook } from "@/components/sections/Lookbook";
import { ShopTabs } from "@/components/sections/ShopTabs";
import { PlanCanje } from "@/components/PlanCanje";
import { Trust } from "@/components/sections/Trust";
import { WhatsAppCTA } from "@/components/sections/WhatsAppCTA";

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

  return (
    <>
      <Hero variants={byModel("iphone-17-pro")} />
      <Highlights />
      <Lookbook />
      <ShopTabs
        iphoneGroups={iphoneGroups}
        macGroups={macGroups}
        ipadGroups={ipadGroups}
        watch={watch}
        accessories={accessories}
        semi={semi}
      />
      <PlanCanje />
      <Trust />
      <WhatsAppCTA />
    </>
  );
}
