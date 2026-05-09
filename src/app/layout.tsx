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
  metadataBase: new URL("https://wearition.vercel.app"),
  openGraph: {
    title: "WEARITION — Wear Your Identity",
    description: "Premium luxury fashion from Pakistan.",
    url: "https://wearition.vercel.app",
    siteName: "WEARITION",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WEARITION — Wear Your Identity",
    description: "Premium luxury fashion from Pakistan.",
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
