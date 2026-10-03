"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCartStore, getCartSubtotal } from "@/store/cartStore";
import { formatCurrency } from "@/lib/currency";
import { SEO } from "@/components/layout/SEO";

const FREE_SHIPPING_THRESHOLD = 10000;
const SHIPPING_FLAT = 250;

export function Cart() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const subtotal = getCartSubtotal(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="w-full pt-36 md:pt-44 px-6 md:px-12 pb-32 bg-[#030303] text-[#fafafa] min-h-screen">
      <SEO
        title="Shopping Bag"
        description="Review your WEARITION shopping bag and proceed to secure checkout."
      />

      <div className="max-w-[1100px] mx-auto">
        <header className="mb-12 md:mb-16">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#adadad] block mb-4">
            [01] — Your Bag
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white">
            Shopping Bag
          </h1>
          {itemCount > 0 && (
            <p className="text-sm font-mono text-white/40 mt-4">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-white/10 rounded-xl bg-[#0a0a0a]">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/30 mb-6">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-white mb-3">Your bag is empty</h2>
            <p className="text-sm text-white/40 font-sans mb-8 max-w-xs">
              Discover our curated collection of premium Pakistani designer suits.
            </p>
            <Link href="/shop" className="buttonprimary">
              <span>START SHOPPING ↗</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
            {/* Items */}
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-5 p-4 rounded-xl border border-white/10 bg-[#0a0a0a]"
                >
                  <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-lg overflow-hidden bg-white/5 shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-serif text-base sm:text-lg text-white leading-snug">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="text-white/30 hover:text-white transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {(item.size || item.color) && (
                      <p className="text-[11px] text-white/40 font-sans mt-1">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    <div className="flex justify-between items-end mt-auto pt-4">
                      <div className="flex items-center border border-white/15 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-mono text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-mono text-base font-medium text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Link
                href="/shop"
                className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors mt-2"
              >
                ← Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <aside className="h-fit p-7 rounded-xl border border-white/10 bg-[#0a0a0a] lg:sticky lg:top-32">
              <h2 className="font-serif text-xl text-white mb-6">Order Summary</h2>

              <div className="flex flex-col gap-3 text-sm font-sans mb-6">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span className="font-mono text-white">
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                  <span className="text-white font-medium">Total</span>
                  <span className="font-mono text-xl font-medium text-white">{formatCurrency(total)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10 mb-6">
                  <Truck className="w-4 h-4 text-[#339e9b] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for FREE shipping.
                  </p>
                </div>
              )}

              <Link href="/checkout" className="buttonprimary w-full mb-3">
                <span className="flex items-center justify-center gap-2">
                  PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <p className="text-[10px] text-white/30 text-center font-sans leading-relaxed">
                Cash on Delivery available · EasyPaisa · JazzCash · Bank Transfer
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
