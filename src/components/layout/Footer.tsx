'use client';

import Link from 'next/link';
import logo from '../../assets/navbar_logo.png';

export function Footer() {
  return (
    <footer className="relative w-full bg-[#030303] text-[#fafafa] pt-20 pb-8 px-6 sm:px-12 md:px-16 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Top Split Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 sm:gap-16 pb-16 border-b border-white/10">
          {/* Left: Brand Identity & Primary Links */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <img
                src={typeof logo === 'string' ? logo : logo.src}
                alt="WEARITION"
                className="h-9 sm:h-11 w-auto object-contain brightness-125"
              />
            </Link>

            <p className="text-xs sm:text-sm font-sans text-[#adadad] leading-relaxed max-w-md">
              Maison WEARITION &mdash; Curators of bespoke women&apos;s haute couture, heritage craftsmanship, and certified luxury designer collections.
            </p>

            <nav className="flex flex-wrap lg:flex-nowrap gap-x-6 xl:gap-x-8 gap-y-3 text-xs uppercase font-mono tracking-[0.2em] font-medium text-white/70">
              <Link href="/" className="hover:text-white transition-colors">
                HOME
              </Link>
              <Link href="/shop" className="hover:text-white transition-colors">
                ARCHIVE
              </Link>
              <Link href="/brands" className="hover:text-white transition-colors">
                BRANDS
              </Link>
              <Link href="/editorial" className="hover:text-white transition-colors">
                COUTURE
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                STUDIO
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                CONTACT
              </Link>
            </nav>
          </div>

          {/* Right: Direct Email, Origin & Channels */}
          <div className="flex flex-col gap-6 lg:text-right">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#adadad] block mb-2">
                [DIRECT ATELIER INQUIRIES &bull; KARACHI, PK]
              </span>
              <a
                href="mailto:wearition.80@gmail.com"
                className="text-lg sm:text-2xl md:text-3xl font-display font-medium text-white hover:underline transition-all block tracking-tight"
              >
                WEARITION.80@GMAIL.COM
              </a>
            </div>

            <div className="flex flex-wrap lg:justify-end gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em] text-[#adadad] font-mono pt-2">
              <a
                href="https://www.instagram.com/_wearition?igsh=eG5obHgydGc3a2Vr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram ↗
              </a>
              <a
                href="https://www.tiktok.com/@wearition3?_r=1&_t=ZS-96Byntwejln"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                TikTok ↗
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61589494648557"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook ↗
              </a>
              <Link href="/track-order" className="hover:text-white transition-colors">
                Track Order
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Utility Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase font-mono tracking-[0.25em] text-[#adadad] py-8 gap-4 border-b border-white/5">
          <span>&copy; 2026 WEARITION. ALL RIGHTS RESERVED.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/shipping" className="hover:text-white transition-colors">
              Shipping Policy
            </Link>
            <Link href="/returns" className="hover:text-white transition-colors">
              Returns &amp; Exchanges
            </Link>
          </div>
        </div>

        {/* Giant Viewport-Width Typographic Watermark (XODEX footerwordmark) */}
        <div className="w-full text-center overflow-hidden pt-10 select-none pointer-events-none">
          <span 
            className="block font-light uppercase tracking-[0.08em] text-white/[0.10] text-[11vw] leading-[0.8] whitespace-nowrap"
            style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
          >
            WEARITION
          </span>
        </div>
      </div>
    </footer>
  );
}
