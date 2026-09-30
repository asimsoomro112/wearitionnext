'use client';

import { motion } from 'framer-motion';

export function ParallaxVignette() {
  return (
    <section className="relative w-full h-[450px] sm:h-[550px] md:h-[650px] overflow-hidden flex items-center justify-center border-y border-white/5 bg-[#030303]">
      {/* Background High-Fashion Visual */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop"
          alt="Luxury Haute Couture"
          loading="lazy"
          className="w-full h-full object-cover grayscale-[25%] contrast-[1.1] scale-105"
        />
        {/* Cinematic Noir Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-black/30 to-[#030303]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Floating Typographic Vignette Phrases (XODEX containerphrases) */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-4 sm:gap-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-medium tracking-tight text-white drop-shadow-2xl"
          style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
        >
          Wear Your Identity.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-base md:text-lg font-mono uppercase tracking-[0.3em] text-[#adadad]"
        >
          ANCESTRAL HERITAGE &bull; UNCOMPROMISING COUTURE &bull; GLOBAL DISPATCH
        </motion.p>
      </div>
    </section>
  );
}
