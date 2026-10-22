'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Add your favourite suits to the bag and check out — or message us on WhatsApp and we\u2019ll place the order for you. You can pay with Cash on Delivery, EasyPaisa, JazzCash, or direct bank transfer.',
  },
  {
    q: 'Are the suits stitched or unstitched?',
    a: 'Most of our suits are unstitched 3-piece sets — every product page lists exactly what\u2019s included (shirt, trouser, dupatta and embroidery details). If a piece is stitched / ready-to-wear, it\u2019s clearly mentioned on its product page.',
  },
  {
    q: 'What are your delivery timelines across Pakistan?',
    a: 'Orders are processed within 24\u201348 hours and delivered in 3\u20135 business days anywhere in Pakistan. Shipping is Rs. 250 for the first suit plus Rs. 50 for each additional suit, and free on orders of Rs. 12,500 or more. You\u2019ll receive a tracking number by SMS/email once your order is dispatched.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD) anywhere in Pakistan, EasyPaisa, JazzCash, and direct bank transfer.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is dispatched, you\u2019ll get a tracking number by SMS and email. You can also enter your order ID on our Track Order page to see the latest status.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'If your item arrives defective, damaged, or you received the wrong item, contact us within 7 days of delivery with a photo or video of the issue. Items must be unused, unworn, and in their original packaging with tags intact. Sale items are only eligible if there\u2019s a manufacturing defect.',
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
            [04]
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
