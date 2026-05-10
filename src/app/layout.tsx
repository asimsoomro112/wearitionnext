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
        url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200",
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
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200"],
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
