'use client';

import { motion } from 'framer-motion';

const PARTNER_BRANDS = [
  'FARAZ MANAN',
  'SANA SAFINAZ',
  'ÉLAN',
  'MARIA.B',
  'ZARA SHAHJAHAN',
  'HUSSAIN REHAR',
  'SUFFUSE',
  'FAIZA SAQLAIN',
  'REPUBLIC WOMENSWEAR',
  'ALI XEESHAN',
  'ASIM JOFA',
  'BAREEZE',
];

export function BrandManifesto() {
  const marqueeBrands = [...PARTNER_BRANDS, ...PARTNER_BRANDS, ...PARTNER_BRANDS];

  return (
    <section id="about" className="relative w-full bg-[#030303] text-[#fafafa] py-28 md:py-40 lg:py-48 px-6 md:px-16">
      <div className="container mx-auto max-w-6xl text-center">
        {/* Section [01] Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 lg:mb-12"
        >
          <span className="text-[11px] md:text-xs font-mono uppercase tracking-[0.3em] text-[#adadad] block letterspacing4px">
            [01] MAISON WEARITION &bull; ATELIER PHILOSOPHY
          </span>
        </motion.div>

        {/* Headline matching XODEX .h2 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-[4.2rem] font-light text-center leading-[1.22] tracking-tight text-[#fafafa] max-w-5xl mx-auto"
        >
          Founded on the philosophy of{' '}
          <span className="text-white underline decoration-white/40 decoration-1 underline-offset-8 font-normal">
            Wear Your Identity
          </span>
          . We bridge ancestral South Asian needlecraft with contemporary haute couture, curating certified luxury that remains{' '}
          <span className="text-white underline decoration-white/40 decoration-1 underline-offset-8 font-normal">
            timeless
          </span>
          .
        </motion.h2>

        {/* Exact XODEX 100px Divider */}
        <div className="w-[110px] h-[1px] bg-white/20 mx-auto my-16 lg:my-20" />

        {/* Trusted By Label */}
        <span className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-[#adadad] block font-mono mb-10">
          REVERED HOUSES &bull; CURATED COLLECTIONS
        </span>
      </div>

      {/* Infinite Horizontal Designer Brands Marquee */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Gradient Shadows */}
        <div className="grandientmarqueeleft" />
        <div className="gradientmarqueeright" />

        <div className="animate-marquee-logos flex gap-12 sm:gap-16 items-center">
          {marqueeBrands.map((brand, i) => (
            <div key={`${brand}-${i}`} className="flex items-center gap-12 sm:gap-16 shrink-0 group">
              <span 
                className="text-lg sm:text-xl font-mono tracking-[0.22em] uppercase text-[#adadad]/60 group-hover:text-white transition-colors duration-300 select-none"
              >
                {brand}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
