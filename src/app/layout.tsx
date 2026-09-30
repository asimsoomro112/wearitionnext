import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "WEARITION — Wear Your Identity | Luxury Fashion Atelier & Designer Resale",
    template: "%s | WEARITION",
  },
  description: "Pakistan's premier luxury fashion atelier & authenticated designer resale. Discover bespoke bridal couture, hand-embroidered zardozi ensembles, and curated archival drops from revered Pakistani design houses.",
  keywords: [
    "WEARITION",
    "luxury fashion Pakistan",
    "Pakistani designer clothes",
    "bespoke bridal couture",
    "designer resale Pakistan",
    "Faraz Manan",
    "Elan",
    "Sana Safinaz",
    "Maria B",
    "Hussain Rehar",
    "Zara Shahjahan",
    "preloved couture Pakistan",
    "Karachi atelier",
    "zardozi bridal lehenga"
  ],
  authors: [{ name: "Maison WEARITION" }],
  creator: "WEARITION",
  publisher: "WEARITION",
  metadataBase: new URL("https://wearition.store"),
  alternates: {
    canonical: "https://wearition.store",
  },
  openGraph: {
    title: "WEARITION — Wear Your Identity | Luxury Fashion Atelier & Designer Resale",
    description: "Pakistan's premier luxury fashion atelier & authenticated designer resale. Curated bridal couture and archival drops.",
    url: "https://wearition.store",
    siteName: "WEARITION",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://wearition.store/logo.png",
        width: 1200,
        height: 630,
        alt: "WEARITION Luxury Fashion Atelier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WEARITION — Wear Your Identity",
    description: "Pakistan's premier luxury fashion atelier & authenticated designer resale.",
    images: ["https://wearition.store/logo.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${cinzel.variable} ${inter.variable} font-sans bg-[#030303] text-[#fafafa] antialiased selection:bg-white selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
