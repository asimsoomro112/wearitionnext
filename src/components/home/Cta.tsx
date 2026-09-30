"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

export function Cta() {
  return (
    <section className="py-28 md:py-44 relative overflow-hidden">
      {/* faint backdrop text */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center font-display font-extrabold uppercase text-outline whitespace-nowrap text-[18vw] leading-none select-none pointer-events-none"
      >
        Wearition
      </div>
      <div className="section-shell relative text-center">
        <Reveal as="div" className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold uppercase tracking-tight leading-[1.02] text-4xl md:text-6xl text-white">
            Let's create something timeless.
          </h2>
        </Reveal>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-white text-black font-semibold uppercase tracking-[0.12em] text-sm rounded-xl min-w-[280px] h-[64px] px-10 hover:bg-[#339e9b] hover:text-white transition-colors duration-300"
          >
            Shop the collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
