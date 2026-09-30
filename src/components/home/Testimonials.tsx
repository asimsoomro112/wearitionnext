"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { FadeUp } from '@/components/Reveal';

const REVIEWS = [
  {
    name: 'Ahmed Raza',
    role: 'Verified buyer · Lahore',
    quote:
      'Fabric quality is genuinely premium for the price. The stitching is clean and delivery reached in three days.',
  },
  {
    name: 'Bilal Sheikh',
    role: 'Verified buyer · Karachi',
    quote:
      'Ordered two suits for Eid — both fit exactly as sized. Customer support on WhatsApp replied within minutes.',
  },
  {
    name: 'Usman Tariq',
    role: 'Verified buyer · Islamabad',
    quote:
      'The colour in the photos matches the actual suit. Rare for online shopping in Pakistan. Will order again.',
  },
  {
    name: 'Danish Ali',
    role: 'Verified buyer · Faisalabad',
    quote:
      'Cash on delivery, easy exchange, no drama. This is how online stores should operate.',
  },
];

function Stars() {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#339e9b] text-[#339e9b]" />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % REVIEWS.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-24 md:py-36">
      <div className="section-shell">
        <SectionHeader
          index="02"
          eyebrow="Reviews"
          title="Satisfied customers"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* stat card */}
          <FadeUp>
          <div className="bg-[#fafafa] text-black rounded-[28px] p-10 md:p-12 flex flex-col justify-between min-h-[380px]">
            <div>
              <p className="font-display font-extrabold text-7xl md:text-8xl leading-none">4.9</p>
              <p className="text-black/50 text-sm uppercase tracking-[0.2em] mt-2">/ 5 rating</p>
            </div>
            <div>
              <Stars />
              <p className="mt-4 text-black/60 text-sm leading-relaxed">
                Based on verified orders across Pakistan — COD, EasyPaisa and bank transfer.
              </p>
            </div>
          </div>
          </FadeUp>

          {/* slider */}
          <FadeUp delay={0.12} className="lg:col-span-2">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#fafafa] text-black rounded-[14px] p-10 md:p-12 min-h-[380px] flex flex-col justify-between"
              >
                <div>
                  <Quote className="w-8 h-8 text-[#339e9b] mb-6" />
                  <p className="text-xl md:text-2xl leading-relaxed font-light">
                    “{REVIEWS[active].quote}”
                  </p>
                </div>
                <div className="mt-8">
                  <p className="font-semibold">{REVIEWS[active].name}</p>
                  <p className="text-black/50 text-sm mt-1">{REVIEWS[active].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-6 justify-center lg:justify-start">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Review ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'w-10 bg-[#339e9b]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
