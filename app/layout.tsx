import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { getProducts } from "@/lib/products";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Reveal } from "@/components/Reveal";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iphonevita.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "iPhone Vita · Tu próxima tecnología", template: "%s · iPhone Vita" },
  description: "iPhone nuevos y semi nuevos, MacBook, iPad, Apple Watch, AirPods y accesorios. Apple y tecnología premium en un solo lugar.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "iPhone Vita",
    title: "iPhone Vita · Tu próxima tecnología",
    description: "Apple, accesorios y tecnología premium. Todo en un solo lugar.",
    images: ["/images/iphone-pro-cosmic-orange.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const products = await getProducts();
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <CartProvider products={products}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
          <Reveal />
        </CartProvider>
      </body>
    </html>
  );
}
