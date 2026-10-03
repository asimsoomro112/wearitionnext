'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function GrandCta() {
  return (
    <section className="relative w-full bg-[#030303] text-[#fafafa] py-28 md:py-44 px-6 md:px-12 border-t border-white/5 overflow-hidden text-center flex flex-col items-center justify-center">
      
      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Section [07] Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="text-[12px] font-mono uppercase tracking-[0.28em] text-[#adadad] block letterspacing4px">
            [07] PRIVATE COMMISSIONS
          </span>
        </motion.div>

        {/* Clean Luxury Triplet Headline */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-light uppercase tracking-wider text-white leading-[0.95] mb-6 sm:mb-8 select-none"
          style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
        >
          WEAR YOUR<br />
          IDENTITY<br />
          <span className="text-accent">TIMELESSLY.</span>
        </motion.h2>

        <p className="text-xs sm:text-sm font-sans text-[#adadad] max-w-xl mx-auto mb-12 sm:mb-16 leading-relaxed">
          Whether acquiring a certified preloved designer heirloom or commissioning a bespoke bridal masterpiece, our Karachi master artisans are at your service.
        </p>

        {/* Action Button (Exact XODEX 8px geometry) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/contact"
            className="buttonprimary group inline-flex items-center gap-3 cursor-pointer"
          >
            <span>BOOK A CONSULTATION</span>
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
        </motion.div>
      </div>
    </section>
  );
}
