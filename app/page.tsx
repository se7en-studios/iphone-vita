import { getCategories, getProducts, groupByModel } from "@/lib/products";
import { Hero } from "@/components/sections/Hero";
import { FeaturedIphone } from "@/components/sections/FeaturedIphone";
import { CategoryStrip } from "@/components/sections/CategoryStrip";
import { IphoneSection } from "@/components/sections/IphoneSection";
import { SemiNuevos } from "@/components/sections/SemiNuevos";
import { MacSection } from "@/components/sections/MacSection";
import { IpadSection } from "@/components/sections/IpadSection";
import { WatchSection } from "@/components/sections/WatchSection";
import { Accessories } from "@/components/sections/Accessories";
import { TechSetup } from "@/components/sections/TechSetup";
import { Brands } from "@/components/sections/Brands";
import { Trust } from "@/components/sections/Trust";
import { WhatsAppCTA } from "@/components/sections/WhatsAppCTA";

const IPHONE_ORDER = ["iphone-17-pro", "iphone-17-pro-max", "iphone-18-pro", "iphone-17", "iphone-16"];
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
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const nuevos = products.filter((p) => p.condition === "nuevo");
  const byModel = (m: string) => nuevos.filter((p) => p.model === m);

  const iphoneGroups = groupByModel(nuevos.filter((p) => p.category === "iphone")).sort((a, b) => IPHONE_ORDER.indexOf(a.model) - IPHONE_ORDER.indexOf(b.model));
  const macGroups = groupByModel(nuevos.filter((p) => p.category === "mac")).sort((a, b) => MAC_ORDER.indexOf(a.model) - MAC_ORDER.indexOf(b.model));
  const ipadGroups = groupByModel(nuevos.filter((p) => p.category === "ipad"));
  const semi = products.filter((p) => p.condition === "semi-nuevo");
  const watch = byModel("apple-watch-series-11");
  const accessories = ACCESSORY_MODELS.map((m) => nuevos.find((p) => p.model === m)).filter((p) => p != null);

  const first = (m: string) => nuevos.find((p) => p.model === m);
  const setup = [
    { label: "iPhone 17 Pro", product: nuevos.find((p) => p.model === "iphone-17-pro" && p.color === "Cosmic Orange") },
    { label: "MacBook Air", product: first("macbook-air-15") },
    { label: "iPad Pro", product: first("ipad-pro-m5") },
    { label: "Apple Watch", product: first("apple-watch-series-11") },
    { label: "AirPods", product: first("airpods-4-anc") },
    { label: "JBL Boombox 4", product: products.find((p) => p.brand === "JBL") },
    { label: "DJI Mic Mini", product: products.find((p) => p.brand === "DJI") },
    { label: "Anker Power Bank", product: products.find((p) => p.brand === "Anker") },
    { label: "Joystick PS5", product: products.find((p) => p.category === "gaming") },
  ];

  return (
    <>
      <Hero variants={byModel("iphone-17-pro")} />
      <FeaturedIphone variants={byModel("iphone-17-pro-max")} />
      <CategoryStrip categories={categories} />
      <IphoneSection groups={iphoneGroups} />
      <SemiNuevos items={semi} />
      <MacSection groups={macGroups} />
      <IpadSection groups={ipadGroups} />
      <WatchSection variants={watch} />
      <Accessories items={accessories} />
      <TechSetup tiles={setup} />
      <Brands />
      <Trust />
      <WhatsAppCTA />
    </>
  );
}
