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
        const brandMap = new Map<string, string>();
        snap.docs.forEach(doc => {
          const b = doc.data().brand;
          if (b) {
            const normalized = b.trim().toLowerCase();
            if (!brandMap.has(normalized)) {
              brandMap.set(normalized, b.trim());
            }
          }
        });
        setDynamicBrands(Array.from(brandMap.values()).sort());
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
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[380px]">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-full px-3 py-1.5 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 relative"
        >
          <Link 
            href="/" 
            onClick={() => handleAction()}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all ${
              isActive('/') ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[8px] mt-1 uppercase font-mono tracking-widest font-semibold">Home</span>
          </Link>
          
          <button 
            onClick={toggleBrands} 
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all ${
              showBrands ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
            }`}
          >
            {showBrands ? <X className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            <span className="text-[8px] mt-1 uppercase font-mono tracking-widest font-semibold">Houses</span>
          </button>

          <Link 
            href="/wishlist" 
            onClick={() => handleAction()}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all ${
              isActive('/wishlist') ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-[8px] mt-1 uppercase font-mono tracking-widest font-semibold">Saved</span>
          </Link>

          <button 
            onClick={() => handleAction(openCart)} 
            className="flex flex-col items-center justify-center py-2 px-3 text-white/40 hover:text-white rounded-full relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[8px] mt-1 uppercase font-mono tracking-widest font-semibold">Bag</span>
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-2 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-mono font-bold shadow-lg"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <Link 
            href="/account" 
            onClick={() => handleAction()}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all ${
              isActive('/account') ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[8px] mt-1 uppercase font-mono tracking-widest font-semibold">Patron</span>
          </Link>
        </motion.div>
      </div>

      <AnimatePresence>
        {showBrands && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-[99] w-[92%] max-w-[380px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            <div className="text-center mb-5 pb-3 border-b border-white/5">
              <span className="text-white/40 text-[8px] uppercase font-mono tracking-[0.3em] block mb-1">Curated Couture</span>
              <h3 className="font-serif text-lg text-white uppercase tracking-wider">Design Houses</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5 max-h-[40vh] overflow-y-auto pr-1 hide-scrollbar">
              {dynamicBrands.length > 0 ? (
                dynamicBrands.map((brand) => (
                  <Link
                    key={brand}
                    href={`/brands?brand=${brand.toLowerCase()}`}
                    onClick={() => setShowBrands(false)}
                    className="p-3 bg-white/[0.03] border border-white/5 rounded-sm text-center text-[10px] uppercase font-mono tracking-wider text-white/80 hover:text-white hover:border-white/20 transition-all active:scale-95"
                  >
                    {brand}
                  </Link>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-[10px] text-white/30 font-mono italic">No houses cataloged.</div>
              )}
              <Link 
                href="/brands"
                onClick={() => setShowBrands(false)}
                className="col-span-2 p-3 bg-white text-black rounded-full text-center text-[10px] uppercase font-mono tracking-[0.2em] font-semibold mt-2 hover:bg-white/90 transition-all"
              >
                View All Atelier Houses ↗
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
