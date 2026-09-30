'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ATELIER_DISCIPLINES = [
  {
    number: '01',
    title: 'Bespoke Bridal & Couture',
    subtitle: 'Private fitting sessions, bespoke bridal ensembles, and master artisan hand-embroidery (zardozi, tilla, mukesh) tailored to your exact measurements.',
    tag: 'Made-to-Order',
    href: '/contact',
  },
  {
    number: '02',
    title: 'Curated Designer Resale',
    subtitle: '100% physically authenticated preloved and archive collections from Pakistan’s most revered luxury houses at transparent value.',
    tag: 'Certified Authentic',
    href: '/shop',
  },
  {
    number: '03',
    title: 'White-Glove Global Concierge',
    subtitle: 'Worldwide insured express dispatch via DHL to patrons across the US, UK, UAE, Canada, and Europe with custom tailoring and styling support.',
    tag: 'Worldwide Dispatch',
    href: '/contact',
  },
];

export function AtelierDisciplines() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="atelier" className="relative w-full bg-[#030303] text-[#fafafa] py-24 md:py-36 px-6 md:px-12 border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        {/* XODEX Top Section Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-12 sm:mb-16">
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#adadad]">
            OUR DISCIPLINES &bull; MAISON EXPERTISE
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#adadad]">
            [03]
          </span>
        </div>

        {/* XODEX Massive Service Rows */}
        <div className="flex flex-col">
          {ATELIER_DISCIPLINES.map((item, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link
                  href={item.href}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`group relative flex flex-col md:flex-row md:items-center justify-between py-12 md:py-16 border-b border-white/10 transition-all duration-500 ${
                    hoveredIdx !== null && !isHovered ? 'opacity-25' : 'opacity-100'
                  }`}
                >
                  {/* Left: Glowing Dot + Massive Typography */}
                  <div className="flex items-center gap-6 md:gap-10">
                    {/* XODEX Cyan-Emerald Glow Dot */}
                    <div className="servicedot" />

                    <div>
                      <h3 
                        className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[5rem] font-light tracking-wide uppercase text-white group-hover:translate-x-3 transition-transform duration-500 leading-[1.1]"
                        style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-sans text-[#adadad] mt-2 md:mt-3 max-w-xl">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Pill Tag & Arrow */}
                  <div className="flex items-center gap-4 mt-6 md:mt-0 pl-10 md:pl-0">
                    <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#adadad] px-3.5 py-1.5 rounded-full border border-white/10 hidden sm:inline-block">
                      {item.tag}
                    </span>

                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 shrink-0">
                      <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
