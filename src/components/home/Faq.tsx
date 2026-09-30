"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Orders are dispatched within 24 hours and delivered across Pakistan in 3–5 working days. You can track your order anytime from the Track Order page.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Cash on Delivery (COD), EasyPaisa, JazzCash and direct bank transfer. No advance needed for COD orders.',
  },
  {
    q: 'Can I exchange or return a suit?',
    a: 'Yes — 7-day easy exchange for size issues, as long as the suit is unworn with tags intact. See our Returns page for the full policy.',
  },
  {
    q: 'How do I find my size?',
    a: 'Each product page lists detailed measurements. If you are between sizes, we recommend sizing up for eastern cuts — or message us on WhatsApp and we will guide you.',
  },
  {
    q: 'Are the colours accurate in photos?',
    a: 'We photograph every suit in natural light and review images before publishing. Slight variation can occur between screens.',
  },
  {
    q: 'Do you deliver to my city?',
    a: 'We deliver all across Pakistan through trusted couriers — from Karachi to Khyber.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-36">
      <div className="section-shell">
        <SectionHeader
          index="03"
          eyebrow="FAQ"
          title="Questions, answered"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-lg border transition-colors duration-300 ${
                  isOpen ? 'bg-[#1a1a1a] border-white/10' : 'bg-[#262626] border-transparent'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 md:px-8 py-6"
                >
                  <span className="font-medium text-white text-base md:text-lg">{f.q}</span>
                  <span
                    className={`shrink-0 w-9 h-9 rounded-full border border-white/15 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? 'rotate-45 bg-[#339e9b] border-[#339e9b]' : ''
                    }`}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 md:px-8 pb-7 text-white/60 text-sm md:text-base leading-relaxed">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
