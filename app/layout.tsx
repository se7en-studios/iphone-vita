import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { OPEN_GRAPH_BASE, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "iPhone Vita · Tu próxima tecnología",
    template: "%s · iPhone Vita",
  },
  description:
    "iPhone nuevos sellados y semi nuevos, MacBook, iPad, Apple Watch, AirPods y accesorios. Garantía oficial, aceptamos pesos y enviamos a todo el país.",
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: "iPhone Vita · Tu próxima tecnología",
    description:
      "iPhone sellados con garantía oficial, semi nuevos revisados y accesorios. Aceptamos pesos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone Vita · Tu próxima tecnología",
    description:
      "iPhone sellados con garantía oficial, semi nuevos revisados y accesorios. Aceptamos pesos.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Tienda de tecnología premium: iPhone nuevos y semi nuevos, Mac, iPad, Apple Watch, AirPods y accesorios.",
  sameAs: ["https://www.instagram.com/iphone_vita/"],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body className="bg-bg text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
