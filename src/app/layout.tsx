import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { CartProvider } from "@/components/cart/cart-provider";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Flamencalia — Larga vida a tu Flamenca",
  description:
    "Marketplace de moda flamenca: vestidos de flamenca, mantones, flores, complementos y más. Compra a diseñadores y a la comunidad flamenca.",
  keywords: [
    "flamenca",
    "vestidos de flamenca",
    "mantones",
    "feria de abril",
    "moda flamenca",
    "complementos flamencos",
  ],
  openGraph: {
    title: "Flamencalia — Larga vida a tu Flamenca",
    description:
      "Compra y vende vestidos de flamenca, mantones, complementos y más en la comunidad flamenca.",
    siteName: "Flamencalia",
    locale: "es_ES",
    type: "website",
    url: "https://www.flamencalia.com",
    images: [
      {
        url: "https://www.flamencalia.com/cliente/abanico-og.png",
        width: 512,
        height: 512,
        alt: "Flamencalia — Moda Flamenca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flamencalia — Larga vida a tu Flamenca",
    description:
      "Marketplace de moda flamenca. Compra, vende y dale larga vida a tu flamenca.",
    images: ["https://www.flamencalia.com/cliente/abanico-og.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flamencalia",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="icon"
          href="/cliente/favicon-32.png"
          type="image/png"
          sizes="32x32"
        />
        <link rel="icon" href="/cliente/Abanico.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/cliente/apple-touch-icon.png" />
        <meta name="theme-color" content="#c8102e" />
      </head>
      <body className="min-h-full flex flex-col bg-flamencalia-cream text-foreground">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <CartProvider>
          {children}
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
