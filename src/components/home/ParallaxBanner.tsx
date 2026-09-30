"use client";
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from '@/components/Reveal';

const IMG =
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop';

export function ParallaxBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section ref={ref} className="py-12 md:py-20">
      <div className="section-shell">
        <div className="relative h-[70vh] md:h-[88vh] rounded-2xl overflow-hidden">
          <motion.img
            src={IMG}
            alt="Wearition craft"
            style={{ scale, y }}
            className="absolute inset-0 w-full h-[116%] object-cover -top-[8%]"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <Reveal as="div" className="max-w-4xl">
              <h2 className="font-display font-bold uppercase tracking-tight leading-[1.05] text-white text-4xl md:text-7xl">
                Crafted for the modern wardrobe
              </h2>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
