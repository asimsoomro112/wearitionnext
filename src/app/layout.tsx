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
    default: "WEARITION — Wear Your Identity | Branded Suits Online in Pakistan",
    template: "%s | WEARITION",
  },
  description: "Shop the latest branded suits from Pakistan's top fashion houses — Maria B, Asim Jofa, Hussain Rehar, Baroque and more. New collections with cash on delivery and nationwide shipping.",
  keywords: [
    "WEARITION",
    "branded suits online Pakistan",
    "Pakistani designer clothes",
    "lawn suits Pakistan",
    "3 piece suits online",
    "Maria B suits",
    "Asim Jofa collection",
    "Sana Safinaz",
    "Hussain Rehar",
    "Baroque suits",
    "women's fashion Pakistan",
    "cash on delivery clothing Pakistan"
  ],
  authors: [{ name: "WEARITION" }],
  creator: "WEARITION",
  publisher: "WEARITION",
  metadataBase: new URL("https://wearition.store"),
  alternates: {
    canonical: "https://wearition.store",
  },
  openGraph: {
    title: "WEARITION — Wear Your Identity | Branded Suits Online in Pakistan",
    description: "Shop the latest branded suits from Pakistan's top fashion houses. New collections with cash on delivery and nationwide shipping.",
    url: "https://wearition.store",
    siteName: "WEARITION",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://wearition.store/logo.png",
        width: 1200,
        height: 630,
        alt: "WEARITION — Branded Suits Online in Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WEARITION — Wear Your Identity",
    description: "Shop the latest branded suits from Pakistan's top fashion houses — cash on delivery, nationwide shipping.",
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
