"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '../../store/uiStore';
import { triggerHaptic } from '@/lib/haptics';
import logo from '../../assets/navbar_logo.png';

const navItems = [
  { number: "01", label: "HOME", href: "/" },
  { number: "02", label: "ARCHIVE & SHOP", href: "/shop" },
  { number: "03", label: "DESIGNER BRANDS", href: "/brands" },
  { number: "04", label: "COUTURE & EDITORIAL", href: "/editorial" },
  { number: "05", label: "HERITAGE & STUDIO", href: "/about" },
  { number: "06", label: "CONCIERGE & FITTINGS", href: "/contact" },
  { number: "07", label: "ORDER TRACKING", href: "/track-order" },
];

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleClose = () => {
    triggerHaptic('light');
    closeMobileMenu();
  };

  // Keyboard navigation & ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] bg-[#050505]/98 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-12 md:p-16 overflow-y-auto"
        >
          {/* Top Bar: Brand Logo & Close Pill */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <Link href="/" onClick={handleClose} className="flex items-center gap-3">
              <img
                src={typeof logo === 'string' ? logo : logo.src}
                alt="WEARITION"
                className="h-8 md:h-10 w-auto object-contain brightness-125"
              />
              <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
                Menu
              </span>
            </Link>

            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/[0.05] hover:bg-white hover:text-black transition-all duration-300 text-white cursor-pointer group"
            >
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">CLOSE</span>
              <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Central Grid: Giant Numbered Links & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-10 my-auto items-center">
            {/* Primary Navigation Column */}
            <nav className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
              {navItems.map((item, idx) => {
                const isHovered = hoveredIdx === idx;
                const isOtherHovered = hoveredIdx !== null && !isHovered;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClose}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`flex items-center justify-between py-2 sm:py-3 transition-all duration-300 border-b border-white/5 group ${
                      isOtherHovered ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-8">
                      <span className="text-xs sm:text-sm font-mono text-white/40 tracking-wider">
                        [{item.number}]
                      </span>
                      <span className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white group-hover:translate-x-3 transition-transform duration-300">
                        {item.label}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-black group-hover:bg-white group-hover:border-white transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Side Information Column */}
            <div className="lg:col-span-4 flex flex-col gap-8 lg:pl-12 lg:border-l border-white/10 text-white/70">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-2 font-mono">
                  [Inquiries]
                </span>
                <a
                  href="mailto:wearition.80@gmail.com"
                  className="text-base sm:text-lg text-white hover:underline transition-all block font-light"
                >
                  wearition.80@gmail.com
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-2 font-mono">
                  [Atelier Concierge]
                </span>
                <p className="text-sm text-white/80 leading-relaxed font-light">
                  Mon — Sat: 10:00 - 20:00 PKT<br />
                  Bespoke fittings by appointment.
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-3 font-mono">
                  [Client Portal]
                </span>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em]">
                  <Link href="/account" onClick={handleClose} className="hover:text-white transition-colors">
                    Account
                  </Link>
                  <Link href="/wishlist" onClick={handleClose} className="hover:text-white transition-colors">
                    Wishlist
                  </Link>
                  <Link href="/shipping" onClick={handleClose} className="hover:text-white transition-colors">
                    Shipping
                  </Link>
                  <Link href="/returns" onClick={handleClose} className="hover:text-white transition-colors">
                    Returns
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Ribbon */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.25em] text-white/40 gap-3">
            <span>Maison WEARITION &copy; 2026</span>
            <span>Wear Your Identity</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
