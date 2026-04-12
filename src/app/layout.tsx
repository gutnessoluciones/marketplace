import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { CartProvider } from "@/components/cart/cart-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
        <link rel="icon" href="/cliente/Abanico.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#c8102e" />
      </head>
      <body className="min-h-full flex flex-col bg-flamencalia-cream text-foreground">
        <CartProvider>
          {children}
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
