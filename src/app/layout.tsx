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
  metadataBase: new URL("https://www.wearition.store"),
  // NO global canonical: a single hardcoded canonical here made EVERY page
  // (including all product pages) declare the homepage as its canonical URL
  // (QA SEV-2, 2026-10-22). Pages without their own canonical simply emit
  // none and search engines use the real URL; product pages set theirs in
  // generateMetadata.
  openGraph: {
    title: "WEARITION — Wear Your Identity | Branded Suits Online in Pakistan",
    description: "Shop the latest branded suits from Pakistan's top fashion houses. New collections with cash on delivery and nationwide shipping.",
    url: "https://www.wearition.store",
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
        {/* Site-wide structured data (QA SEV-3): Organization + WebSite with
            the shop's real search endpoint. Facts only — the store's own
            published links. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'WEARITION',
                  url: 'https://www.wearition.store',
                  logo: 'https://wearition.store/logo.png',
                  sameAs: [
                    'https://www.instagram.com/_wearition',
                    'https://www.facebook.com/profile.php?id=61589494648557',
                    'https://www.tiktok.com/@wearition3',
                  ],
                },
                {
                  '@type': 'WebSite',
                  name: 'WEARITION',
                  url: 'https://www.wearition.store',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://www.wearition.store/shop?search={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
