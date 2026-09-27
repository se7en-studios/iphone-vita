import type { ReactNode } from "react";
import { getProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StoreSettingsProvider } from "@/components/StoreSettings";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Reveal } from "@/components/Reveal";

/** Chrome de la tienda: todo lo público. El panel /admin queda afuera. */
export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings(),
  ]);
  return (
    <StoreSettingsProvider settings={settings}>
      <CartProvider products={products}>
        <AnnouncementBar />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppFloat />
        <Reveal />
      </CartProvider>
    </StoreSettingsProvider>
  );
}
