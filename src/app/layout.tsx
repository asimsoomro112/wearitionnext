import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WEARITION — Wear Your Identity",
    template: "%s | WEARITION",
  },
  description: "Premium luxury fashion from Pakistan. Discover curated collections designed for the modern visionary.",
  metadataBase: new URL("https://wearition.store"),
  openGraph: {
    title: "WEARITION — Wear Your Identity",
    description: "Premium luxury fashion from Pakistan. Curated collections from elite designers.",
    url: "https://wearition.store",
    siteName: "WEARITION",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "WEARITION Luxury Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WEARITION — Wear Your Identity",
    description: "Premium luxury fashion from Pakistan.",
    images: ["/opengraph-image.png"],
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
      <body className={`${cinzel.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
