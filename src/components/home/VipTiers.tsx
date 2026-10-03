'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export function VipTiers() {
  return (
    <section id="pricing" className="relative w-full bg-[#030303] text-[#fafafa] py-28 md:py-40 lg:py-48 px-6 md:px-16 border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        {/* Section [05] Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-12 sm:mb-16">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight uppercase"
            style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
          >
            ATELIER COMMISSIONS &bull; ACQUISITION TIERS
          </h2>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#adadad]">
            [05]
          </span>
        </div>

        {/* 2-Column Pricing Tier Cards: Stark White vs Jet Black (Exact XODEX contrast) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-14">
          
          {/* Tier 1: READY-TO-WEAR & CURATED ARCHIVE (Stark White Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="pricingitem-light flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-black/60 font-semibold">
                  IMMEDIATE DISPATCH &bull; CAPSULE DROPS
                </span>
              </div>

              <h3 
                className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black mb-3"
                style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
              >
                Curated Archive &amp; Pret
              </h3>
              <p className="text-xs sm:text-sm text-black/65 font-sans mb-8 leading-relaxed max-w-lg">
                Verified preloved designer heirlooms, festive raw silk separates, and ready-to-wear luxury drops available for immediate acquisition.
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 text-black mb-8 pb-8 border-b border-black/10">
                <span className="text-xs font-mono uppercase tracking-widest text-black/50">FROM</span>
                <span 
                  className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight"
                  style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
                >
                  PKR 25,000
                </span>
              </div>

              {/* Features List in 2 Columns on Desktop */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-10 text-xs sm:text-sm text-black/85 font-sans">
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>100% Certified Designer Physical Verification</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>Express Dispatch Nationwide (24–48 Hours)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>Free Shipping on Orders Above PKR 10,000</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>7-Day Defect &amp; Exchange Guarantee</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>Breathable Archival Dust Bag &amp; Cedar Hanger</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>Cash on Delivery (COD) &amp; Bank Transfer</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>Millimeter Sizing Chart &amp; Fit Assistance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span>Dedicated WhatsApp Tracking Concierge</span>
                </li>
              </ul>
            </div>

            {/* Black Button on White Card */}
            <Link
              href="/shop"
              className="w-full h-13 rounded-lg bg-[#030303] text-white flex items-center justify-center uppercase font-mono text-xs font-semibold tracking-[0.2em] hover:bg-black/85 transition-all cursor-pointer shadow-lg"
            >
              <span>EXPLORE READY-TO-WEAR &rarr;</span>
            </Link>
          </motion.div>

          {/* Tier 2: BESPOKE BRIDAL & COUTURE (XODEX Jet Black Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="pricingitem-dark flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-[#339e9b] font-semibold">
                  MAISON ATELIER &bull; PRIVATE CLIENT
                </span>
              </div>

              <h3 
                className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white mb-3"
                style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
              >
                Bespoke Bridal &amp; Couture
              </h3>
              <p className="text-xs sm:text-sm text-[#adadad] font-sans mb-8 leading-relaxed max-w-lg">
                Museum-grade made-to-order bridal ensembles, hand-embroidered zardozi silhouettes, and personalized master tailor fittings.
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 text-white mb-8 pb-8 border-b border-white/10">
                <span 
                  className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white"
                  style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
                >
                  BESPOKE COMMISSION
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-[#adadad] ml-2">/ By Consultation</span>
              </div>

              {/* Features List in 2 Columns on Desktop */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-10 text-xs sm:text-sm text-white/90 font-sans">
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>1-on-1 Master Tailor Fitting Consultation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Ancestral Embroidery: Zardozi, Tilla &amp; Mukesh</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Pure Fabrics: French Velvet, Raw Silk &amp; Organza</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Custom Silhouette Patterning &amp; Exact Measurements</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Multi-Stage Video Milestone Fitting Reviews</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Worldwide Insured Express Delivery (DHL Express)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Alterations to Perfection Guarantee</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>24/7 VIP Personal Stylist WhatsApp Line</span>
                </li>
              </ul>
            </div>

            {/* White Button on Dark Card */}
            <Link
              href="/contact"
              className="w-full h-13 rounded-lg bg-white text-black flex items-center justify-center uppercase font-mono text-xs font-semibold tracking-[0.2em] hover:bg-white/90 transition-all cursor-pointer shadow-lg"
            >
              <span>BOOK BRIDAL CONSULTATION &rarr;</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
