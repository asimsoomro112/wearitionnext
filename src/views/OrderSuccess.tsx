"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, Package } from 'lucide-react';
import { SEO } from '../components/layout/SEO';
import { useOrderTrackingStore, type Order } from '../store/orderTrackingStore';
import { PAYMENT_RECEIVING, STORE_WHATSAPP_NUMBER } from '@/lib/paymentConfig';

export function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'WR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const getOrder = useOrderTrackingStore(state => state.getOrder);
  const [order, setOrder] = useState<Order | null>(null);

  // Best-effort: show payment next steps for manual online payments.
  // Any failure simply leaves the standard confirmation — the customer
  // must never see a broken success page.
  useEffect(() => {
    let active = true;
    getOrder(orderId)
      .then(o => { if (active && o) setOrder(o); })
      .catch(() => {});
    return () => { active = false; };
  }, [orderId, getOrder]);

  const isOnlinePayment = order && order.paymentMethod && order.paymentMethod !== 'cod';

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
            [01] • ORDER CONFIRMED
          </p>

          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight text-white mb-4">
            Order Confirmed
          </h1>

          <p className="text-white/60 text-xs font-sans mb-8 leading-relaxed px-2">
            Your order is confirmed and is being prepared. A receipt has been sent to your email.
          </p>

          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm mb-10 w-full">
            <p className="text-[9px] uppercase font-mono tracking-[0.25em] text-white/40 mb-2">Order Tracking ID</p>
            <p className="text-lg font-mono font-bold text-white tracking-widest">{orderId}</p>
          </div>

          {isOnlinePayment && order.paymentStatus === 'proof_received' && (
            <div className="bg-accent/[0.06] border border-accent/25 p-6 rounded-sm mb-10 w-full text-left">
              <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-accent mb-2">Payment screenshot received</p>
              <p className="text-white/60 text-xs font-sans leading-relaxed">
                We have your payment screenshot. Once we verify the payment, you will receive a
                confirmation email and your order will move to preparation.
              </p>
            </div>
          )}

          {isOnlinePayment && order.paymentStatus !== 'proof_received' && order.paymentStatus !== 'confirmed' && (
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-sm mb-10 w-full text-left">
              <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-white/50 mb-2">One step left — your payment</p>
              <p className="text-white/60 text-xs font-sans leading-relaxed mb-4">
                Please send <b className="text-white">Rs. {Math.round(order.total || 0).toLocaleString()}</b> to{' '}
                <b className="text-white">{PAYMENT_RECEIVING.walletName} {PAYMENT_RECEIVING.accountNumber}</b>{' '}
                (Account title: {PAYMENT_RECEIVING.accountTitle}) and share the screenshot on WhatsApp.
                Your order is saved — it will be confirmed as soon as we verify the payment.
              </p>
              <a
                href={`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Assalam o Alaikum! I just placed order ${orderId} on WEARITION. Sharing my payment screenshot:`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-6 py-3 bg-accent text-white text-[10px] uppercase font-mono tracking-[0.22em] font-semibold hover:bg-[#3ab0ad] transition-all rounded-full"
              >
                Send screenshot on WhatsApp
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href={`/track-order?id=${orderId}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-accent text-white text-[10px] uppercase font-mono tracking-[0.25em] font-semibold hover:bg-[#3ab0ad] transition-all rounded-full shadow-xl flex items-center justify-center gap-2"
            >
              <span>Track Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/15 text-white/80 hover:text-white hover:border-white/30 text-[10px] uppercase font-mono tracking-[0.25em] font-medium transition-all rounded-full"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <p className="mt-8 text-[9px] uppercase font-mono tracking-[0.3em] text-white/30">
          WEARITION — WEAR YOUR IDENTITY
        </p>
      </motion.div>
    </div>
  );
}
