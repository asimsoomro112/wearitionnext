'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURED_DROPS = [
  {
    id: 'faraz-manan-velvet-bridal',
    title: 'Faraz Manan Heirloom Velvet Bridal',
    category: 'Bespoke Atelier',
    season: 'Hand Zardozi • Karachi Studio',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    href: '/shop',
  },
  {
    id: 'elan-organza-peshwas',
    title: 'Élan Handcrafted Silk Peshwas Suite',
    category: 'Haute Couture',
    season: 'Gold Tilla & Dabka • Certified Authentic',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    href: '/shop',
  },
  {
    id: 'sana-safinaz-noir-gala',
    title: 'Sana Safinaz Midnight Sculptural Gown',
    category: 'Luxury Evening',
    season: 'Limited 1 of 1 • French Velvet',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    href: '/shop',
  },
  {
    id: 'zara-shahjahan-festive-ensemble',
    title: 'Zara Shahjahan Festive Raw Silk Kurta',
    category: 'Ready-to-Wear',
    season: 'Iconic Signature • Express Dispatch',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    href: '/shop',
  },
];

interface SelectedDropsProps {
  products?: any[];
}

export function SelectedDrops({ products = [] }: SelectedDropsProps) {
  const drops = products.length >= 4
    ? products.slice(0, 4).map((p, idx) => ({
        id: p.id,
        title: p.title || 'Maison Couture Creation',
        category: p.category || p.brand || 'Bespoke Couture',
        season: p.isNew ? 'New Archive Drop' : 'Certified Authentic',
        image: p.images?.[0] || p.image || FEATURED_DROPS[idx % FEATURED_DROPS.length].image,
        href: `/product/${p.id}`,
      }))
    : FEATURED_DROPS;

  return (
    <section id="drops" className="relative w-full bg-[#030303] text-[#fafafa] py-24 md:py-36 px-6 md:px-12 border-t border-white/5 overflow-hidden">

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section [02] Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-12 sm:mb-16">
          <div className="flex items-center gap-4">
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#adadad] font-mono">
              [02] CURATED ARCHIVE &bull; ICONIC DROPS
            </span>
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#adadad]">
            AUTHENTIC LUXURY
          </span>
        </div>

        {/* Cards with giant watermark sliding behind them (XODEX: upper half above, lower half behind) */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -top-12 md:-top-28 left-0 right-0 z-0 overflow-hidden pointer-events-none select-none"
          >
            <div className="animate-watermark whitespace-nowrap font-display font-bold uppercase tracking-tighter leading-none text-white opacity-[0.08] text-[6rem] sm:text-[9rem] md:text-[14rem]">
              <span className="pr-10">WEARITION &bull;</span>
              <span className="pr-10">WEARITION &bull;</span>
              <span className="pr-10">WEARITION &bull;</span>
              <span className="pr-10">WEARITION &bull;</span>
            </div>
          </div>

          {/* 2-Column Showcase Grid (Desktop Optimized) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 relative z-10">
          {drops.map((drop, idx) => (
            <motion.div
              key={`${drop.id}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link
                href={drop.href}
                className="group block relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] aspect-[16/11] md:aspect-[4/3] lg:min-h-[480px] shadow-2xl"
              >
                {/* Full Bleed Fashion Image with Zoom */}
                <img
                  src={drop.image}
                  alt={drop.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                {/* Central Hover Pill */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90 transition-all duration-300 px-7 py-3 rounded-full bg-white text-black font-semibold text-xs tracking-[0.22em] uppercase shadow-2xl flex items-center gap-2">
                    <span>VIEW PROJECT</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Content Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-3">
                    <h3 
                      className="text-lg sm:text-xl lg:text-2xl font-light text-white tracking-wide uppercase group-hover:translate-x-1 transition-transform duration-300"
                      style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
                    >
                      {drop.title}
                    </h3>
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-white/20 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 shrink-0 ml-4">
                      <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[#adadad] pt-3.5 border-t border-white/10 font-mono">
                    <span>{drop.category}</span>
                    <span>{drop.season}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Section Bottom Context & Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-16 mt-16 border-t border-white/10">
          <p className="text-sm font-sans text-[#adadad] max-w-xl leading-relaxed">
            Where ancestral craftsmanship meets contemporary silhouette &mdash; step into our complete archive of authenticated designer ensembles and bespoke commissions.
          </p>

          <Link
            href="/shop"
            className="buttonprimary"
          >
            <span>DISCOVER FULL ARCHIVE ↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
