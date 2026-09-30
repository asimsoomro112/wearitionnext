'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REVIEWS = [
  {
    id: 1,
    quote:
      'From the first private consultation to the final bridal fitting, the entire atelier experience was breathtaking. The hand-embroidered velvet gown exceeded every expectation on my wedding day.',
    author: 'Dr. Ayla Mansoor',
    role: 'Bridal Patron & Collector',
    location: 'London & Lahore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'WEARITION has completely redefined luxury fashion for modern women. The drape, the silk lining, and the bespoke finish are on par with historic European couture ateliers.',
    author: 'Sonia Al-Hashemi',
    role: 'Gala & Gala Evening Patron',
    location: 'Dubai & Milan',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'The white-glove packaging, swift international delivery to Manhattan, and artisanal embroidery quality were astonishing. Every single garment feels like wearable sculpture.',
    author: 'Zara K. Qureshi',
    role: 'Haute Couture Collector',
    location: 'New York & Karachi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    rating: 5,
  },
  {
    id: 4,
    quote:
      'Finding authentic designer resale and custom bridal creations with guaranteed fabric authenticity used to be difficult. WEARITION is the gold standard.',
    author: 'Natasha D. Vane',
    role: 'Private Client',
    location: 'Geneva & Islamabad',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    rating: 5,
  },
];

export function ClientTestimonials() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % REVIEWS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const activeReview = REVIEWS[currentIdx];

  return (
    <section id="reviews" className="relative w-full bg-[#030303] text-[#fafafa] py-24 md:py-36 px-6 md:px-12 border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        {/* Section [04] Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-12 sm:mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#adadad]">
            [04]
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
            Built on trust. Driven by quality. Delivered with precision.
          </h2>
        </div>

        {/* Content Layout: Left Stats Card + Right Testimonial Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
          {/* Left Stats Card (XODEX cardstats) */}
          <div className="lg:col-span-4 p-8 sm:p-10 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between shadow-2xl">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#adadad] block font-mono mb-4">
                SATISFIED PATRONS
              </span>

              {/* 5 Stars */}
              <div className="flex items-center gap-1.5 mb-6 text-white">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-white stroke-white" />
                ))}
              </div>

              {/* Score */}
              <div className="text-5xl sm:text-6xl font-display font-semibold text-white tracking-tight mb-2">
                4.9<span className="text-2xl text-[#adadad] font-mono font-normal">/5</span>
              </div>

              <p className="text-xs text-[#adadad] font-sans tracking-wide">
                4.9★ &bull; 2,500+ Verified Worldwide Patrons
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 flex items-center gap-2 text-[#adadad] text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-[#339e9b]" />
              <span>Certified Haute Couture Authenticity</span>
            </div>
          </div>

          {/* Right Testimonial Slider (XODEX testimonial-slider-large) */}
          <div
            className="lg:col-span-8 p-8 sm:p-12 rounded-xl border border-white/10 bg-[#0d0d0d] flex flex-col justify-between shadow-2xl relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Active Quote Content */}
            <div className="relative min-h-[200px] sm:min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeReview.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col justify-between h-full"
                >
                  <p className="text-lg sm:text-2xl md:text-3xl font-normal text-white/95 leading-relaxed tracking-tight">
                    &ldquo;{activeReview.quote}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
                    {/* Author Profile */}
                    <div className="flex items-center gap-4">
                      <img
                        src={activeReview.avatar}
                        alt={activeReview.author}
                        className="w-12 h-12 rounded-full object-cover grayscale border border-white/20"
                      />
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-white tracking-wide">
                          {activeReview.author}
                        </h4>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-[#adadad] block font-mono">
                          {activeReview.role} &bull; {activeReview.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Controls: Arrows & Indicators */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-6">
              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentIdx === i ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Chevrons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  aria-label="Previous Review"
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center text-white/70 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next Review"
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center text-white/70 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
