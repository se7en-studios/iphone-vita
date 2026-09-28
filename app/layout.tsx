import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://iphone-vita.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "iPhone Vita · Tu próxima tecnología",
    template: "%s · iPhone Vita",
  },
  description:
    "iPhone nuevos sellados y semi nuevos, MacBook, iPad, Apple Watch, AirPods y accesorios. Garantía oficial, aceptamos pesos y enviamos a todo el país.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "iPhone Vita",
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
  name: "iPhone Vita",
  url: SITE,
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
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
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
