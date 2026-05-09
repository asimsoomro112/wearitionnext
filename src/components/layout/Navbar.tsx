"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, User, Heart, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { MobileMenu } from './MobileMenu';
import { triggerHaptic } from '@/lib/haptics';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import logo from '../../assets/navbar_logo.png';

export function Navbar() {
  const { openCart, openMobileMenu, isDarkMode, toggleDarkMode, toggleSearch } = useUIStore();
  const { items } = useCartStore();
  const [showBrands, setShowBrands] = useState(false);
  const [dynamicBrands, setDynamicBrands] = useState<string[]>([]);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const q = query(collection(db, "products"), where("isPublished", "==", true));
        const snap = await getDocs(q);
        const brands = new Set<string>();
        snap.docs.forEach(doc => {
          const b = doc.data().brand;
          if (b) brands.add(b);
        });
        setDynamicBrands(Array.from(brands).sort());
      } catch (e) {
        console.error("Error fetching brands for navbar", e);
      }
    }
    fetchBrands();
  }, []);

  const handleToggleMenu = () => {
    triggerHaptic('light');
    openMobileMenu();
  };

  const handleToggleTheme = () => {
    triggerHaptic('medium');
    toggleDarkMode();
  };

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 liquid-glass text-foreground border-none m-4 rounded-2xl shadow-2xl"
      >
        <div className="flex items-center gap-6">
          <Link href="/shop" className="hidden md:block uppercase text-xs tracking-widest md:hover:opacity-70 transition-opacity">Shop</Link>
          <Link href="/shop" className="hidden md:block uppercase text-xs tracking-widest md:hover:opacity-70 transition-opacity">Collections</Link>
          
          <div className="relative hidden md:block">
            <button 
              onClick={() => setShowBrands(!showBrands)}
              onMouseEnter={() => setShowBrands(true)}
              className="uppercase text-xs tracking-widest md:hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              Brands <ChevronDown className={`w-3 h-3 transition-transform ${showBrands ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showBrands && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setShowBrands(false)}
                  className="absolute top-full left-0 mt-4 p-6 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl grid grid-cols-2 gap-x-12 gap-y-3 min-w-[400px]"
                >
                  {dynamicBrands.length > 0 ? (
                    dynamicBrands.map(brand => (
                      <Link 
                        key={brand}
                        href={`/brands?brand=${brand.toLowerCase()}`}
                        onClick={() => setShowBrands(false)}
                        className="text-[10px] uppercase tracking-widest text-foreground/60 hover:text-accent transition-colors"
                      >
                        {brand}
                      </Link>
                    ))
                  ) : (
                    <span className="col-span-2 text-[10px] text-foreground/20 italic">Curating brands...</span>
                  )}
                  <div className="col-span-2 pt-4 border-t border-white/5 mt-2">
                    <Link href="/brands" onClick={() => setShowBrands(false)} className="text-[9px] uppercase tracking-[0.3em] text-accent font-bold hover:opacity-70">View All Brands —&gt;</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button className="md:hidden active:opacity-70" onClick={handleToggleMenu}>
            <Menu className="w-6 h-6" />
          </button>
          
          <button onClick={handleToggleTheme} className="md:hover:opacity-70 transition-opacity md:hover:text-accent">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <img src={typeof logo === 'string' ? logo : logo.src} alt="Wearition" className="h-16 md:h-24 w-auto object-contain brightness-110" />
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <button className="md:hover:text-accent active:text-accent" onClick={toggleSearch}><Search className="w-5 h-5" /></button>
          <Link href="/account" className="hidden md:block md:hover:text-accent"><User className="w-5 h-5" /></Link>
          <Link href="/wishlist" className="md:hover:text-accent active:text-accent"><Heart className="w-5 h-5" /></Link>
          <button className="relative md:hover:text-accent active:text-accent" onClick={openCart}>
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-foreground text-background text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </motion.header>
      <MobileMenu />
    </>
  );
}
