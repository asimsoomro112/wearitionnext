"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, Package } from 'lucide-react';
import { SEO } from '../components/layout/SEO';

export function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'WR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="w-full min-h-screen pt-36 md:pt-44 px-6 pb-32 bg-[#050505] text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
      <SEO title="Order Confirmed" description="Thank you for your order at WEARITION." />
      
      {/* Background glow */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-white/[0.05] border border-white/15 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Check className="w-7 h-7 text-white stroke-[2]" />
          </div>

          <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-white/40 mb-3">
            [01] • CONSIGNMENT CONFIRMED
          </p>

          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight text-white mb-4">
            Acquisition Secured
          </h1>

          <p className="text-white/60 text-xs font-sans mb-8 leading-relaxed px-2">
            Your couture selection has entered our atelier preparation queue. A comprehensive receipt and manifest confirmation has been dispatched to your email.
          </p>

          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm mb-10 w-full">
            <p className="text-[9px] uppercase font-mono tracking-[0.25em] text-white/40 mb-2">Consignment Tracking ID</p>
            <p className="text-lg font-mono font-bold text-white tracking-widest">{orderId}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href={`/track-order?id=${orderId}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-accent text-white text-[10px] uppercase font-mono tracking-[0.25em] font-semibold hover:bg-[#3ab0ad] transition-all rounded-full shadow-xl flex items-center justify-center gap-2"
            >
              <span>Track Consignment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/15 text-white/80 hover:text-white hover:border-white/30 text-[10px] uppercase font-mono tracking-[0.25em] font-medium transition-all rounded-full"
            >
              Browse Atelier
            </Link>
          </div>
        </div>

        <p className="mt-8 text-[9px] uppercase font-mono tracking-[0.3em] text-white/30">
          WEARITION — LUXURY REIMAGINED
        </p>
      </motion.div>
    </div>
  );
}
