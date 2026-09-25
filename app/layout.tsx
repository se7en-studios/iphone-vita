import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Cinzel } from "next/font/google";
import "./globals.css";
import { getProducts } from "@/lib/products";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/Navbar";
import { BenefitsMarquee } from "@/components/BenefitsMarquee";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Reveal } from "@/components/Reveal";

const serifFont = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

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
    images: ["/images/showcase/iphone-17-pro.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050b18",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const products = await getProducts();
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable} ${serifFont.variable}`}>
      <body className="bg-[#050b18] text-white">
        <CartProvider products={products}>
          <BenefitsMarquee />
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
