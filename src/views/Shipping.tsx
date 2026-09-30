"use client";
import { motion } from 'framer-motion';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { Truck, MapPin, ShieldCheck, Clock } from 'lucide-react';

export function Shipping() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-background min-h-screen">
      <SEO title="Shipping Information" description="Learn about Wearition's shipping policies across Pakistan." />
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-20">
          <span className="text-accent text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Logistics</span>
          <TextReveal as="h1" className="font-serif text-4xl sm:text-5xl md:text-7xl text-foreground mb-8">Shipping</TextReveal>
          <div className="h-px w-full bg-border-color/30"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-accent mt-1" />
              <div>
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground mb-3">Domestic Coverage</h2>
                <p className="text-sm text-foreground/60 leading-relaxed">We deliver across all major cities in Pakistan, including Karachi, Lahore, Islamabad, and beyond. Our logistics partners ensure safe delivery to your doorstep.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-accent mt-1" />
              <div>
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground mb-3">Delivery Timeline</h2>
                <p className="text-sm text-foreground/60 leading-relaxed">Orders are typically processed within 24-48 hours. Delivery takes 3-5 business days depending on your location.</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <Truck className="w-6 h-6 text-accent mt-1" />
              <div>
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground mb-3">Shipping Rates</h2>
                <p className="text-sm text-foreground/60 leading-relaxed">Standard shipping is FREE on orders above PKR 10,000. For orders below this amount, a flat rate of PKR 250 applies nationwide.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-accent mt-1" />
              <div>
                <h2 className="uppercase text-[11px] tracking-[0.2em] font-bold text-foreground mb-3">Order Tracking</h2>
                <p className="text-sm text-foreground/60 leading-relaxed">Once your order is dispatched, you will receive a tracking number via email/SMS to monitor your shipment in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
