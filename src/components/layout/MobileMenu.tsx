"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '../../store/uiStore';
import { triggerHaptic } from '@/lib/haptics';
import logo from '../../assets/logo.png';

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  const handleClose = () => {
    triggerHaptic('light');
    closeMobileMenu();
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[500] liquid-glass flex flex-col pt-24 px-10 pb-12 rounded-t-[3rem]"
        >
          <button 
            onClick={handleClose} 
            className="absolute top-8 right-8 p-3 bg-foreground/5 rounded-full"
          >
            <X className="w-8 h-8 text-foreground" />
          </button>
          
          <div className="mb-20">
            <img src={typeof logo === 'string' ? logo : logo.src} alt="Wearition" className="h-20 w-auto object-contain brightness-110 contrast-125 dark:brightness-125" />
          </div>
          
          <nav className="flex flex-col gap-10 text-4xl font-serif mb-auto">
            <Link href="/" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group text-foreground">
              <span>Home</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>
            <Link href="/shop" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group text-foreground">
              <span>Collections</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>
            <Link href="/about" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group text-foreground">
              <span>Heritage</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>
            <Link href="/contact" onClick={handleClose} className="hover:text-accent transition-colors flex items-center justify-between group text-foreground">
              <span>Concierge</span>
              <span className="text-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">→</span>
            </Link>

            <Link href="/track-order" onClick={handleClose} className="mt-6 border border-foreground/20 text-foreground/90 py-5 rounded-full text-center font-sans text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-foreground hover:text-background transition-all">
              Track Order
            </Link>
          </nav>

          <div className="flex flex-col gap-8 text-[10px] uppercase tracking-[0.3em] mt-12 pt-12 border-t border-foreground/10 text-foreground/60">
            <div className="flex justify-between items-center">
              <Link href="/wishlist" onClick={handleClose} className="active:text-accent hover:text-accent transition-colors">Wishlist</Link>
              <Link href="/account" onClick={handleClose} className="active:text-accent hover:text-accent transition-colors">Account</Link>
            </div>
            <p className="text-center text-foreground/20">Maison Wearition &copy; 2026</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
