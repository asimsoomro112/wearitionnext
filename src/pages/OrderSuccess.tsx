import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SEO } from '../components/layout/SEO';

export function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || 'WR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="w-full min-h-screen pt-40 px-6 pb-32 bg-background flex flex-col items-center justify-center text-center">
      <SEO title="Order Confirmed" description="Thank you for your order at WEARITION." />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/20">
          <Check className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-foreground mb-6">
          Order Confirmed!
        </h1>

        <p className="text-foreground/60 text-sm font-sans mb-8 leading-relaxed px-4">
          Thank you for your order. We're preparing your premium selection for dispatch from our atelier. 
          A confirmation email has been sent to your inbox.
        </p>

        <div className="bg-foreground/[0.03] border border-white/5 p-6 rounded-2xl mb-12 inline-block px-10">
          <p className="text-[10px] uppercase tracking-widest text-foreground/40 mb-2">Order Tracking ID</p>
          <p className="text-lg font-mono font-bold text-accent tracking-wider">{orderId}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-12 py-4 bg-foreground text-background text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 rounded-sm"
          >
            Continue Shopping
          </Link>
          <Link
            to="/account"
            className="w-full sm:w-auto px-12 py-4 border border-foreground/10 text-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-all duration-300 rounded-sm"
          >
            My Account
          </Link>
        </div>

        <p className="mt-12 text-[10px] uppercase tracking-[0.2em] text-foreground/30 font-sans">
          WEARITION — LUXURY REIMAGINED
        </p>
      </motion.div>
    </div>
  );
}
