"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Heart, Sun, Moon, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { triggerHaptic } from '@/lib/haptics';
import logo from '../../assets/navbar_logo.png';

const MENU_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/editorial' },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const { openCart, isDarkMode, toggleDarkMode, toggleSearch } = useUIStore();
  const { items } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenMenu = () => {
    triggerHaptic('light');
    setMenuOpen(true);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
      >
        <div className="flex items-center justify-between px-6 py-5 md:px-12 text-white">
          <Link href="/" className="flex items-center" aria-label="Wearition home">
            <img
              src={typeof logo === 'string' ? logo : logo.src}
              alt="Wearition"
              className="h-10 md:h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <div className="flex items-center gap-5 md:gap-7">
            <button
              onClick={toggleSearch}
              aria-label="Search"
              className="hover:opacity-60 transition-opacity"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" aria-label="Account" className="hidden sm:block hover:opacity-60 transition-opacity">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="hover:opacity-60 transition-opacity">
              <Heart className="w-5 h-5" />
            </Link>
            <button
              onClick={openCart}
              aria-label="Cart"
              className="relative hover:opacity-60 transition-opacity"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={handleOpenMenu}
              className="eyebrow hover:opacity-60 transition-opacity ml-1"
            >
              Menu
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] bg-[#030303]/95 backdrop-blur-[200px]"
          >
            {/* faint grid texture */}
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                backgroundSize: '72px 72px',
              }}
            />
            <div className="relative h-full flex flex-col px-6 md:px-12 py-5">
              <div className="flex items-center justify-between text-white">
                <img
                  src={typeof logo === 'string' ? logo : logo.src}
                  alt="Wearition"
                  className="h-10 md:h-12 w-auto object-contain brightness-0 invert"
                />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center gap-2 eyebrow hover:opacity-60 transition-opacity"
                >
                  Close <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col justify-center gap-1 md:gap-2">
                {MENU_LINKS.map((link, i) => (
                  <div key={link.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '110%' }}
                      transition={{ duration: 0.55, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-4 text-white font-display font-bold uppercase leading-[1.05] text-[13vw] md:text-[5.5rem] tracking-tight hover:text-accent transition-colors duration-300"
                      >
                        <span className="text-sm md:text-base font-sans font-normal text-white/30 tracking-[0.2em]">
                          0{i + 1}
                        </span>
                        {link.label}
                        <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between text-white/50 text-xs uppercase tracking-[0.18em]"
              >
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    toggleDarkMode();
                  }}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'Light mode' : 'Dark mode'}
                </button>
                <span className="hidden md:block">Wear your identity</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
