"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, User, LayoutGrid, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { triggerHaptic } from '@/lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function MobileBottomBar() {
  const pathname = usePathname();
  const { openCart, closeCart, closeSearch } = useUIStore();
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
        console.error("Error fetching brands for mobile bar", e);
      }
    }
    fetchBrands();
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleAction = (callback?: () => void) => {
    triggerHaptic('light');
    closeSearch(); 
    closeCart();   
    setShowBrands(false);
    if (callback) callback();
  };

  const toggleBrands = () => {
    triggerHaptic('medium');
    setShowBrands(!showBrands);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[400px]">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass rounded-[2rem] px-4 py-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/10 relative"
        >
          <Link 
            href="/" 
            onClick={() => handleAction()}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${isActive('/') ? 'text-accent bg-white/5' : 'text-foreground/40'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Home</span>
          </Link>
          
          <button 
            onClick={toggleBrands} 
            className={`flex flex-col items-center justify-center py-2 px-3 transition-all ${showBrands ? 'text-accent bg-white/5 rounded-2xl' : 'text-foreground/40 active:text-accent'}`}
          >
            {showBrands ? <X className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Brands</span>
          </button>

          <Link 
            href="/wishlist" 
            onClick={() => handleAction()}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${isActive('/wishlist') ? 'text-accent bg-white/5' : 'text-foreground/40'}`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Saved</span>
          </Link>

          <button 
            onClick={() => handleAction(openCart)} 
            className="flex flex-col items-center justify-center py-2 px-3 text-foreground/40 active:text-accent relative"
          >
            <ShoppingBag className="w-5 h-4" />
            <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Bag</span>
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-2 bg-accent text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-lg"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <Link 
            href="/account" 
            onClick={() => handleAction()}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${isActive('/account') ? 'text-accent bg-white/5' : 'text-foreground/40'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[8px] mt-1 uppercase tracking-[0.2em] font-bold">Me</span>
          </Link>
        </motion.div>
      </div>

      <AnimatePresence>
        {showBrands && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="md:hidden fixed bottom-28 left-1/2 -translate-x-1/2 z-[99] w-[92%] max-w-[400px] bg-background/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden"
          >
            <div className="text-center mb-6">
              <span className="text-accent text-[8px] uppercase tracking-[0.4em] font-bold mb-2 block">Luxury Houses</span>
              <h3 className="font-serif text-xl text-foreground uppercase tracking-widest">Select Brand</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
              {dynamicBrands.length > 0 ? (
                dynamicBrands.map((brand) => (
                  <Link
                    key={brand}
                    href={`/brands?brand=${brand.toLowerCase()}`}
                    onClick={() => setShowBrands(false)}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl text-center text-[10px] uppercase tracking-widest text-foreground/80 hover:text-accent hover:border-accent/30 transition-all active:scale-95"
                  >
                    {brand}
                  </Link>
                ))
              ) : (
                <div className="col-span-2 text-center py-10 text-[10px] text-foreground/20 italic">No brands found.</div>
              )}
              <Link 
                href="/brands"
                onClick={() => setShowBrands(false)}
                className="col-span-2 p-4 bg-accent/10 border border-accent/20 rounded-xl text-center text-[10px] uppercase tracking-widest text-accent font-bold mt-2"
              >
                View All Brands —&gt;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
