"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore, getCartSubtotal } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';
import { getOptimizedImage } from '../../lib/images';

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity } = useCartStore();
  const subtotal = getCartSubtotal(items);
  const router = useRouter();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#070707] border-l border-white/10 z-[500] flex flex-col pt-7 pb-8 text-white shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 flex justify-between items-center mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <h2 className="font-serif tracking-[0.2em] uppercase text-xl text-white">Your Bag</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] tracking-widest font-mono bg-white/10 text-white border border-white/15">
                  {items.reduce((total, i) => total + i.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={closeCart}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group"
                aria-label="Close cart"
              >
                <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto px-8 hide-scrollbar flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-4 py-16">
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/20 mb-2">
                    <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <p className="uppercase text-[11px] tracking-[0.25em] text-white/60">Your atelier bag is empty</p>
                  <p className="text-xs text-white/40 max-w-[260px] text-center font-sans">
                    Explore our curated drops to acquire exclusive haute couture silhouettes.
                  </p>
                  <button 
                    onClick={() => {
                      closeCart();
                      router.push('/shop');
                    }} 
                    className="mt-6 px-8 py-3.5 bg-white text-black hover:bg-white/80 transition-colors uppercase text-[10px] tracking-[0.22em] font-semibold rounded-full shadow-lg"
                  >
                    Discover Collections ↗
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-5 border-b border-white/5 pb-6">
                    <div className="w-24 h-32 bg-neutral-900 border border-white/10 overflow-hidden rounded-sm flex-shrink-0">
                      <img src={getOptimizedImage(item.image)} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1.5">
                        <Link href={`/product/${item.id}`} onClick={closeCart} className="font-sans font-medium uppercase tracking-wide text-xs text-white hover:text-white/70 transition-colors pr-2 line-clamp-1">
                          {item.title}
                        </Link>
                        <button 
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="text-white/30 hover:text-white transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-auto text-[10px] tracking-wider text-white/50 font-sans">
                        {item.size && (
                          <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03]">
                            SIZE: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03]">
                            {item.color}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-white/15 bg-white/[0.02] rounded-full text-xs overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                            className="px-2.5 py-1.5 hover:bg-white/15 transition-colors text-white/70 hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 font-mono text-[11px] text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                            className="px-2.5 py-1.5 hover:bg-white/15 transition-colors text-white/70 hover:text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-mono text-sm font-medium text-white">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer & Checkout */}
            {items.length > 0 && (
              <div className="px-8 mt-auto pt-6 pb-6 border-t border-white/10 bg-[#070707]">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="uppercase text-[10px] tracking-[0.25em] text-white/50">Subtotal</span>
                  <span className="font-mono text-xl font-medium text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 mb-6 bg-white/[0.02] border border-white/5 px-3 py-2 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Complimentary express courier & custom packaging</span>
                </div>
                <button 
                  onClick={() => {
                    closeCart();
                    router.push('/checkout');
                  }} 
                  className="w-full bg-white text-black py-4 uppercase text-[10px] tracking-[0.25em] font-bold hover:bg-white/90 hover:scale-[1.01] transition-all duration-300 shadow-2xl rounded-full"
                >
                  Proceed to Checkout ↗
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
