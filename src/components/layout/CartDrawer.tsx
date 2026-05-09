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
            className="fixed inset-0 bg-background-secondary/60 backdrop-blur-sm z-[150]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-background border-l border-white/10 z-[150] flex flex-col pt-6 pb-8 text-foreground"
          >
            <div className="px-8 flex justify-between items-center mb-10 mt-4">
              <h2 className="font-serif tracking-widest uppercase text-2xl text-foreground">Your Bag</h2>
              <button 
                onClick={closeCart}
                className="p-2 hover:text-accent hover:rotate-90 transition-all duration-300"
              >
                <X className="w-6 h-6" strokeWidth={1} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto px-8 hide-scrollbar flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/50 space-y-4">
                  <ShoppingBag className="w-12 h-12 mb-4" strokeWidth={1} />
                  <p className="uppercase text-xs tracking-[0.2em]">Your bag is empty</p>
                  <button onClick={closeCart} className="mt-8 px-10 py-4 border border-foreground/30 hover:border-foreground transition-colors uppercase text-xs tracking-[0.2em] text-foreground rounded-full">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-6 border-b border-white/5 pb-8 mb-4">
                    <div className="w-28 h-36 bg-background-secondary overflow-hidden">
                      <img src={getOptimizedImage(item.image)} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/product/${item.id}`} onClick={closeCart} className="font-sans font-medium uppercase tracking-wide text-sm hover:text-accent transition-colors pr-4">
                          {item.title}
                        </Link>
                        <button 
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="text-foreground/40 hover:text-foreground transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-foreground/50 text-xs mb-auto flex gap-3 font-sans">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-foreground/20 text-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                            className="px-3 py-2 hover:bg-white/10 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 font-sans">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                            className="px-3 py-2 hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-sans text-sm">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-8 mt-auto pt-8 pb-24 md:pb-8 border-t border-white/10 bg-background">
                <div className="flex justify-between items-end mb-6">
                  <span className="uppercase text-xs tracking-[0.2em] text-foreground/60">Subtotal</span>
                  <span className="font-sans text-xl">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-foreground/40 mb-8 text-center font-sans tracking-wide">Shipping, taxes, and discounts calculated at checkout.</p>
                <button onClick={() => {
                  closeCart();
                  router.push('/checkout');
                }} className="w-full bg-foreground text-background py-5 uppercase text-xs tracking-[0.2em] font-medium hover:bg-accent transition-colors shadow-xl rounded-full">
                  Checkout Securely
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
