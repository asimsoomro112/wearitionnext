import { motion } from 'framer-motion';
import { SEO } from '../components/layout/SEO';
import { TextReveal } from '../components/layout/TextReveal';
import { BadgeCheck, PackageSearch, HandCoins, Truck } from 'lucide-react';
import Link from 'next/link';

export function About() {
  return (
    <div className="w-full pt-40 px-6 md:px-12 pb-32 bg-[#030303] text-[#fafafa] min-h-screen">
      <SEO
        title="Our Story"
        description="WEARITION — Pakistan's curated designer fashion store. 100% original branded suits, quality-checked and delivered nationwide with cash on delivery."
      />

      <div className="max-w-[1100px] mx-auto">
        {/* Eyebrow & Title */}
        <header className="mb-16 md:mb-24 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#adadad] block mb-4">
            [01] — Our Story
          </span>
          <TextReveal as="h1" className="font-serif text-4xl sm:text-6xl md:text-7xl text-white mb-6 text-center">
            Wear Your Identity
          </TextReveal>
          <p className="text-base sm:text-lg font-sans text-[#adadad] max-w-2xl mx-auto leading-relaxed">
            WEARITION is a curated fashion store bringing Pakistan&apos;s most loved designer brands
            to your doorstep — handpicked, quality-checked, and honestly priced.
          </p>
        </header>

        {/* Narrative Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 text-white/80 font-sans leading-relaxed text-base sm:text-lg mb-20 max-w-3xl mx-auto"
        >
          <p>
            Finding original branded suits online shouldn&apos;t be a gamble. Too many stores sell
            copies labeled as originals, use stolen pictures, or disappear after taking your money.
            WEARITION exists to fix that — every piece in our collection is handpicked from trusted
            suppliers and verified before it reaches you.
          </p>
          <p>
            We curate suits from Pakistan&apos;s most respected names — Beechtree, Maria B, Asim Jofa,
            Baroque, Charizma, and more. Each design is photographed, inspected for fabric and
            stitching quality, and listed only if it meets our standard. What you see is what arrives
            at your door.
          </p>
          <p>
            Based in Karachi, we deliver all across Pakistan with cash on delivery, EasyPaisa,
            JazzCash, and bank transfer. No advance-payment anxiety — pay when your suit is in
            your hands.
          </p>
        </motion.div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <BadgeCheck className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">100% Original</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Only authentic branded suits from trusted suppliers. No copies, no replicas — ever.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">01 &bull; Authentic</span>
          </div>

          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <PackageSearch className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">Quality Checked</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Every suit is inspected for fabric, stitching, and finishing before it gets listed.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">02 &bull; Verified</span>
          </div>

          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <HandCoins className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">Honest Pricing</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Direct sourcing means fair prices — premium brands without the premium markup games.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">03 &bull; Fair</span>
          </div>

          <div className="p-8 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between">
            <div>
              <Truck className="w-6 h-6 text-[#339e9b] mb-4" />
              <h3 className="font-serif text-lg text-white mb-2 uppercase tracking-wide">Nationwide COD</h3>
              <p className="text-xs text-[#adadad] leading-relaxed">Cash on delivery all across Pakistan. Pay only when your suit is in your hands.</p>
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-6">04 &bull; Delivered</span>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center pt-12 border-t border-white/10">
          <span className="text-xs uppercase tracking-[0.25em] font-mono text-[#adadad] block mb-4">
            [02] — Start Exploring
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="buttonprimary">
              <span>SHOP THE COLLECTION ↗</span>
            </Link>
            <Link href="/contact" className="buttonsecondary">
              <span>CONTACT US</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
