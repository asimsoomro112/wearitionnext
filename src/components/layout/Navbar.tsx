"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { triggerHaptic } from '@/lib/haptics';
import logo from '../../assets/navbar_logo.png';

export function Navbar() {
  const { openCart, openMobileMenu, toggleSearch } = useUIStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleMenu = () => {
    triggerHaptic('light');
    openMobileMenu();
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 pointer-events-auto"
    >
      {/* Brand Logo - XODEX style Left Anchor */}
      <Link href="/" className="flex items-center gap-3 group z-50">
        <img
          src={typeof logo === 'string' ? logo : logo.src}
          alt="WEARITION"
          className="h-8 md:h-10 w-auto object-contain brightness-125 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Center Micro Navigation (Desktop) */}
      <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] font-mono font-medium text-white/60">
        <Link href="/shop" className="hover:text-white transition-colors">
          Archive
        </Link>
        <Link href="/brands" className="hover:text-white transition-colors">
          Brands
        </Link>
        <Link href="/editorial" className="hover:text-white transition-colors">
          Couture
        </Link>
        <Link href="/about" className="hover:text-white transition-colors">
          Studio
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          Contact
        </Link>
      </nav>

      {/* Right Actions & Signature XODEX MENU Pill */}
      <div className="flex items-center gap-3 md:gap-5 z-50">
        {/* Search */}
        <button
          onClick={toggleSearch}
          aria-label="Search"
          className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          aria-label="Wishlist"
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <Heart className="w-4 h-4" />
        </Link>

        {/* Cart Drawer Trigger */}
        <button
          onClick={openCart}
          aria-label="Shopping Bag"
          className="relative p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
              {cartCount}
            </span>
          )}
        </button>

        {/* XODEX Menu Pill */}
        <button
          onClick={handleToggleMenu}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl hover:bg-white hover:text-black transition-all duration-300 text-white cursor-pointer group"
        >
          <span className="text-[11px] font-mono font-semibold tracking-[0.22em] uppercase">MENU</span>
        </button>
      </div>
    </motion.header>
  );
}
