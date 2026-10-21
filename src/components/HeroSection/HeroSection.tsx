'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getOptimizedImage } from '@/lib/images';

interface HeroSectionProps {
  products?: any[];
}

export default function HeroSection({ products = [] }: HeroSectionProps) {
  // Real store products only — never stock-photo stand-ins presented as
  // inventory. With few products, repeat them so the marquee still loops.
  const showcaseItems = (products || []).map((p, idx) => ({
    id: p.id,
    title: p.title || 'Wearition Product',
    category: p.category || p.brand || 'Women',
    tag: p.isNew ? 'New In' : 'Featured',
    image: p.images?.[0] || p.image || '',
    href: `/product/${p.id}`,
  })).filter(item => item.image);

  const doubled = [...showcaseItems, ...showcaseItems];
  const loopedItems = showcaseItems.length > 0 && showcaseItems.length < 4
    ? [...doubled, ...doubled]
    : doubled;

  return (
    <section id="home" className="relative w-full overflow-hidden bg-[#030303] text-[#fafafa] pt-36 md:pt-48 pb-20">
      
      {/* Hero Center Text & Actions Suite (Desktop Expansive) */}
      <div className="w-full px-6 md:px-12 xl:px-20 relative z-20 text-center max-w-[1440px] mx-auto mb-16 lg:mb-24">
        
        {/* Eyebrow Label with 4px Letter Spacing */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="text-[11px] md:text-xs font-mono uppercase tracking-[0.3em] text-[#adadad] inline-block mr-[-0.3em]">
            <span className="block sm:inline">Wear Your Identity</span>
            <span className="hidden sm:inline text-accent"> &bull; </span>
            <span className="block sm:inline mt-2 sm:mt-0">Pakistan&apos;s Top Clothing Brands</span>
          </span>
        </motion.div>

        {/* Massive Clean Luxury Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="headinghero select-none my-4"
        >
          WEARITION
        </motion.h1>

        {/* Subtitle & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="subheading-xodex mt-4 mr-[-0.22em]">
            <span className="inline-block whitespace-nowrap">Branded Suits</span>
            <span> &bull; </span>
            <span className="inline-block whitespace-nowrap">New Collections</span>
            <span> &bull; </span>
            <span className="inline-block whitespace-nowrap">Cash on Delivery</span>
          </div>

          <div className="dividerhero" />

          {/* Dual Action Buttons (Exact XODEX rectangular geometry with 8px radius) */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 mt-8">
            <Link
              href="/shop"
              className="buttonprimary"
            >
              <span>SHOP NOW ↗</span>
            </Link>

            <Link
              href="/brands"
              className="buttonsecondary group"
            >
              <span>SHOP BY BRAND</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              >
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Signature XODEX Curved Runway Carousel — pulled up behind the title (XODEX overlap) */}
      <div className="relative w-full overflow-hidden -mt-56 md:-mt-80 lg:-mt-96">
        
        {/* Top Inverted Oval Curve Horizon */}
        <div className="outer-curve-top" />

        {/* Readability fade where the title/buttons overlap the images */}
        <div className="absolute top-0 left-0 right-0 h-72 md:h-[28rem] bg-gradient-to-b from-[#030303] via-[#030303]/55 to-transparent pointer-events-none" />

        {/* Dim the runway photos so the title stays dominant */}
        <div className="absolute inset-0 bg-[#030303]/45 pointer-events-none" />

        {/* Left & Right Gradient Shadows */}
        <div className="grandientmarqueeleft" />
        <div className="gradientmarqueeright" />

        {/* Infinite Horizontal Carousel */}
        <div className="flex overflow-hidden py-6">
          <div className="flex gap-6 sm:gap-8 shrink-0 animate-marquee-infinite">
            {loopedItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                aria-hidden="true"
                className="project-card-2 block bg-[#0d0d0d] shadow-2xl shrink-0 select-none"
              >
                {/* Image */}
                <img
                  src={getOptimizedImage(item.image, 700)}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover grayscale-[15%] contrast-[1.05]"
                />

                {/* Dark Vignette Bottom Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* XODEX Floating Project Label */}
                <div className="floatinglabelnameproject">
                  <div className="projectname">{item.title}</div>
                  <div className="textcategory">{item.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
