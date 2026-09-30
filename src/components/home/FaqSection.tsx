'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQS = [
  {
    q: 'How do I place an order or commission a bespoke bridal ensemble?',
    a: 'Ready-to-wear and curated archive pieces can be acquired directly through our online store. For bespoke bridal or formal couture, contact our atelier concierge via WhatsApp or through our Contact page to schedule an in-person fitting in Karachi or a virtual consultation worldwide.',
  },
  {
    q: 'Are all designer resale and preloved collections 100% authentic?',
    a: 'Yes, unequivocally. Every garment undergoes rigorous multi-point physical verification by our in-house textile specialists, verifying fabric weave, designer hallmarks, zardozi embroidery quality, and brand provenance before being listed.',
  },
  {
    q: 'What are your delivery timelines across Pakistan and internationally?',
    a: 'Ready-to-wear and archive drops ship within 24–48 hours, arriving in 3–5 business days across Pakistan via express courier. International orders ship via DHL Express (4–7 business days). Custom bespoke bridal ensembles require 3–6 weeks depending on hand embroidery.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD) for domestic orders across Pakistan, direct Online Bank Transfers, all major Credit/Debit Cards, and international remittances/wire transfers for our global patrons.',
  },
  {
    q: 'Can I provide my own measurements for custom stitching?',
    a: 'Yes. Our master atelier tailors provide personalized custom sizing. You can submit your exact bust, waist, hip, and length measurements during checkout or coordinate directly with our team via WhatsApp for custom fittings.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'Ready-to-wear garments in original unworn condition with intact security tags can be exchanged within 7 days in case of verified defects. Custom bespoke bridal creations are altered to perfection until complete patron satisfaction.',
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative w-full bg-[#030303] text-[#fafafa] py-24 md:py-36 px-6 md:px-12 border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        {/* Section [06] Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-12 sm:mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#adadad]">
            [06]
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
            Clear answers. No surprises.
          </h2>
        </div>

        {/* 2-Column Collapsible FAQ Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden transition-colors duration-300 hover:border-white/20"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-6 sm:p-8 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-medium text-white/90 tracking-tight">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-white/15 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-white text-black' : 'text-white/60'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
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
                      <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 border-t border-white/5">
                        <p className="text-xs sm:text-sm font-sans text-[#adadad] leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
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
